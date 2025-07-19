from typing import Dict, List

class BaseAgent:
    def handle_task(self, task: dict) -> dict:
        """Override this method in subclasses to handle tasks."""
        raise NotImplementedError

class Orchestrator:
    def __init__(self):
        self.agents: Dict[str, BaseAgent] = {}
        self.task_queue: List[dict] = []
        self.completed_tasks: List[dict] = []

    def register_agent(self, task_type: str, agent: BaseAgent):
        self.agents[task_type] = agent

    def add_task(self, task: dict):
        self.task_queue.append(task)

    def process_tasks(self):
        while self.task_queue:
            task = self.task_queue.pop(0)
            task_type = task.get('type')
            if not isinstance(task_type, str):
                print(f"Invalid or missing task type for task {task.get('id', '?')}. Skipping.")
                continue
            agent = self.agents.get(task_type)
            if agent:
                result = agent.handle_task(task)
                self.completed_tasks.append(result)
                print(f"Task {task['id']} completed: {result}")
            else:
                print(f"No agent registered for task type: {task_type}")

# Example agent
class PrintAgent(BaseAgent):
    def handle_task(self, task: dict) -> dict:
        print(f"PrintAgent handling: {task['data']}")
        return {'id': task['id'], 'status': 'completed', 'result': task['data']}

# In orchestrator.py
class MCPServer:
    def __init__(self, name, command, args):
        self.name = name
        self.command = command
        self.args = args
        self.process = None

    def start(self):
        import subprocess
        if not self.process:
            self.process = subprocess.Popen([self.command] + self.args)
            print(f"{self.name} MCP server started.")

# Example usage
class ModelAgent(BaseAgent):
    def __init__(self, mcp_server):
        self.mcp_server = mcp_server

    def handle_task(self, task: dict) -> dict:
        # Example: send a request to the MCP server for model inference
        # (In reality, this could be an HTTP call, subprocess, etc.)
        print(f"ModelAgent using MCP server: {self.mcp_server.name}")
        # ... actual logic to interact with the server ...
        return {'id': task['id'], 'status': 'completed', 'result': f"Model {self.mcp_server.name} used"}

# You can add more agent classes here as needed.

def main():
    # Setup MCP server for PRNU analysis
    prnu_server = MCPServer(
        name="prnu-analysis",
        command="ollama",  # or your MCP server command
        args=["run", "prnu-analysis-agent"]
    )
    prnu_server.start()

    orchestrator = Orchestrator()
    orchestrator.register_agent('prnu', ModelAgent(prnu_server))

    # Add and process a task
    orchestrator.add_task({'id': 1, 'type': 'prnu', 'data': 'Analyze image X'})
    orchestrator.process_tasks()

if __name__ == "__main__":
    main() 