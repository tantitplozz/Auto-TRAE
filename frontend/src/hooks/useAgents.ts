/**
 * ✅ Trae AI Agent System - useAgents Hook
 * React hook for agent management with real-time updates
 */

import { useState, useEffect, useCallback } from 'react';
import { apiService, Agent } from '../services/api';
import { wsService } from '../services/websocket';

export interface UseAgentsReturn {
  agents: Agent[];
  loading: boolean;
  error: string | null;
  selectedAgent: Agent | null;
  
  // Actions
  fetchAgents: () => Promise<void>;
  createAgent: (agentData: Partial<Agent>) => Promise<boolean>;
  updateAgent: (id: string, agentData: Partial<Agent>) => Promise<boolean>;
  deleteAgent: (id: string) => Promise<boolean>;
  selectAgent: (agent: Agent | null) => void;
  refreshAgent: (id: string) => Promise<void>;
  
  // Filters and Search
  filteredAgents: Agent[];
  setStatusFilter: (status: string | null) => void;
  setSearchQuery: (query: string) => void;
  statusFilter: string | null;
  searchQuery: string;
}

export const useAgents = (): UseAgentsReturn => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ✅ Fetch agents from API
  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getAgents();
      
      if (response.success && response.data) {
        setAgents(response.data);
      } else {
        setError(response.error || 'Failed to fetch agents');
      }
    } catch (err) {
      setError('Network error while fetching agents');
      console.error('Error fetching agents:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Create new agent
  const createAgent = useCallback(async (agentData: Partial<Agent>): Promise<boolean> => {
    try {
      setError(null);
      
      const response = await apiService.createAgent(agentData);
      
      if (response.success && response.data) {
        setAgents(prev => [...prev, response.data!]);
        return true;
      } else {
        setError(response.error || 'Failed to create agent');
        return false;
      }
    } catch (err) {
      setError('Network error while creating agent');
      console.error('Error creating agent:', err);
      return false;
    }
  }, []);

  // ✅ Update existing agent
  const updateAgent = useCallback(async (id: string, agentData: Partial<Agent>): Promise<boolean> => {
    try {
      setError(null);
      
      const response = await apiService.updateAgent(id, agentData);
      
      if (response.success && response.data) {
        setAgents(prev => prev.map(agent => 
          agent.id === id ? response.data! : agent
        ));
        
        // Update selected agent if it's the one being updated
        if (selectedAgent?.id === id) {
          setSelectedAgent(response.data);
        }
        
        return true;
      } else {
        setError(response.error || 'Failed to update agent');
        return false;
      }
    } catch (err) {
      setError('Network error while updating agent');
      console.error('Error updating agent:', err);
      return false;
    }
  }, [selectedAgent]);

  // ✅ Delete agent
  const deleteAgent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      
      const response = await apiService.deleteAgent(id);
      
      if (response.success) {
        setAgents(prev => prev.filter(agent => agent.id !== id));
        
        // Clear selected agent if it's the one being deleted
        if (selectedAgent?.id === id) {
          setSelectedAgent(null);
        }
        
        return true;
      } else {
        setError(response.error || 'Failed to delete agent');
        return false;
      }
    } catch (err) {
      setError('Network error while deleting agent');
      console.error('Error deleting agent:', err);
      return false;
    }
  }, [selectedAgent]);

  // ✅ Select agent
  const selectAgent = useCallback((agent: Agent | null) => {
    setSelectedAgent(agent);
  }, []);

  // ✅ Refresh specific agent
  const refreshAgent = useCallback(async (id: string) => {
    try {
      const response = await apiService.getAgent(id);
      
      if (response.success && response.data) {
        setAgents(prev => prev.map(agent => 
          agent.id === id ? response.data! : agent
        ));
        
        if (selectedAgent?.id === id) {
          setSelectedAgent(response.data);
        }
      }
    } catch (err) {
      console.error('Error refreshing agent:', err);
    }
  }, [selectedAgent]);

  // ✅ Filtered agents based on status and search query
  const filteredAgents = agents.filter(agent => {
    const matchesStatus = !statusFilter || agent.status === statusFilter;
    const matchesSearch = !searchQuery || 
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // ✅ WebSocket event handlers
  useEffect(() => {
    const handleAgentStatusChanged = (data: { agentId: string; status: string; timestamp: string }) => {
      setAgents(prev => prev.map(agent => 
        agent.id === data.agentId 
          ? { ...agent, status: data.status as Agent['status'], updatedAt: data.timestamp }
          : agent
      ));
      
      if (selectedAgent?.id === data.agentId) {
        setSelectedAgent(prev => prev ? { 
          ...prev, 
          status: data.status as Agent['status'], 
          updatedAt: data.timestamp 
        } : null);
      }
    };

    const handleDetectionScoreUpdated = (data: { agentId: string; score: number; timestamp: string }) => {
      setAgents(prev => prev.map(agent => 
        agent.id === data.agentId 
          ? { ...agent, detectionScore: data.score, updatedAt: data.timestamp }
          : agent
      ));
      
      if (selectedAgent?.id === data.agentId) {
        setSelectedAgent(prev => prev ? { 
          ...prev, 
          detectionScore: data.score, 
          updatedAt: data.timestamp 
        } : null);
      }
    };

    const handleAgentError = (data: { agentId: string; error: string; timestamp: string }) => {
      setAgents(prev => prev.map(agent => 
        agent.id === data.agentId 
          ? { ...agent, status: 'error', updatedAt: data.timestamp }
          : agent
      ));
      
      if (selectedAgent?.id === data.agentId) {
        setSelectedAgent(prev => prev ? { 
          ...prev, 
          status: 'error', 
          updatedAt: data.timestamp 
        } : null);
      }
      
      // Show error notification
      console.error(`Agent ${data.agentId} error:`, data.error);
    };

    // Subscribe to WebSocket events
    wsService.on('agent:status_changed', handleAgentStatusChanged);
    wsService.on('agent:detection_score_updated', handleDetectionScoreUpdated);
    wsService.on('agent:error', handleAgentError);

    // Cleanup
    return () => {
      wsService.off('agent:status_changed', handleAgentStatusChanged);
      wsService.off('agent:detection_score_updated', handleDetectionScoreUpdated);
      wsService.off('agent:error', handleAgentError);
    };
  }, [selectedAgent]);

  // ✅ Initial data fetch
  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // ✅ Auto-refresh agents periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && wsService.isConnected()) {
        // Only refresh if WebSocket is not connected
        return;
      }
      fetchAgents();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [loading, fetchAgents]);

  return {
    agents,
    loading,
    error,
    selectedAgent,
    fetchAgents,
    createAgent,
    updateAgent,
    deleteAgent,
    selectAgent,
    refreshAgent,
    filteredAgents,
    setStatusFilter,
    setSearchQuery,
    statusFilter,
    searchQuery
  };
};