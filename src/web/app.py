from fastapi import FastAPI, Request, Form, File, UploadFile, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import json
import yaml
import logging
from pathlib import Path

# Import our core modules
import sys
sys.path.append(str(Path(__file__).parent.parent))

from core.config_manager import ContextSystemConfig
from core.vector_manager import VectorManager
from core.knowledge_manager import SubConsciousKnowledgeManager

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Context-Aware AI Agent Manager", version="1.0.0")

# Setup templates and static files
templates = Jinja2Templates(directory="src/web/templates")
app.mount("/static", StaticFiles(directory="src/web/static"), name="static")

# Initialize core components
config = ContextSystemConfig()
vector_manager = VectorManager()
knowledge_manager = SubConsciousKnowledgeManager()

# Pydantic models
class AgentConfig(BaseModel):
    name: str
    model_name: str
    base_model: str
    specialization: str
    system_prompt: str
    context_injection_enabled: bool = True
    learning_enabled: bool = True
    max_context_items: int = 5

class ModelUpload(BaseModel):
    name: str
    description: str
    base_model: str
    modelfile_content: str

# Routes
@app.get("/", response_class=HTMLResponse)
async def dashboard(request: Request):
    """Main dashboard showing all agents and system status"""
    agents = config.get('agents', {})
    
    # Get system stats
    try:
        redis_info = knowledge_manager.redis_client.info()
        system_stats = {
            "redis_connected": True,
            "redis_memory": redis_info.get('used_memory_human', 'Unknown'),
            "total_agents": len(agents),
            "vector_index_exists": True  # We'll check this properly later
        }
    except Exception as e:
        system_stats = {
            "redis_connected": False,
            "redis_memory": "Unknown",
            "total_agents": len(agents),
            "vector_index_exists": False
        }
    
    return templates.TemplateResponse("dashboard.html", {
        "request": request,
        "agents": agents,
        "system_stats": system_stats
    })

@app.get("/agents", response_class=HTMLResponse)
async def agents_list(request: Request):
    """List all agents with management options"""
    agents = config.get('agents', {})
    return templates.TemplateResponse("agents.html", {
        "request": request,
        "agents": agents
    })

@app.get("/agents/new", response_class=HTMLResponse)
async def new_agent_form(request: Request):
    """Form to create a new agent"""
    return templates.TemplateResponse("agent_form.html", {
        "request": request,
        "agent": None,
        "mode": "create"
    })

@app.post("/agents/create")
async def create_agent(
    name: str = Form(...),
    model_name: str = Form(...),
    base_model: str = Form(...),
    specialization: str = Form(...),
    system_prompt: str = Form(...),
    context_injection_enabled: bool = Form(True),
    learning_enabled: bool = Form(True),
    max_context_items: int = Form(5)
):
    """Create a new agent"""
    try:
        # Add agent to config
        agents = config.config.get('agents', {})
        agents[name] = {
            "model_name": model_name,
            "base_model": base_model,
            "specialization": specialization,
            "system_prompt": system_prompt,
            "context_injection_enabled": context_injection_enabled,
            "learning_enabled": learning_enabled,
            "max_context_items": max_context_items
        }
        
        # Save config
        config.save_config('config/context_system.yaml')
        
        return RedirectResponse(url="/agents", status_code=303)
    except Exception as e:
        logger.error(f"Error creating agent: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/agents/{agent_name}/edit", response_class=HTMLResponse)
async def edit_agent_form(request: Request, agent_name: str):
    """Form to edit an existing agent"""
    agents = config.get('agents', {})
    if agent_name not in agents:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    return templates.TemplateResponse("agent_form.html", {
        "request": request,
        "agent": agents[agent_name],
        "agent_name": agent_name,
        "mode": "edit"
    })

@app.post("/agents/{agent_name}/update")
async def update_agent(
    agent_name: str,
    model_name: str = Form(...),
    base_model: str = Form(...),
    specialization: str = Form(...),
    system_prompt: str = Form(...),
    context_injection_enabled: bool = Form(True),
    learning_enabled: bool = Form(True),
    max_context_items: int = Form(5)
):
    """Update an existing agent"""
    try:
        agents = config.config.get('agents', {})
        if agent_name not in agents:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        agents[agent_name].update({
            "model_name": model_name,
            "base_model": base_model,
            "specialization": specialization,
            "system_prompt": system_prompt,
            "context_injection_enabled": context_injection_enabled,
            "learning_enabled": learning_enabled,
            "max_context_items": max_context_items
        })
        
        config.save_config('config/context_system.yaml')
        return RedirectResponse(url="/agents", status_code=303)
    except Exception as e:
        logger.error(f"Error updating agent: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/agents/{agent_name}/delete")
async def delete_agent(agent_name: str):
    """Delete an agent"""
    try:
        agents = config.config.get('agents', {})
        if agent_name not in agents:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        del agents[agent_name]
        config.save_config('config/context_system.yaml')
        return RedirectResponse(url="/agents", status_code=303)
    except Exception as e:
        logger.error(f"Error deleting agent: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/models", response_class=HTMLResponse)
async def models_list(request: Request):
    """List all available models"""
    modelfiles_dir = Path("modelfiles")
    models = []
    
    if modelfiles_dir.exists():
        for modelfile in modelfiles_dir.glob("*.Modelfile"):
            models.append({
                "name": modelfile.stem,
                "path": str(modelfile),
                "size": modelfile.stat().st_size
            })
    
    return templates.TemplateResponse("models.html", {
        "request": request,
        "models": models
    })

@app.get("/models/upload", response_class=HTMLResponse)
async def upload_model_form(request: Request):
    """Form to upload a new model"""
    return templates.TemplateResponse("model_upload.html", {
        "request": request
    })

@app.post("/models/upload")
async def upload_model(
    name: str = Form(...),
    description: str = Form(...),
    base_model: str = Form(...),
    modelfile_content: str = Form(...)
):
    """Upload a new model"""
    try:
        # Create modelfile
        modelfiles_dir = Path("modelfiles")
        modelfiles_dir.mkdir(exist_ok=True)
        
        modelfile_path = modelfiles_dir / f"{name}.Modelfile"
        with open(modelfile_path, 'w') as f:
            f.write(modelfile_content)
        
        return RedirectResponse(url="/models", status_code=303)
    except Exception as e:
        logger.error(f"Error uploading model: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/knowledge", response_class=HTMLResponse)
async def knowledge_explorer(request: Request):
    """Explore stored knowledge with semantic search"""
    return templates.TemplateResponse("knowledge.html", {
        "request": request
    })

@app.post("/knowledge/search")
async def search_knowledge(
    query: str = Form(...),
    top_k: int = Form(5),
    filter_agent: str = Form(None)
):
    """Search knowledge using semantic search"""
    try:
        results = vector_manager.semantic_search(
            query=query,
            top_k=top_k,
            filter_agent=filter_agent if filter_agent else None
        )
        
        return {
            "results": [
                {
                    "content": result.content,
                    "source_agent": result.source_agent,
                    "similarity_score": result.similarity_score,
                    "metadata": result.metadata
                }
                for result in results
            ]
        }
    except Exception as e:
        logger.error(f"Error searching knowledge: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/agents")
async def api_get_agents():
    """API endpoint to get all agents"""
    return config.get('agents', {})

@app.get("/api/system/status")
async def api_system_status():
    """API endpoint to get system status"""
    try:
        redis_info = knowledge_manager.redis_client.info()
        return {
            "status": "healthy",
            "redis_connected": True,
            "redis_memory": redis_info.get('used_memory_human', 'Unknown'),
            "vector_index_exists": True
        }
    except Exception as e:
        return {
            "status": "error",
            "redis_connected": False,
            "error": str(e)
        }

@app.post("/api/reload_agents")
async def reload_agents():
    try:
        # Re-instantiate or reload the config and agents
        global config
        config = ContextSystemConfig()  # Reloads from YAML
        # If you have agent objects, re-instantiate them here as well
        return {"status": "success", "message": "Agents reloaded successfully."}
    except Exception as e:
        logger.error(f"Error reloading agents: {e}")
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 