/**
 * ✅ Trae AI Agent System - TaskMonitor Component
 * Real-time task queue monitoring and management
 */

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Pause,
  Play,
  RotateCcw,
  Filter,
  Search,
  MoreVertical,
  Zap,
  TrendingUp,
  Users,
  ShoppingCart,
  Settings,
  Download,
  RefreshCw,
  Shield,
  Target,
  Cpu,
  BarChart3,
  Timer,
  AlertCircle,
  PlayCircle,
  StopCircle,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  Layers
} from 'lucide-react';
import { useTaskContext } from '../../contexts/TaskContext';
import { TaskStatus } from '../../types/task';

interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
}

interface TaskMetrics {
  totalTasks: number;
  successRate: number;
  avgProcessingTime: number;
  throughput: number;
}

const TaskMonitor: React.FC = () => {
  const {
    tasks,
    queueStats,
    analytics,
    filters,
    loading,
    error,
    createTask,
    cancelTask,
    retryTask,
    pauseQueue,
    resumeQueue,
    clearQueue,
    setFilters,
    searchTasks,
    exportTasks,
    refreshTasks
  } = useTaskContext();

  const [selectedTask, setSelectedTask] = useState<TaskStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    // Update filters when local state changes
    setFilters({
      status: statusFilter || undefined,
      type: typeFilter || undefined,
      search: searchQuery || undefined,
      timeRange: timeRange as any
    });
  }, [searchQuery, statusFilter, typeFilter, timeRange, setFilters]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'active':
        return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'waiting':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'delayed':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800';
      case 'delayed':
        return 'bg-orange-100 text-orange-800';
      case 'paused':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <ShoppingCart className="w-4 h-4 text-green-600" />;
      case 'stealth':
        return <Zap className="w-4 h-4 text-purple-600" />;
      case 'warmup':
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredTasks = searchQuery ? searchTasks(searchQuery) : tasks;

  // Advanced Controls Component
  const AdvancedControls: React.FC = () => (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-6 text-white mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Shield className="w-6 h-6 text-blue-400" />
          <h3 className="text-lg font-semibold">Military-Grade Task Control Center</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400">Real-time Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => pauseQueue()}
          className="flex items-center justify-center space-x-2 bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg transition-colors"
        >
          <Pause className="w-4 h-4" />
          <span>Pause Queue</span>
        </button>

        <button
          onClick={() => resumeQueue()}
          className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
        >
          <PlayCircle className="w-4 h-4" />
          <span>Resume Queue</span>
        </button>

        <button
          onClick={() => clearQueue()}
          className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Failed</span>
        </button>

        <button
          onClick={() => exportTasks()}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export Data</span>
        </button>
      </div>
    </div>
  );

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
    trend?: number;
  }> = ({ title, value, icon, color, subtitle, trend }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 hover:shadow-lg transition-shadow" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <div className={`flex items-center mt-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-3 h-3 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
              <span className="text-xs font-medium">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
          {icon}
        </div>
      </div>
    </div>
  );

  // Task Execution Timeline Component
  const TaskExecutionTimeline: React.FC<{ task: TaskStatus }> = ({ task }) => {
    const phases = [
      { name: 'Created', time: task.createdAt, status: 'completed' },
      { name: 'Started', time: task.startedAt, status: task.startedAt ? 'completed' : 'pending' },
      { name: 'Processing', time: task.startedAt, status: task.status === 'active' ? 'active' : task.completedAt ? 'completed' : 'pending' },
      { name: 'Completed', time: task.completedAt, status: task.completedAt ? 'completed' : task.status === 'failed' ? 'failed' : 'pending' }
    ];

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Execution Timeline</h4>
        <div className="space-y-2">
          {phases.map((phase, index) => (
            <div key={phase.name} className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                phase.status === 'completed' ? 'bg-green-500' :
                phase.status === 'active' ? 'bg-blue-500 animate-pulse' :
                phase.status === 'failed' ? 'bg-red-500' : 'bg-gray-300'
              }`} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{phase.name}</span>
                  {phase.time && (
                    <span className="text-xs text-gray-500">
                      {new Date(phase.time).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const TaskCard: React.FC<{ task: TaskStatus }> = ({ task }) => {
    const duration = task.completedAt && task.startedAt
      ? Math.round((new Date(task.completedAt).getTime() - new Date(task.startedAt).getTime()) / 1000)
      : task.startedAt
        ? Math.round((Date.now() - new Date(task.startedAt).getTime()) / 1000)
        : 0;

    return (
      <div
        className={`bg-white rounded-lg shadow-md p-4 border-2 transition-all cursor-pointer hover:shadow-lg ${
          selectedTask?.id === task.id ? 'border-blue-500' : 'border-gray-200'
        } ${task.priority === 'high' ? 'ring-2 ring-red-200' : ''}`}
        onClick={() => setSelectedTask(task)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {getTypeIcon(task.type)}
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold text-gray-900">
                  {task.type.charAt(0).toUpperCase() + task.type.slice(1)} Task
                </h3>
                {task.priority === 'high' && (
                  <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                    HIGH
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">ID: {task.id.slice(0, 8)}...</p>
              {task.agentId && (
                <p className="text-xs text-blue-600">Agent: {task.agentId.slice(0, 8)}...</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
              {task.status}
            </span>
            {getStatusIcon(task.status)}
          </div>
        </div>

        <div className="space-y-2">
          {/* Progress Bar */}
          {task.progress !== undefined && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Progress</span>
                <span>{task.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${task.progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Performance Metrics */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-gray-50 rounded p-2">
              <div className="flex items-center space-x-1">
                <Timer className="w-3 h-3 text-gray-500" />
                <span className="text-gray-600">Duration</span>
              </div>
              <p className="font-medium text-gray-900">{duration}s</p>
            </div>

            {task.retryCount !== undefined && task.retryCount > 0 && (
              <div className="bg-yellow-50 rounded p-2">
                <div className="flex items-center space-x-1">
                  <RotateCcw className="w-3 h-3 text-yellow-600" />
                  <span className="text-yellow-600">Retries</span>
                </div>
                <p className="font-medium text-yellow-900">{task.retryCount}</p>
              </div>
            )}

            {task.priority && (
              <div className={`rounded p-2 ${
                task.priority === 'high' ? 'bg-red-50' :
                task.priority === 'medium' ? 'bg-yellow-50' : 'bg-green-50'
              }`}>
                <div className="flex items-center space-x-1">
                  <Target className={`w-3 h-3 ${
                    task.priority === 'high' ? 'text-red-600' :
                    task.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                  }`} />
                  <span className={`${
                    task.priority === 'high' ? 'text-red-600' :
                    task.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                  }`}>Priority</span>
                </div>
                <p className={`font-medium ${
                  task.priority === 'high' ? 'text-red-900' :
                  task.priority === 'medium' ? 'text-yellow-900' : 'text-green-900'
                }`}>{task.priority}</p>
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>
              <span className="font-medium">Created:</span>
              <br />
              {new Date(task.createdAt).toLocaleString()}
            </div>
            {task.completedAt && (
              <div>
                <span className="font-medium">Completed:</span>
                <br />
                {new Date(task.completedAt).toLocaleString()}
              </div>
            )}
          </div>

          {/* Error Diagnostics */}
          {task.error && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h5 className="text-xs font-medium text-red-800 mb-1">Error Diagnostics</h5>
                  <p className="text-xs text-red-700 mb-2">{task.error}</p>
                  {task.errorCode && (
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="bg-red-200 text-red-800 px-2 py-0.5 rounded">
                        Code: {task.errorCode}
                      </span>
                      {task.errorCategory && (
                        <span className="bg-red-200 text-red-800 px-2 py-0.5 rounded">
                          {task.errorCategory}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            {task.status === 'failed' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  retryTask(task.id);
                }}
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md text-xs font-medium transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Auto-Retry</span>
              </button>
            )}

            {(task.status === 'waiting' || task.status === 'active') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  cancelTask(task.id);
                }}
                className="flex items-center space-x-1 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-md text-xs font-medium transition-colors"
              >
                <StopCircle className="w-3 h-3" />
                <span>Terminate</span>
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTask(task);
              }}
              className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md text-xs font-medium transition-colors"
            >
              <Eye className="w-3 h-3" />
              <span>Inspect</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Military-Grade Task Monitor</h1>
          <p className="text-gray-600">Real-time task execution monitoring with advanced diagnostics</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => refreshTasks()}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Advanced</span>
          </button>
        </div>
      </div>

      {/* Advanced Controls */}
      <AdvancedControls />

      {/* Queue Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Waiting"
          value={queueStats.waiting}
          icon={<Clock className="w-6 h-6 text-yellow-600" />}
          color="#f59e0b"
          trend={analytics?.queueTrends?.waiting}
        />
        <StatCard
          title="Active"
          value={queueStats.active}
          icon={<Activity className="w-6 h-6 text-blue-600" />}
          color="#3b82f6"
          trend={analytics?.queueTrends?.active}
        />
        <StatCard
          title="Completed"
          value={queueStats.completed}
          icon={<CheckCircle className="w-6 h-6 text-green-600" />}
          color="#10b981"
          trend={analytics?.queueTrends?.completed}
        />
        <StatCard
          title="Failed"
          value={queueStats.failed}
          icon={<XCircle className="w-6 h-6 text-red-600" />}
          color="#ef4444"
          trend={analytics?.queueTrends?.failed}
        />
        <StatCard
          title="Delayed"
          value={queueStats.delayed}
          icon={<Clock className="w-6 h-6 text-orange-600" />}
          color="#f97316"
          trend={analytics?.queueTrends?.delayed}
        />
        <StatCard
          title="Paused"
          value={queueStats.paused}
          icon={<Pause className="w-6 h-6 text-gray-600" />}
          color="#6b7280"
          trend={analytics?.queueTrends?.paused}
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Tasks"
          value={analytics?.totalTasks || 0}
          icon={<Users className="w-6 h-6 text-purple-600" />}
          color="#8b5cf6"
          trend={analytics?.trends?.totalTasks}
        />
        <StatCard
          title="Success Rate"
          value={Math.round(analytics?.successRate || 0)}
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          color="#10b981"
          subtitle="%"
          trend={analytics?.trends?.successRate}
        />
        <StatCard
          title="Avg Processing"
          value={Math.round(analytics?.avgProcessingTime || 0)}
          icon={<Timer className="w-6 h-6 text-blue-600" />}
          color="#3b82f6"
          subtitle="seconds"
          trend={analytics?.trends?.avgProcessingTime}
        />
        <StatCard
          title="Throughput"
          value={Math.round(analytics?.throughput || 0)}
          icon={<Zap className="w-6 h-6 text-yellow-600" />}
          color="#f59e0b"
          subtitle="tasks/hour"
          trend={analytics?.trends?.throughput}
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks by ID, type, agent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-3">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="waiting">Waiting</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="delayed">Delayed</option>
                <option value="paused">Paused</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="purchase">Purchase</option>
                <option value="stealth">Stealth</option>
                <option value="warmup">Warmup</option>
                <option value="verification">Verification</option>
                <option value="monitoring">Monitoring</option>
              </select>

              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Advanced Filters</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
                  <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                    <option value="">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Retry Count</label>
                  <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                    <option value="">Any</option>
                    <option value="0">No Retries</option>
                    <option value="1-3">1-3 Retries</option>
                    <option value="4+">4+ Retries</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Duration</label>
                  <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                    <option value="">Any Duration</option>
                    <option value="fast">< 30s</option>
                    <option value="medium">30s - 5m</option>
                    <option value="slow">> 5m</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Error Category</label>
                  <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                    <option value="">All Errors</option>
                    <option value="network">Network</option>
                    <option value="authentication">Auth</option>
                    <option value="validation">Validation</option>
                    <option value="timeout">Timeout</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading tasks...</span>
        </div>
      )}

      {/* Real-time Performance Dashboard */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Real-time Performance Dashboard</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Tasks/Min</p>
                <p className="text-2xl font-bold text-blue-900">{analytics?.throughput || 0}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Success Rate</p>
                <p className="text-2xl font-bold text-green-900">{analytics?.successRate || 0}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Avg Response</p>
                <p className="text-2xl font-bold text-yellow-900">{analytics?.avgResponseTime || 0}ms</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Error Rate</p>
                <p className="text-2xl font-bold text-red-900">{analytics?.errorRate || 0}%</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <Activity className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-600">
            {searchQuery || statusFilter || typeFilter
              ? 'Try adjusting your search or filter criteria'
              : 'Tasks will appear here when agents start working'
            }
          </p>
        </div>
      )}

      {/* Enhanced Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Task Intelligence Center</h3>
                  <p className="text-sm text-gray-600">Advanced Task Analysis & Diagnostics</p>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Task Overview */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Task Overview</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700">Task ID:</span>
                        <span className="text-sm text-gray-900 font-mono">{selectedTask.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700">Type:</span>
                        <span className="text-sm text-gray-900">{selectedTask.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700">Status:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedTask.status)}`}>
                          {selectedTask.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700">Priority:</span>
                        <span className={`text-sm font-semibold ${selectedTask.priority === 'high' ? 'text-red-600' : selectedTask.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                          {selectedTask.priority?.toUpperCase() || 'NORMAL'}
                        </span>
                      </div>
                      {selectedTask.agentId && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-700">Agent ID:</span>
                          <span className="text-sm text-gray-900 font-mono">{selectedTask.agentId}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress & Performance */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Progress & Performance</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">Progress</span>
                          <span className="text-sm text-gray-900">{selectedTask.progress}%</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${selectedTask.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Duration:</span>
                          <p className="text-sm text-gray-900">
                            {selectedTask.startedAt
                              ? `${Math.round((Date.now() - new Date(selectedTask.startedAt).getTime()) / 1000)}s`
                              : 'Not started'
                            }
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Retries:</span>
                          <p className="text-sm text-gray-900">{selectedTask.retryCount || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Task Execution Timeline */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Execution Timeline</h4>
                    <TaskExecutionTimeline task={selectedTask} />
                  </div>

                  {/* Error Diagnostics */}
                  {selectedTask.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-900 mb-3 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Error Diagnostics
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-red-700">Error Message:</span>
                          <p className="text-sm text-red-800 bg-red-100 p-2 rounded mt-1">{selectedTask.error}</p>
                        </div>
                        {selectedTask.errorCode && (
                          <div>
                            <span className="text-sm font-medium text-red-700">Error Code:</span>
                            <p className="text-sm text-red-800">{selectedTask.errorCode}</p>
                          </div>
                        )}
                        {selectedTask.errorCategory && (
                          <div>
                            <span className="text-sm font-medium text-red-700">Category:</span>
                            <p className="text-sm text-red-800">{selectedTask.errorCategory}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                {selectedTask.status === 'failed' && (
                  <button
                    onClick={() => retryTask(selectedTask.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Retry Task
                  </button>
                )}
                {(selectedTask.status === 'waiting' || selectedTask.status === 'active') && (
                  <button
                    onClick={() => cancelTask(selectedTask.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                  >
                    <StopCircle className="w-4 h-4 mr-2" />
                    Terminate
                  </button>
                )}
                <button
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskMonitor;
