import ollama
import logging
from .knowledge_manager import SubConsciousKnowledgeManager
from .context_injector import ContextInjector

logger = logging.getLogger(__name__)

class EnhancedAgent:
    """Enhanced agent with context injection capabilities"""

    def __init__(self, agent_name: str, model_name: str, 
                 knowledge_manager: SubConsciousKnowledgeManager,
                 context_injector: ContextInjector,
                 ollama_host: str = "127.0.0.1",
                 ollama_port: int = 11434):
        self.agent_name = agent_name
        self.model_name = model_name
        self.knowledge_manager = knowledge_manager
        self.context_injector = context_injector
        # Create URL for Ollama client
        ollama_url = f"http://{ollama_host}:{ollama_port}"
        self.ollama_client = ollama.Client(host=ollama_url)

    def generate_response(self, user_query: str) -> str:
        """Generate response with injected context"""
        
        template_data = self.context_injector.build_enhanced_template_data(
            user_query=user_query,
            agent_name=self.agent_name
        )
        
        try:
            response = self.ollama_client.chat(
                model=self.model_name,
                messages=[{'role': 'user', 'content': template_data['Prompt']}],
                # Note: Ollama's `chat` doesn't directly support the template variables in the same way `generate` does.
                # The Modelfile's SYSTEM and TEMPLATE prompts are applied by Ollama itself.
                # Here we are focusing on providing the user's query.
                # A more complex implementation might build a single text block and use `generate`.
            )
            
            agent_response = response['message']['content']
            
            self.context_injector.learn_from_response(
                agent_name=self.agent_name,
                user_query=user_query,
                agent_response=agent_response
            )
            
            return agent_response
            
        except Exception as e:
            logger.error(f"Error generating response for model {self.model_name}: {e}")
            return f"Sorry, I encountered an error while processing your request with the {self.agent_name} model."