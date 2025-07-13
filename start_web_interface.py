#!/usr/bin/env python3
"""
Startup script for the Context-Aware AI System with Web Interface
"""

import os
import sys
import subprocess
import time
import logging
from pathlib import Path

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def check_dependencies():
    """Check if all required dependencies are installed"""
    try:
        import fastapi
        import uvicorn
        import sentence_transformers
        import redis
        import ollama
        logger.info("✅ All dependencies are installed")
        return True
    except ImportError as e:
        logger.error(f"❌ Missing dependency: {e}")
        logger.info("Please run: pip install -r requirements.txt")
        return False

def check_services():
    """Check if required services are running"""
    services_status = {}
    
    # Check Redis
    try:
        import redis
        r = redis.Redis(host='localhost', port=6379, decode_responses=True)
        r.ping()
        services_status['redis'] = True
        logger.info("✅ Redis is running")
    except Exception as e:
        services_status['redis'] = False
        logger.error(f"❌ Redis is not running: {e}")
    
    # Check Ollama
    try:
        import ollama
        client = ollama.Client(host='http://127.0.0.1:11434')
        client.list()
        services_status['ollama'] = True
        logger.info("✅ Ollama is running")
    except Exception as e:
        services_status['ollama'] = False
        logger.error(f"❌ Ollama is not running: {e}")
    
    return services_status

def start_services():
    """Start required services if not running"""
    logger.info("Starting required services...")
    
    # Start Redis with Docker
    try:
        subprocess.run(["docker-compose", "up", "-d"], check=True, capture_output=True)
        logger.info("✅ Started Redis with Docker")
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ Failed to start Redis: {e}")
        return False
    
    # Wait for services to be ready
    time.sleep(3)
    return True

def create_directories():
    """Create necessary directories"""
    directories = [
        "src/web/templates",
        "src/web/static",
        "logs",
        "uploads"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
    
    logger.info("✅ Created necessary directories")

def main():
    """Main startup function"""
    print("🚀 Starting Context-Aware AI System with Web Interface")
    print("=" * 60)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Create directories
    create_directories()
    
    # Check services
    services = check_services()
    
    # Start services if needed
    if not services.get('redis', False):
        if not start_services():
            logger.error("Failed to start required services")
            sys.exit(1)
    
    # Wait a bit for services to be fully ready
    time.sleep(2)
    
    # Final service check
    services = check_services()
    if not all(services.values()):
        logger.error("Some services are still not available")
        logger.info("Please ensure Redis and Ollama are running")
        sys.exit(1)
    
    print("\n🎉 All systems ready!")
    print("=" * 60)
    print("📊 Web Interface: http://localhost:8000")
    print("🔍 Redis Commander: http://localhost:8081")
    print("🤖 Ollama API: http://127.0.0.1:11434")
    print("=" * 60)
    print("Press Ctrl+C to stop the server")
    print()
    
    # Start the web interface
    try:
        import uvicorn
        
        uvicorn.run(
            "src.web.app:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        logger.info("Shutting down...")
    except Exception as e:
        logger.error(f"Error starting web interface: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 