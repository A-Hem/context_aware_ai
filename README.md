# Context-Aware Multi-Agent AI System

This project implements a multi-agent AI system where specialized agents collaborate using a shared knowledge base ("subconscious") powered by Redis.

## Setup Instructions

1.  **Configure Environment**: Copy `.env` to a new file and update with your settings.
2.  **Start Redis**: Run `docker-compose up -d`.
3.  **Install Dependencies**: Run `pip install -r requirements.txt`.
4.  **Create Ollama Models**: Execute `./scripts/setup_ollama_models.sh`.
5.  **Run the System**: Execute `python src/main.py`.
