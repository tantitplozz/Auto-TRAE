/**
 * ✅ Trae AI Agent System - AgentList Component
 * Advanced agent management with real-time updates
 */

import React, { useState } from 'react';
import { 
  Bot, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Play, 
  Pause, 
  Settings, 
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { useAgents } from '../../hooks/useAgents';
import { Agent } from '../../services/api';

const AgentList: React.FC = () => {
  const {
    filteredAgents,
    loading,
    error,
    selectedAgent,
    selectAgent,
    updateAgent,
    deleteAgent,
    setStatusFilter,
    setSearchQuery,
    statusFilter,
    searchQuery
  } = useAgents();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const getStatusIcon = (status: Agent['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      case 'busy':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'busy':
        return 'bg-blue-100 text-blue-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDetectionScoreColor = (score: number) => {
    if (score <= 0.3) return 'text-green-600';
    if (score <= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleStatusToggle = async (agent: Agent) => {
    const newStatus = agent.status === 'active' ? 'inactive' : 'active';
    await updateAgent(agent.id, { status: newStatus });
  };

  const handleDeleteAgent = async (agentId: string) => {
    const success = await deleteAgent(agentId);
    if (success) {
      setShowDeleteConfirm(null);
    }
  };

  const AgentCard: React.FC<{ agent: Agent }> = ({ agent }) => (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 border-2 transition-all cursor-pointer hover:shadow-lg ${
        selectedAgent?.id === agent.id ? 'border-blue-500' : 'border-gray-200'
      }`}
      onClick={() => selectAgent(agent)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bot className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
            <p className="text-sm text-gray-500">ID: {agent.id.slice(0, 8)}...</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
            {agent.status}
          </span>
          <div className="relative">
            <button className="p-1 hover:bg-gray-100 rounded">
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* Status and Detection Score */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon(agent.status)}
            <span className="text-sm text-gray-600">
              {agent.status === 'active' ? 'Running' : 
               agent.status === 'busy' ? 'Processing' :
               agent.status === 'error' ? 'Error' : 'Stopped'}
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Detection Score</p>
            <p className={`text-lg font-bold ${getDetectionScoreColor(agent.detectionScore)}`}>
              {(agent.detectionScore * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Stealth Configuration */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm font-medium text-gray-700 mb-2">Stealth Config</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Proxy</span>
              <span className={agent.stealthConfig.useProxy ? 'text-green-600' : 'text-gray-400'}>
                {agent.stealthConfig.useProxy ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Fingerprint</span>
              <span className={agent.stealthConfig.fingerprintSpoofing ? 'text-green-600' : 'text-gray-400'}>
                {agent.stealthConfig.fingerprintSpoofing ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Behavior</span>
              <span className={agent.stealthConfig.behaviorEmulation ? 'text-green-600' : 'text-gray-400'}>
                {agent.stealthConfig.behaviorEmulation ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Warming</span>
              <span className={agent.stealthConfig.sessionWarming ? 'text-green-600' : 'text-gray-400'}>
                {agent.stealthConfig.sessionWarming ? '✓' : '✗'}
              </span>
            </div>
          </div>
        </div>

        {/* Last Active */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Last Active</span>
          <span>{new Date(agent.lastActive).toLocaleString()}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStatusToggle(agent);
            }}
            className={`flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              agent.status === 'active' 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {agent.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{agent.status === 'active' ? 'Stop' : 'Start'}</span>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Handle settings
            }}
            className="flex items-center justify-center p-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteConfirm(agent.id);
            }}
            className="flex items-center justify-center p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Agents</h1>
          <p className="text-gray-600">Manage your stealth automation agents</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Create Agent</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter || ''}
            onChange={(e) => setStatusFilter(e.target.value || null)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="busy">Busy</option>
            <option value="error">Error</option>
          </select>
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
          <span className="ml-2 text-gray-600">Loading agents...</span>
        </div>
      )}

      {/* Agents Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <Bot className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || statusFilter 
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by creating your first AI agent'
            }
          </p>
          {!searchQuery && !statusFilter && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Create Your First Agent
            </button>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Agent</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this agent? All associated data will be permanently removed.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteAgent(showDeleteConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentList;