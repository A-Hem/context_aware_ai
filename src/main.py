import logging
from core.config_manager import ContextSystemConfig
from core.knowledge_manager import SubConsciousKnowledgeManager
from core.context_analyzer import ContextAnalyzer
from core.context_injector import ContextInjector
from core.enhanced_agent import EnhancedAgent

# Setup basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

def main():
    """Main function to initialize and run the system."""
    logging.info("--- Initializing Context-Aware AI System ---")

    # Load configuration
    config = ContextSystemConfig()
    redis_config = config.get_redis_config()
    analyzer_config = config.get('context_analysis', {})
    ollama_config = config.get('ollama', {})
    
    # Initialize core components
    knowledge_manager = SubConsciousKnowledgeManager(
        redis_host=redis_config.get('host'),
        redis_port=redis_config.get('port')
    )
    context_analyzer = ContextAnalyzer(
        model_name=analyzer_config.get('analyzer_model'),
        ollama_host=ollama_config.get('host', '127.0.0.1'),
        ollama_port=ollama_config.get('port', 11434)
    )
    context_injector = ContextInjector(knowledge_manager, context_analyzer)

    # Initialize agents based on config
    agents = {}
    agent_configs = config.get('agents', {})
    for agent_name, agent_conf in agent_configs.items():
        if agent_conf.get('role') != 'analyzer':
            logging.info(f"Creating agent: {agent_name}")
            agents[agent_name] = EnhancedAgent(
                agent_name=agent_name,
                model_name=agent_conf.get('model_name'),
                knowledge_manager=knowledge_manager,
                context_injector=context_injector,
                ollama_host=ollama_config.get('host', '127.0.0.1'),
                ollama_port=ollama_config.get('port', 11434)
            )

    logging.info("--- System Initialized. Ready for queries. ---")
    
    # Interactive loop
    while True:
        print("\nAvailable agents:", ", ".join(agents.keys()))
        agent_choice = input("Choose an agent (or 'quit' to exit): ").strip()

        if agent_choice.lower() == 'quit':
            break
        if agent_choice not in agents:
            print("Invalid agent selected.")
            continue

        selected_agent = agents[agent_choice]
        query = input(f"Enter your query for the {agent_choice}: ").strip()
        
        if query:
            print(f"\n--- {agent_choice.upper()} is thinking... ---")
            response = selected_agent.generate_response(query)
            print("Response:")
            print(response)
            print("---------------------------------")


if __name__ == "__main__":
    main()