import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiService } from "../services/apiService";
import { wsService } from "../services/websocketService";

// Agent Interfaces
export interface Agent {
  id: string;
  name: string;
  type: "stealth" | "scraper" | "monitor" | "analyzer" | "executor";
  status: "idle" | "active" | "busy" | "error" | "offline";
  capabilities: string[];
  performance: {
    tasksCompleted: number;
    successRate: number;
    avgResponseTime: number;
    uptime: number;
  };
  resources: {
    cpu: number;
    memory: number;
    network: number;
  };
  config: {
    maxConcurrentTasks: number;
    priority: "low" | "medium" | "high" | "critical";
    autoRestart: boolean;
    stealthMode: boolean;
  };
  lastActivity: string;
  deployedAt: string;
  version: string;
  location: string;
}

export interface AgentDeployment {
  id: string;
  agentType: "stealth" | "scraper" | "monitor" | "analyzer" | "executor";
  config: {
    instances: number;
    region: string;
    resources: {
      cpu: string;
      memory: string;
      storage: string;
    };
    environment: Record<string, string>;
    stealthSettings?: {
      fingerprintRotation: boolean;
      proxyChain: boolean;
      behaviorMimicking: boolean;
    };
  };
  status: "pending" | "deploying" | "active" | "failed" | "terminated";
  createdAt: string;
}

export interface AgentMetrics {
  totalAgents: number;
  activeAgents: number;
  totalTasks: number;
  successRate: number;
  avgResponseTime: number;
  resourceUtilization: {
    cpu: number;
    memory: number;
    network: number;
  };
  performance: {
    tasksPerMinute: number;
    errorRate: number;
    uptime: number;
  };
}

export interface AgentCommand {
  id: string;
  agentId: string;
  command: "start" | "stop" | "restart" | "update" | "configure" | "terminate";
  parameters?: Record<string, any>;
  status: "pending" | "executing" | "completed" | "failed";
  result?: any;
  error?: string;
  timestamp: string;
}

// Context Interface
interface AgentContextType {
  // State
  agents: Agent[];
  deployments: AgentDeployment[];
  metrics: AgentMetrics | null;
  commands: AgentCommand[];
  loading: boolean;
  error: string | null;

  // Agent Management
  deployAgent: (deployment: Omit<AgentDeployment, "id" | "status" | "createdAt">) => Promise<void>;
  startAgent: (agentId: string) => Promise<void>;
  stopAgent: (agentId: string) => Promise<void>;
  restartAgent: (agentId: string) => Promise<void>;
  terminateAgent: (agentId: string) => Promise<void>;
  updateAgentConfig: (agentId: string, config: Partial<Agent["config"]>) => Promise<void>;

  // Command Management
  executeCommand: (command: Omit<AgentCommand, "id" | "status" | "timestamp">) => Promise<void>;
  getCommandHistory: (agentId?: string) => AgentCommand[];

  // Monitoring
  refreshMetrics: () => Promise<void>;
  getAgentLogs: (agentId: string, limit?: number) => Promise<any[]>;

  // Bulk Operations
  startAllAgents: () => Promise<void>;
  stopAllAgents: () => Promise<void>;
  scaleAgents: (agentType: Agent["type"], instances: number) => Promise<void>;
}

// Create Context
const AgentContext = createContext<AgentContextType | undefined>(undefined);

// Provider Component
export const AgentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [deployments, setDeployments] = useState<AgentDeployment[]>([]);
  const [metrics, setMetrics] = useState<AgentMetrics | null>(null);
  const [commands, setCommands] = useState<AgentCommand[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize and setup WebSocket listeners
  useEffect(() => {
    loadInitialData();
    setupWebSocketListeners();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [agentsData, deploymentsData, metricsData] = await Promise.all([
        apiService.get("/agents"),
        apiService.get("/agents/deployments"),
        apiService.get("/agents/metrics"),
      ]);

      setAgents(agentsData);
      setDeployments(deploymentsData);
      setMetrics(metricsData);
    } catch (err) {
      setError("Failed to load agent data");
      console.error("Agent data loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocketListeners = () => {
    wsService.on(
      "agent_status_update",
      (data: { agentId: string; status: Agent["status"]; performance?: Agent["performance"] }) => {
        setAgents((prev) =>
          prev.map((agent) =>
            agent.id === data.agentId
              ? {
                  ...agent,
                  status: data.status,
                  ...(data.performance && { performance: data.performance }),
                }
              : agent
          )
        );
      }
    );

    wsService.on("agent_metrics_update", (data: AgentMetrics) => {
      setMetrics(data);
    });

    wsService.on("agent_command_update", (data: AgentCommand) => {
      setCommands((prev) => {
        const existing = prev.find((cmd) => cmd.id === data.id);
        if (existing) {
          return prev.map((cmd) => (cmd.id === data.id ? data : cmd));
        }
        return [data, ...prev.slice(0, 99)]; // Keep last 100 commands
      });
    });

    wsService.on("agent_deployed", (data: Agent) => {
      setAgents((prev) => [...prev, data]);
    });

    wsService.on("agent_terminated", (data: { agentId: string }) => {
      setAgents((prev) => prev.filter((agent) => agent.id !== data.agentId));
    });
  };

  // Agent Management Functions
  const deployAgent = async (deployment: Omit<AgentDeployment, "id" | "status" | "createdAt">) => {
    try {
      setLoading(true);
      const newDeployment = await apiService.post("/agents/deploy", deployment);
      setDeployments((prev) => [...prev, newDeployment]);
    } catch (err) {
      setError("Failed to deploy agent");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const startAgent = async (agentId: string) => {
    try {
      await apiService.post(`/agents/${agentId}/start`);
      setAgents((prev) =>
        prev.map((agent) => (agent.id === agentId ? { ...agent, status: "active" } : agent))
      );
    } catch (err) {
      setError("Failed to start agent");
      throw err;
    }
  };

  const stopAgent = async (agentId: string) => {
    try {
      await apiService.post(`/agents/${agentId}/stop`);
      setAgents((prev) =>
        prev.map((agent) => (agent.id === agentId ? { ...agent, status: "idle" } : agent))
      );
    } catch (err) {
      setError("Failed to stop agent");
      throw err;
    }
  };

  const restartAgent = async (agentId: string) => {
    try {
      await apiService.post(`/agents/${agentId}/restart`);
      setAgents((prev) =>
        prev.map((agent) => (agent.id === agentId ? { ...agent, status: "active" } : agent))
      );
    } catch (err) {
      setError("Failed to restart agent");
      throw err;
    }
  };

  const terminateAgent = async (agentId: string) => {
    try {
      await apiService.delete(`/agents/${agentId}`);
      setAgents((prev) => prev.filter((agent) => agent.id !== agentId));
    } catch (err) {
      setError("Failed to terminate agent");
      throw err;
    }
  };

  const updateAgentConfig = async (agentId: string, config: Partial<Agent["config"]>) => {
    try {
      const updatedAgent = await apiService.patch(`/agents/${agentId}/config`, config);
      setAgents((prev) => prev.map((agent) => (agent.id === agentId ? updatedAgent : agent)));
    } catch (err) {
      setError("Failed to update agent config");
      throw err;
    }
  };

  const executeCommand = async (command: Omit<AgentCommand, "id" | "status" | "timestamp">) => {
    try {
      const newCommand = await apiService.post("/agents/commands", command);
      setCommands((prev) => [newCommand, ...prev.slice(0, 99)]);
    } catch (err) {
      setError("Failed to execute command");
      throw err;
    }
  };

  const getCommandHistory = (agentId?: string) => {
    return agentId ? commands.filter((cmd) => cmd.agentId === agentId) : commands;
  };

  const refreshMetrics = async () => {
    try {
      const metricsData = await apiService.get("/agents/metrics");
      setMetrics(metricsData);
    } catch (err) {
      setError("Failed to refresh metrics");
      throw err;
    }
  };

  const getAgentLogs = async (agentId: string, limit = 100) => {
    try {
      return await apiService.get(`/agents/${agentId}/logs?limit=${limit}`);
    } catch (err) {
      setError("Failed to get agent logs");
      throw err;
    }
  };

  const startAllAgents = async () => {
    try {
      await apiService.post("/agents/start-all");
      setAgents((prev) => prev.map((agent) => ({ ...agent, status: "active" })));
    } catch (err) {
      setError("Failed to start all agents");
      throw err;
    }
  };

  const stopAllAgents = async () => {
    try {
      await apiService.post("/agents/stop-all");
      setAgents((prev) => prev.map((agent) => ({ ...agent, status: "idle" })));
    } catch (err) {
      setError("Failed to stop all agents");
      throw err;
    }
  };

  const scaleAgents = async (agentType: Agent["type"], instances: number) => {
    try {
      await apiService.post("/agents/scale", { agentType, instances });
      // Refresh agents after scaling
      const agentsData = await apiService.get("/agents");
      setAgents(agentsData);
    } catch (err) {
      setError("Failed to scale agents");
      throw err;
    }
  };

  const value: AgentContextType = {
    // State
    agents,
    deployments,
    metrics,
    commands,
    loading,
    error,

    // Agent Management
    deployAgent,
    startAgent,
    stopAgent,
    restartAgent,
    terminateAgent,
    updateAgentConfig,

    // Command Management
    executeCommand,
    getCommandHistory,

    // Monitoring
    refreshMetrics,
    getAgentLogs,

    // Bulk Operations
    startAllAgents,
    stopAllAgents,
    scaleAgents,
  };

  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>;
};

// Hook
export const useAgentContext = () => {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error("useAgentContext must be used within an AgentProvider");
  }
  return context;
};
