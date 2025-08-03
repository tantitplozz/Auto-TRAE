/**
 * ✅ Trae AI Agent System - Dashboard Component
 * Main dashboard with real-time monitoring and controls
 */

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Bot, 
  ShoppingCart, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Server,
  Zap
} from 'lucide-react';
import { useAgents } from '../../hooks/useAgents';
import { usePurchases } from '../../hooks/usePurchases';
import { apiService } from '../../services/api';
import { wsService, ConnectionState } from '../../services/websocket';

interface DashboardStats {
  totalAgents: number;
  activeAgents: number;
  totalPurchases: number;
  successfulPurchases: number;
  failedPurchases: number;
  averageDetectionScore: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

interface SystemMetrics {
  cpu: number;
  memory: number;
  activeConnections: number;
  queueSize: number;
}

const Dashboard: React.FC = () => {
  const { agents, loading: agentsLoading } = useAgents();
  const { purchases, loading: purchasesLoading } = usePurchases();
  const [stats, setStats] = useState<DashboardStats>({
    totalAgents: 0,
    activeAgents: 0,
    totalPurchases: 0,
    successfulPurchases: 0,
    failedPurchases: 0,
    averageDetectionScore: 0,
    systemHealth: 'healthy'
  });
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    activeConnections: 0,
    queueSize: 0
  });
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    wsService.getConnectionState()
  );

  // ✅ Calculate dashboard statistics
  useEffect(() => {
    if (!agentsLoading && !purchasesLoading) {
      const activeAgents = agents.filter(agent => agent.status === 'active').length;
      const successfulPurchases = purchases.filter(p => p.status === 'completed').length;
      const failedPurchases = purchases.filter(p => p.status === 'failed').length;
      const averageDetectionScore = agents.length > 0 
        ? agents.reduce((sum, agent) => sum + agent.detectionScore, 0) / agents.length 
        : 0;

      // Determine system health based on metrics
      let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (averageDetectionScore > 0.7 || failedPurchases > successfulPurchases) {
        systemHealth = 'critical';
      } else if (averageDetectionScore > 0.5 || activeAgents < agents.length * 0.5) {
        systemHealth = 'warning';
      }

      setStats({
        totalAgents: agents.length,
        activeAgents,
        totalPurchases: purchases.length,
        successfulPurchases,
        failedPurchases,
        averageDetectionScore,
        systemHealth
      });
    }
  }, [agents, purchases, agentsLoading, purchasesLoading]);

  // ✅ Fetch system health metrics
  useEffect(() => {
    const fetchSystemHealth = async () => {
      try {
        const response = await apiService.getSystemHealth();
        if (response.success && response.data) {
          setSystemMetrics(response.data.metrics || {
            cpu: 0,
            memory: 0,
            activeConnections: 0,
            queueSize: 0
          });
        }
      } catch (error) {
        console.error('Error fetching system health:', error);
      }
    };

    fetchSystemHealth();
    const interval = setInterval(fetchSystemHealth, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // ✅ Listen to WebSocket connection state changes
  useEffect(() => {
    const handleConnectionStateChange = (state: ConnectionState) => {
      setConnectionState(state);
    };

    wsService.onConnectionStateChange(handleConnectionStateChange);

    return () => {
      wsService.offConnectionStateChange(handleConnectionStateChange);
    };
  }, []);

  // ✅ Listen to system events
  useEffect(() => {
    const handleSystemHealthUpdate = (data: { status: string; metrics: any }) => {
      setSystemMetrics(data.metrics);
    };

    const handleSystemAlert = (data: { level: string; message: string }) => {
      // Handle system alerts (could show notifications)
      console.log(`System Alert [${data.level}]:`, data.message);
    };

    wsService.on('system:health_update', handleSystemHealthUpdate);
    wsService.on('system:alert', handleSystemAlert);

    return () => {
      wsService.off('system:health_update', handleSystemHealthUpdate);
      wsService.off('system:alert', handleSystemAlert);
    };
  }, []);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getConnectionStateColor = (state: ConnectionState) => {
    switch (state) {
      case ConnectionState.CONNECTED: return 'text-green-600';
      case ConnectionState.CONNECTING: 
      case ConnectionState.RECONNECTING: return 'text-yellow-600';
      case ConnectionState.DISCONNECTED:
      case ConnectionState.ERROR: return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="text-3xl" style={{ color }}>
          {icon}
        </div>
      </div>
    </div>
  );

  const MetricBar: React.FC<{
    label: string;
    value: number;
    max: number;
    color: string;
  }> = ({ label, value, max, color }) => (
    <div className="mb-4">
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>{label}</span>
        <span>{value.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="h-2 rounded-full transition-all duration-300"
          style={{ 
            width: `${Math.min((value / max) * 100, 100)}%`,
            backgroundColor: color 
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Trae AI Agent System Overview</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              connectionState === ConnectionState.CONNECTED ? 'bg-green-500' : 
              connectionState === ConnectionState.CONNECTING || connectionState === ConnectionState.RECONNECTING ? 'bg-yellow-500' : 
              'bg-red-500'
            }`} />
            <span className={`text-sm font-medium ${getConnectionStateColor(connectionState)}`}>
              {connectionState.charAt(0).toUpperCase() + connectionState.slice(1)}
            </span>
          </div>
          
          {/* System Health */}
          <div className="flex items-center space-x-2">
            <Server className={`w-5 h-5 ${getHealthColor(stats.systemHealth)}`} />
            <span className={`text-sm font-medium ${getHealthColor(stats.systemHealth)}`}>
              {stats.systemHealth.charAt(0).toUpperCase() + stats.systemHealth.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Agents"
          value={stats.totalAgents}
          icon={<Bot />}
          color="#3B82F6"
          subtitle={`${stats.activeAgents} active`}
        />
        <StatCard
          title="Purchases"
          value={stats.totalPurchases}
          icon={<ShoppingCart />}
          color="#10B981"
          subtitle={`${stats.successfulPurchases} successful`}
        />
        <StatCard
          title="Detection Score"
          value={`${(stats.averageDetectionScore * 100).toFixed(1)}%`}
          icon={<AlertTriangle />}
          color={stats.averageDetectionScore > 0.7 ? "#EF4444" : stats.averageDetectionScore > 0.5 ? "#F59E0B" : "#10B981"}
          subtitle="Average across agents"
        />
        <StatCard
          title="Success Rate"
          value={`${stats.totalPurchases > 0 ? ((stats.successfulPurchases / stats.totalPurchases) * 100).toFixed(1) : 0}%`}
          icon={<TrendingUp />}
          color="#8B5CF6"
          subtitle={`${stats.failedPurchases} failed`}
        />
      </div>

      {/* System Metrics and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Metrics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">System Metrics</h2>
            <Activity className="w-5 h-5 text-gray-500" />
          </div>
          
          <div className="space-y-4">
            <MetricBar
              label="CPU Usage"
              value={systemMetrics.cpu}
              max={100}
              color={systemMetrics.cpu > 80 ? "#EF4444" : systemMetrics.cpu > 60 ? "#F59E0B" : "#10B981"}
            />
            <MetricBar
              label="Memory Usage"
              value={systemMetrics.memory}
              max={100}
              color={systemMetrics.memory > 80 ? "#EF4444" : systemMetrics.memory > 60 ? "#F59E0B" : "#10B981"}
            />
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{systemMetrics.activeConnections}</p>
                <p className="text-sm text-gray-600">Active Connections</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{systemMetrics.queueSize}</p>
                <p className="text-sm text-gray-600">Queue Size</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <Zap className="w-5 h-5 text-gray-500" />
          </div>
          
          <div className="space-y-3">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Create New Agent
            </button>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Start Purchase Task
            </button>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Run System Check
            </button>
            <button className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              View Logs
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <Users className="w-5 h-5 text-gray-500" />
        </div>
        
        <div className="space-y-3">
          {purchases.slice(0, 5).map((purchase) => (
            <div key={purchase.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  purchase.status === 'completed' ? 'bg-green-500' :
                  purchase.status === 'failed' ? 'bg-red-500' :
                  purchase.status === 'processing' ? 'bg-blue-500' :
                  'bg-gray-500'
                }`} />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Purchase {purchase.id.slice(0, 8)}...
                  </p>
                  <p className="text-xs text-gray-500">
                    {new URL(purchase.productUrl).hostname}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium capitalize text-gray-900">
                  {purchase.status}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(purchase.updatedAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {purchases.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No recent purchases</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;