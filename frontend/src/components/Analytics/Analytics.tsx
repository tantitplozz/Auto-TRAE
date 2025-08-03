/**
 * ✅ Trae AI Agent System - Analytics Component
 * Advanced analytics and performance monitoring dashboard
 */

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Activity, 
  DollarSign,
  Users,
  ShoppingCart,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import { apiService } from '../../services/api';

interface AnalyticsData {
  overview: {
    totalAgents: number;
    activeAgents: number;
    totalPurchases: number;
    successfulPurchases: number;
    totalRevenue: number;
    avgProcessingTime: number;
  };
  trends: {
    period: string;
    purchases: number;
    revenue: number;
    successRate: number;
    avgDetectionScore: number;
  }[];
  agentPerformance: {
    agentId: string;
    agentName: string;
    totalTasks: number;
    successRate: number;
    avgProcessingTime: number;
    detectionScore: number;
  }[];
  purchasesByStatus: {
    status: string;
    count: number;
    percentage: number;
  }[];
  revenueByPeriod: {
    period: string;
    revenue: number;
    purchases: number;
  }[];
  detectionMetrics: {
    avgScore: number;
    riskLevel: 'low' | 'medium' | 'high';
    flaggedAgents: number;
    recommendations: string[];
  };
}

const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAnalytics(timeRange);
      setData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  const exportData = async () => {
    try {
      const response = await apiService.exportAnalytics(timeRange);
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trae-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to export data');
    }
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }> = ({ title, value, change, icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change >= 0 ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
          {icon}
        </div>
      </div>
    </div>
  );

  const ChartCard: React.FC<{
    title: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
  }> = ({ title, children, actions }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {actions}
      </div>
      {children}
    </div>
  );

  const ProgressBar: React.FC<{ 
    value: number; 
    max: number; 
    color: string; 
    label: string;
  }> = ({ value, max, color, label }) => (
    <div className="mb-3">
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>{label}</span>
        <span>{value}/{max}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="h-2 rounded-full transition-all duration-300"
          style={{ 
            width: `${(value / max) * 100}%`,
            backgroundColor: color
          }}
        ></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>{error || 'Failed to load analytics data'}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Performance insights and system metrics</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          <button
            onClick={exportData}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <MetricCard
          title="Total Agents"
          value={data.overview.totalAgents}
          icon={<Users className="w-6 h-6 text-blue-600" />}
          color="#3b82f6"
          subtitle={`${data.overview.activeAgents} active`}
        />
        <MetricCard
          title="Total Purchases"
          value={data.overview.totalPurchases}
          icon={<ShoppingCart className="w-6 h-6 text-green-600" />}
          color="#10b981"
          subtitle={`${data.overview.successfulPurchases} successful`}
        />
        <MetricCard
          title="Success Rate"
          value={`${Math.round((data.overview.successfulPurchases / data.overview.totalPurchases) * 100)}%`}
          icon={<Target className="w-6 h-6 text-purple-600" />}
          color="#8b5cf6"
        />
        <MetricCard
          title="Total Revenue"
          value={`$${data.overview.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6 text-yellow-600" />}
          color="#f59e0b"
        />
        <MetricCard
          title="Avg Processing"
          value={`${Math.round(data.overview.avgProcessingTime)}s`}
          icon={<Clock className="w-6 h-6 text-indigo-600" />}
          color="#6366f1"
        />
        <MetricCard
          title="Detection Risk"
          value={data.detectionMetrics.riskLevel.toUpperCase()}
          icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
          color={
            data.detectionMetrics.riskLevel === 'low' ? '#10b981' :
            data.detectionMetrics.riskLevel === 'medium' ? '#f59e0b' : '#ef4444'
          }
          subtitle={`Score: ${Math.round(data.detectionMetrics.avgScore)}`}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Purchase Trends */}
        <ChartCard title="Purchase Trends">
          <div className="space-y-4">
            {data.trends.slice(-7).map((trend, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">{trend.period}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{trend.purchases} purchases</p>
                  <p className="text-xs text-gray-500">${trend.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Purchase Status Distribution */}
        <ChartCard title="Purchase Status Distribution">
          <div className="space-y-3">
            {data.purchasesByStatus.map((status, index) => (
              <ProgressBar
                key={index}
                label={status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                value={status.count}
                max={data.overview.totalPurchases}
                color={
                  status.status === 'completed' ? '#10b981' :
                  status.status === 'failed' ? '#ef4444' :
                  status.status === 'processing' ? '#3b82f6' :
                  status.status === 'pending' ? '#f59e0b' : '#6b7280'
                }
              />
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Agent Performance */}
        <ChartCard title="Top Performing Agents">
          <div className="space-y-3">
            {data.agentPerformance.slice(0, 5).map((agent, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{agent.agentName}</p>
                  <p className="text-xs text-gray-500">{agent.totalTasks} tasks</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">{Math.round(agent.successRate)}%</p>
                  <p className="text-xs text-gray-500">Score: {Math.round(agent.detectionScore)}</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Revenue Trends */}
        <ChartCard title="Revenue by Period">
          <div className="space-y-3">
            {data.revenueByPeriod.slice(-5).map((period, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{period.period}</span>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">${period.revenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{period.purchases} purchases</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Detection Metrics */}
        <ChartCard title="Detection & Security">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  data.detectionMetrics.riskLevel === 'low' ? 'bg-green-500' :
                  data.detectionMetrics.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm font-medium text-gray-900">Risk Level</span>
              </div>
              <span className={`text-sm font-medium ${
                data.detectionMetrics.riskLevel === 'low' ? 'text-green-600' :
                data.detectionMetrics.riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {data.detectionMetrics.riskLevel.toUpperCase()}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">Avg Detection Score</span>
              <span className="text-sm font-medium text-gray-600">
                {Math.round(data.detectionMetrics.avgScore)}/100
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">Flagged Agents</span>
              <span className={`text-sm font-medium ${
                data.detectionMetrics.flaggedAgents > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {data.detectionMetrics.flaggedAgents}
              </span>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Recommendations */}
      {data.detectionMetrics.recommendations.length > 0 && (
        <ChartCard title="Security Recommendations">
          <div className="space-y-3">
            {data.detectionMetrics.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <p className="text-sm text-yellow-800">{recommendation}</p>
              </div>
            ))}
          </div>
        </ChartCard>
      )}

      {/* Success Metrics Summary */}
      <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
        <div className="flex items-center space-x-3 mb-4">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">System Performance Summary</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {Math.round((data.overview.successfulPurchases / data.overview.totalPurchases) * 100)}%
            </p>
            <p className="text-sm text-gray-600">Overall Success Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {Math.round(data.overview.avgProcessingTime)}s
            </p>
            <p className="text-sm text-gray-600">Average Processing Time</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {data.overview.activeAgents}/{data.overview.totalAgents}
            </p>
            <p className="text-sm text-gray-600">Active Agents</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;