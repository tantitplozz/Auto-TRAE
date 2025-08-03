/**
 * ✅ Military-Grade AI Agent Orchestration Console
 * Unprecedented control and visibility over autonomous agent swarms.
 */
import React, { useState, useMemo } from 'react';
import {
  useAgentContext,
  Agent,
  AgentDeployment
} from '../../contexts/AgentContext';
import {
  Cpu, Zap, Shield, Server, BarChart, Play, StopCircle, RefreshCw, Trash2, Sliders,
  Terminal, ChevronDown, ChevronUp, Rocket, Power, PowerOff, Pause, Settings,
  Activity, CheckCircle, AlertTriangle, XCircle, Hourglass, Info, Scale, Bot
} from 'lucide-react';

// Sub-components
const AgentCard: React.FC<{
  agent: Agent;
  onAction: (action: 'start' | 'stop' | 'restart' | 'terminate' | 'configure', agentId: string) => void;
}> = ({ agent, onAction }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusInfo = {
    idle: { color: 'text-gray-400', bg: 'bg-gray-700/50', icon: <Pause className="w-4 h-4" /> },
    active: { color: 'text-green-400', bg: 'bg-green-500/30', icon: <Play className="w-4 h-4 animate-pulse" /> },
    busy: { color: 'text-yellow-400', bg: 'bg-yellow-500/30', icon: <Activity className="w-4 h-4" /> },
    error: { color: 'text-red-400', bg: 'bg-red-500/30', icon: <AlertTriangle className="w-4 h-4" /> },
    offline: { color: 'text-neutral-500', bg: 'bg-neutral-800/50', icon: <XCircle className="w-4 h-4" /> },
  };

  const getAgentIcon = (type: Agent['type']) => {
    switch (type) {
      case 'stealth': return <Shield className="w-6 h-6 text-blue-400" />;
      case 'scraper': return <Zap className="w-6 h-6 text-yellow-400" />;
      case 'monitor': return <Server className="w-6 h-6 text-indigo-400" />;
      case 'analyzer': return <BarChart className="w-6 h-6 text-purple-400" />;
      case 'executor': return <Cpu className="w-6 h-6 text-green-400" />;
      default: return <Bot className="w-6 h-6 text-gray-400" />;
    }
  };

  const ResourceBar: React.FC<{ value: number; color: string }> = ({ value, color }) => (
    <div className="w-full bg-black/30 rounded-full h-1.5">
      <div
        className={`h-1.5 rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );

  return (
    <div className={`bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 transition-all duration-300 hover:border-blue-500/50 shadow-lg hover:shadow-blue-500/20`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          {getAgentIcon(agent.type)}
          <div>
            <h3 className="text-white font-bold text-lg">{agent.name}</h3>
            <p className="text-gray-400 text-sm capitalize">{agent.type} Agent / v{agent.version}</p>
          </div>
        </div>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold border border-current ${statusInfo[agent.status]?.color}`}>
          {statusInfo[agent.status]?.icon}
          <span>{agent.status.toUpperCase()}</span>
        </div>
      </div>

      {/* Core Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="flex flex-col space-y-1">
          <span className="text-gray-400">Success Rate</span>
          <span className="text-green-400 font-semibold text-base">{agent.performance.successRate.toFixed(1)}%</span>
        </div>
        <div className="flex flex-col space-y-1">
          <span className="text-gray-400">Avg. Response</span>
          <span className="text-blue-400 font-semibold text-base">{agent.performance.avgResponseTime}ms</span>
        </div>
        <div className="flex flex-col space-y-1">
          <span className="text-gray-400">Tasks Done</span>
          <span className="text-white font-semibold text-base">{agent.performance.tasksCompleted}</span>
        </div>
        <div className="flex flex-col space-y-1">
          <span className="text-gray-400">Uptime</span>
          <span className="text-purple-400 font-semibold text-base">{agent.performance.uptime.toFixed(2)}%</span>
        </div>
      </div>

      {/* Resource Utilization */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400 flex items-center"><Cpu className="w-3 h-3 mr-1.5" />CPU</span>
          <span className="text-white">{agent.resources.cpu.toFixed(1)}%</span>
        </div>
        <ResourceBar value={agent.resources.cpu} color="bg-blue-500" />

        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400 flex items-center"><Zap className="w-3 h-3 mr-1.5" />Memory</span>
          <span className="text-white">{agent.resources.memory.toFixed(1)}%</span>
        </div>
        <ResourceBar value={agent.resources.memory} color="bg-green-500" />
      </div>

      {/* Expansion Toggle */}
      <button onClick={() => setIsExpanded(!isExpanded)} className="w-full text-xs text-gray-400 hover:text-white flex items-center justify-center py-1 mb-4">
        {isExpanded ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
        {isExpanded ? 'Hide Details' : 'Show Details'}
      </button>

      {/* Collapsible Details */}
      {isExpanded && (
        <div className="space-y-4 bg-black/30 p-3 rounded-lg mb-4 animate-fade-in">
          <h4 className="text-sm font-semibold text-white">Configuration</h4>
          <div className="text-xs space-y-1 text-gray-300">
            <p><strong>Priority:</strong> <span className="capitalize">{agent.config.priority}</span></p>
            <p><strong>Max Tasks:</strong> {agent.config.maxConcurrentTasks}</p>
            <p><strong>Auto-Restart:</strong> {agent.config.autoRestart ? 'Enabled' : 'Disabled'}</p>
            <p><strong>Stealth Mode:</strong> {agent.config.stealthMode ? 'Active' : 'Inactive'}</p>
          </div>
          <h4 className="text-sm font-semibold text-white mt-3">Activity</h4>
          <div className="text-xs space-y-1 text-gray-300">
            <p><strong>Last Activity:</strong> {new Date(agent.lastActivity).toLocaleString()}</p>
            <p><strong>Deployed At:</strong> {new Date(agent.deployedAt).toLocaleString()}</p>
            <p><strong>Location:</strong> {agent.location}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2">
        {agent.status === 'idle' || agent.status === 'offline' || agent.status === 'error' ? (
          <button onClick={() => onAction('start', agent.id)} className="flex items-center justify-center space-x-2 bg-green-600/20 hover:bg-green-600/40 border border-green-500/30 rounded-lg p-2 text-green-400 transition-all">
            <Play className="w-4 h-4" />
            <span className="text-sm font-medium">Start</span>
          </button>
        ) : (
          <button onClick={() => onAction('stop', agent.id)} className="flex items-center justify-center space-x-2 bg-yellow-600/20 hover:bg-yellow-600/40 border border-yellow-500/30 rounded-lg p-2 text-yellow-400 transition-all">
            <StopCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Stop</span>
          </button>
        )}
        <button onClick={() => onAction('restart', agent.id)} className="flex items-center justify-center space-x-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 rounded-lg p-2 text-blue-400 transition-all">
          <RefreshCw className="w-4 h-4" />
          <span className="text-sm font-medium">Restart</span>
        </button>
        <button onClick={() => onAction('terminate', agent.id)} className="flex items-center justify-center space-x-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 rounded-lg p-2 text-red-400 transition-all">
          <Trash2 className="w-4 h-4" />
          <span className="text-sm font-medium">Kill</span>
        </button>
      </div>
    </div>
  );
};

// Agent Deployment Modal
const AgentDeployModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onDeploy: (deployment: Omit<AgentDeployment, 'id' | 'status' | 'createdAt'>) => void;
}> = ({ isOpen, onClose, onDeploy }) => {
  const [agentType, setAgentType] = useState<Agent['type']>('stealth');
  const [instances, setInstances] = useState(1);
  const [region, setRegion] = useState('us-east-1');
  const [cpu, setCpu] = useState('256');
  const [memory, setMemory] = useState('512');

  const handleSubmit = () => {
    onDeploy({
      agentType,
      config: {
        instances,
        region,
        resources: { cpu: `${cpu}m`, memory: `${memory}Mi`, storage: '10Gi' },
        environment: { LOG_LEVEL: 'info' },
        stealthSettings: agentType === 'stealth' ? {
          fingerprintRotation: true,
          proxyChain: true,
          behaviorMimicking: true
        } : undefined
      }
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-blue-500/50 rounded-2xl p-8 w-full max-w-2xl shadow-2xl shadow-blue-500/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center"><Rocket className="w-6 h-6 mr-3 text-blue-400"/>Deploy New Agent Swarm</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><XCircle className="w-6 h-6" /></button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Agent Archetype</label>
            <select value={agentType} onChange={e => setAgentType(e.target.value as Agent['type'])} className="w-full bg-black/30 border border-white/20 rounded-lg p-3 text-white">
              <option value="stealth">Stealth Agent</option>
              <option value="scraper">Scraper Agent</option>
              <option value="monitor">Monitor Agent</option>
              <option value="analyzer">Analyzer Agent</option>
              <option value="executor">Executor Agent</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Instances</label>
              <input type="number" value={instances} onChange={e => setInstances(parseInt(e.target.value))} min="1" max="50" className="w-full bg-black/30 border border-white/20 rounded-lg p-3 text-white" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Deployment Region</label>
              <select value={region} onChange={e => setRegion(e.target.value)} className="w-full bg-black/30 border border-white/20 rounded-lg p-3 text-white">
                <option value="us-east-1">US East (N. Virginia)</option>
                <option value="eu-west-1">EU (Ireland)</option>
                <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Resource Allocation</label>
            <div className="grid grid-cols-2 gap-4 bg-black/20 p-4 rounded-lg">
              <div>
                <label className="text-xs text-gray-400">CPU (millicores)</label>
                <input type="number" value={cpu} onChange={e => setCpu(e.target.value)} className="w-full bg-black/50 border border-white/20 rounded-md p-2 text-white mt-1" />
              </div>
              <div>
                <label className="text-xs text-gray-400">Memory (MiB)</label>
                <input type="number" value={memory} onChange={e => setMemory(e.target.value)} className="w-full bg-black/50 border border-white/20 rounded-md p-2 text-white mt-1" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg flex items-center space-x-2 transition-all duration-300">
              <Rocket className="w-5 h-5" />
              <span>Launch Swarm</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// System Overview
const SystemOverview: React.FC<{ metrics: AgentMetrics | null }> = ({ metrics }) => {
  const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`p-3 bg-gray-600/20 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (!metrics) {
    return <div className="text-center text-gray-400">Loading metrics...</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard title="Active Agents" value={`${metrics.activeAgents} / ${metrics.totalAgents}`} icon={<Bot className="w-6 h-6 text-green-400" />} color="text-green-400" />
      <StatCard title="Total Tasks" value={metrics.totalTasks.toLocaleString()} icon={<CheckCircle className="w-6 h-6 text-blue-400" />} color="text-blue-400" />
      <StatCard title="Success Rate" value={`${metrics.successRate.toFixed(1)}%`} icon={<TrendingUp className="w-6 h-6 text-purple-400" />} color="text-purple-400" />
      <StatCard title="Avg Response" value={`${metrics.avgResponseTime.toFixed(0)}ms`} icon={<Hourglass className="w-6 h-6 text-yellow-400" />} color="text-yellow-400" />
    </div>
  );
};

// Main Agent Orchestrator Component
export const AgentOrchestrator: React.FC = () => {
  const {
    agents, metrics, loading, error,
    deployAgent, startAgent, stopAgent, restartAgent, terminateAgent,
    startAllAgents, stopAllAgents, scaleAgents
  } = useAgentContext();

  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | Agent['type']>('all');

  const handleAgentAction = (action: 'start' | 'stop' | 'restart' | 'terminate' | 'configure', agentId: string) => {
    switch (action) {
      case 'start': startAgent(agentId); break;
      case 'stop': stopAgent(agentId); break;
      case 'restart': restartAgent(agentId); break;
      case 'terminate':
        if (window.confirm('Are you sure you want to terminate this agent? This action is irreversible.')) {
          terminateAgent(agentId);
        }
        break;
      case 'configure':
        // TODO: Implement configuration modal
        console.log('Configure agent:', agentId);
        break;
    }
  };

  const filteredAgents = useMemo(() => {
    if (filter === 'all') return agents;
    return agents.filter(agent => agent.type === filter);
  }, [agents, filter]);

  if (loading && agents.length === 0) {
    return <div className="text-center p-10 text-gray-400">Initializing Command Center...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header & Global Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">AI Agent Command Center</h2>
          <p className="text-gray-400 mt-1">Deploy and orchestrate military-grade autonomous agent swarms.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => startAllAgents()} className="flex items-center space-x-2 bg-green-600/80 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-all">
            <Power className="w-4 h-4" />
            <span>Start All</span>
          </button>
          <button onClick={() => stopAllAgents()} className="flex items-center space-x-2 bg-red-600/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-all">
            <PowerOff className="w-4 h-4" />
            <span>Stop All</span>
          </button>
          <button onClick={() => setIsDeployModalOpen(true)} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-all">
            <Rocket className="w-4 h-4" />
            <span>Deploy Swarm</span>
          </button>
        </div>
      </div>

      {/* System Overview */}
      <SystemOverview metrics={metrics} />

      {/* Agent Grid & Filters */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">Agent Swarm ({filteredAgents.length})</h3>
          {/* Add filter controls here */}
        </div>
        {filteredAgents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAgents.map(agent => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onAction={handleAgentAction}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-black/20 rounded-lg border border-dashed border-gray-700">
            <p className="text-gray-400">No agents match the current filter.</p>
          </div>
        )}
      </div>

      <AgentDeployModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        onDeploy={deployAgent}
      />
    </div>
  );
};
  agent: Agent;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onConfigure: () => void;
}> = ({ agent, onStart, onStop, onPause, onConfigure }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'paused': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'error': return 'text-red-400 bg-red-400/20 border-red-400/30';
      case 'deploying': return 'text-blue-400 bg-blue-400/20 border-blue-400/30';
      default: return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'stealth': return <Shield className="w-5 h-5" />;
      case 'purchase': return <Target className="w-5 h-5" />;
      case 'monitor': return <Eye className="w-5 h-5" />;
      case 'warmup': return <Zap className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const getStealthLevelColor = (level: string) => {
    switch (level) {
      case 'ghost': return 'text-purple-400';
      case 'high': return 'text-blue-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600/20 rounded-lg text-blue-400">
            {getTypeIcon(agent.type)}
          </div>
          <div>
            <h3 className="text-white font-semibold">{agent.name}</h3>
            <p className="text-gray-400 text-sm capitalize">{agent.type} Agent</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(agent.status)}`}>
            {agent.status.toUpperCase()}
          </div>
          <button
            onClick={onConfigure}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Success Rate</span>
            <span className="text-green-400 font-medium">{agent.performance.successRate}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Tasks Done</span>
            <span className="text-white font-medium">{agent.performance.tasksCompleted}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Avg Response</span>
            <span className="text-blue-400 font-medium">{agent.performance.avgResponseTime}ms</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Detection</span>
            <span className={`font-medium ${agent.performance.detectionScore <= 30 ? 'text-green-400' : 'text-yellow-400'}`}>
              {agent.performance.detectionScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Resource Usage */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400 flex items-center">
            <Cpu className="w-3 h-3 mr-1" />
            CPU
          </span>
          <span className="text-white">{agent.resources.cpu}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1.5">
          <div
            className="bg-blue-400 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${agent.resources.cpu}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Memory</span>
          <span className="text-white">{agent.resources.memory}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1.5">
          <div
            className="bg-green-400 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${agent.resources.memory}%` }}
          />
        </div>
      </div>

      {/* Configuration */}
      <div className="bg-black/20 rounded-lg p-3 mb-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400">Stealth Level</span>
          <span className={`font-medium capitalize ${getStealthLevelColor(agent.config.stealthLevel)}`}>
            {agent.config.stealthLevel}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm mt-1">
          <span className="text-gray-400">Max Concurrent</span>
          <span className="text-white">{agent.config.maxConcurrent}</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex space-x-2">
        {agent.status === 'idle' || agent.status === 'paused' ? (
          <button
            onClick={onStart}
            className="flex-1 flex items-center justify-center space-x-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg p-2 text-green-400 transition-all"
          >
            <Play className="w-4 h-4" />
            <span className="text-sm font-medium">Start</span>
          </button>
        ) : (
          <button
            onClick={onPause}
            className="flex-1 flex items-center justify-center space-x-2 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/30 rounded-lg p-2 text-yellow-400 transition-all"
          >
            <Pause className="w-4 h-4" />
            <span className="text-sm font-medium">Pause</span>
          </button>
        )}

        <button
          onClick={onStop}
          className="flex-1 flex items-center justify-center space-x-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg p-2 text-red-400 transition-all"
        >
          <Square className="w-4 h-4" />
          <span className="text-sm font-medium">Stop</span>
        </button>
      </div>

      {/* Last Active */}
      <div className="mt-3 flex items-center justify-center text-xs text-gray-500">
        <Clock className="w-3 h-3 mr-1" />
        Last active: {new Date(agent.lastActive).toLocaleTimeString()}
      </div>
    </div>
  );
};

// Agent Deploy Button
const AgentDeployButton: React.FC<{ onDeploy: () => void }> = ({ onDeploy }) => {
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploy = async () => {
    setIsDeploying(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    onDeploy();
    setIsDeploying(false);
  };

  return (
    <button
      onClick={handleDeploy}
      disabled={isDeploying}
      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-lg text-white font-medium transition-all"
    >
      <Rocket className={`w-4 h-4 ${isDeploying ? 'animate-bounce' : ''}`} />
      <span>{isDeploying ? 'Deploying...' : 'Deploy Agent'}</span>
    </button>
  );
};

// System Overview
const SystemOverview: React.FC<{ agents: Agent[] }> = ({ agents }) => {
  const runningAgents = agents.filter(a => a.status === 'running').length;
  const totalTasks = agents.reduce((sum, a) => sum + a.performance.tasksCompleted, 0);
  const avgSuccessRate = agents.reduce((sum, a) => sum + a.performance.successRate, 0) / agents.length;
  const avgDetectionScore = agents.reduce((sum, a) => sum + a.performance.detectionScore, 0) / agents.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Active Agents</p>
            <p className="text-2xl font-bold text-white">{runningAgents}</p>
          </div>
          <div className="p-3 bg-green-600/20 rounded-lg">
            <Activity className="w-6 h-6 text-green-400" />
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Total Tasks</p>
            <p className="text-2xl font-bold text-white">{totalTasks}</p>
          </div>
          <div className="p-3 bg-blue-600/20 rounded-lg">
            <Target className="w-6 h-6 text-blue-400" />
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Success Rate</p>
            <p className="text-2xl font-bold text-green-400">{avgSuccessRate.toFixed(1)}%</p>
          </div>
          <div className="p-3 bg-green-600/20 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-400" />
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Detection Risk</p>
            <p className={`text-2xl font-bold ${avgDetectionScore <= 30 ? 'text-green-400' : 'text-yellow-400'}`}>
              {avgDetectionScore.toFixed(1)}%
            </p>
          </div>
          <div className="p-3 bg-yellow-600/20 rounded-lg">
            <Shield className="w-6 h-6 text-yellow-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Agent Orchestrator Component
export const AgentOrchestrator: React.FC = () => {
  const { agents: hookAgents } = useAgents();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  useEffect(() => {
    // Transform hook agents to our format or use mock data
    const mockAgents: Agent[] = [
      {
        id: '1',
        name: 'Stealth-Alpha',
        type: 'stealth',
        status: 'running',
        performance: {
          successRate: 94.5,
          tasksCompleted: 1247,
          avgResponseTime: 234,
          detectionScore: 12
        },
        resources: {
          cpu: 45,
          memory: 62,
          network: 78
        },
        lastActive: new Date().toISOString(),
        config: {
          stealthLevel: 'ghost',
          maxConcurrent: 5,
          retryAttempts: 3
        }
      },
      {
        id: '2',
        name: 'Purchase-Beta',
        type: 'purchase',
        status: 'running',
        performance: {
          successRate: 87.2,
          tasksCompleted: 892,
          avgResponseTime: 567,
          detectionScore: 28
        },
        resources: {
          cpu: 67,
          memory: 54,
          network: 89
        },
        lastActive: new Date(Date.now() - 300000).toISOString(),
        config: {
          stealthLevel: 'high',
          maxConcurrent: 3,
          retryAttempts: 5
        }
      },
      {
        id: '3',
        name: 'Monitor-Gamma',
        type: 'monitor',
        status: 'paused',
        performance: {
          successRate: 99.1,
          tasksCompleted: 2156,
          avgResponseTime: 123,
          detectionScore: 8
        },
        resources: {
          cpu: 23,
          memory: 34,
          network: 45
        },
        lastActive: new Date(Date.now() - 600000).toISOString(),
        config: {
          stealthLevel: 'medium',
          maxConcurrent: 8,
          retryAttempts: 2
        }
      }
    ];
    setAgents(mockAgents);
  }, [hookAgents]);

  const startAgent = (agentId: string) => {
    setAgents(prev => prev.map(agent =>
      agent.id === agentId
        ? { ...agent, status: 'running' as const, lastActive: new Date().toISOString() }
        : agent
    ));
  };

  const stopAgent = (agentId: string) => {
    setAgents(prev => prev.map(agent =>
      agent.id === agentId
        ? { ...agent, status: 'idle' as const }
        : agent
    ));
  };

  const pauseAgent = (agentId: string) => {
    setAgents(prev => prev.map(agent =>
      agent.id === agentId
        ? { ...agent, status: 'paused' as const }
        : agent
    ));
  };

  const configureAgent = (agentId: string) => {
    setSelectedAgent(agentId);
    // Open configuration modal
  };

  const deployNewAgent = () => {
    const newAgent: Agent = {
      id: Date.now().toString(),
      name: `Agent-${Date.now()}`,
      type: 'stealth',
      status: 'deploying',
      performance: {
        successRate: 0,
        tasksCompleted: 0,
        avgResponseTime: 0,
        detectionScore: 0
      },
      resources: {
        cpu: 0,
        memory: 0,
        network: 0
      },
      lastActive: new Date().toISOString(),
      config: {
        stealthLevel: 'medium',
        maxConcurrent: 3,
        retryAttempts: 3
      }
    };

    setAgents(prev => [...prev, newAgent]);

    // Simulate deployment
    setTimeout(() => {
      setAgents(prev => prev.map(agent =>
        agent.id === newAgent.id
          ? { ...agent, status: 'idle' as const }
          : agent
      ));
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">AI Agent Command Center</h2>
          <p className="text-gray-400 mt-1">Deploy and orchestrate intelligent automation agents</p>
        </div>
        <AgentDeployButton onDeploy={deployNewAgent} />
      </div>

      {/* System Overview */}
      <SystemOverview agents={agents} />

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map(agent => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onStart={() => startAgent(agent.id)}
            onStop={() => stopAgent(agent.id)}
            onPause={() => pauseAgent(agent.id)}
            onConfigure={() => configureAgent(agent.id)}
          />
        ))}
      </div>
    </div>
  );
};
