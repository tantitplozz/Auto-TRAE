/**
 * ✅ Advanced Stealth Analytics Dashboard
 * Military-grade analytics for stealth effectiveness and performance monitoring
 */

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Eye, 
  Globe, 
  Activity, 
  Zap, 
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  LineChart,
  Map,
  Clock,
  Cpu,
  Database,
  Network,
  Lock,
  Unlock,
  Star,
  Award,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

interface StealthData {
  detectionRates: {
    timestamp: string;
    rate: number;
    severity: 'low' | 'medium' | 'high';
  }[];
  successRates: {
    timestamp: string;
    rate: number;
    agent: string;
  }[];
  fingerprintUsage: {
    type: string;
    count: number;
    effectiveness: number;
  }[];
  geoData: {
    country: string;
    requests: number;
    successRate: number;
    detectionRate: number;
  }[];
  performanceMetrics: {
    avgResponseTime: number;
    throughput: number;
    errorRate: number;
    uptime: number;
  };
  threatIntelligence: {
    blockedIPs: number;
    suspiciousPatterns: number;
    mitigatedThreats: number;
    riskScore: number;
  };
}

// Chart Components
const DetectionRateChart: React.FC<{ data: StealthData['detectionRates'] }> = ({ data }) => {
  const maxRate = Math.max(...data.map(d => d.rate));
  
  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Eye className="w-5 h-5 mr-2 text-red-400" />
          Detection Rate Trends
        </h3>
        <div className="flex items-center space-x-2 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-green-400">Low</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="text-yellow-400">Medium</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <span className="text-red-400">High</span>
          </div>
        </div>
      </div>
      
      <div className="h-48 flex items-end space-x-1">
        {data.map((point, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div 
              className={`w-full rounded-t transition-all duration-300 ${
                point.severity === 'low' ? 'bg-green-400' :
                point.severity === 'medium' ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ height: `${(point.rate / maxRate) * 100}%` }}
            />
            <span className="text-xs text-gray-400 mt-1 transform rotate-45 origin-left">
              {new Date(point.timestamp).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-green-400">
            {data.filter(d => d.severity === 'low').length}
          </p>
          <p className="text-xs text-gray-400">Low Risk Days</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-yellow-400">
            {data.filter(d => d.severity === 'medium').length}
          </p>
          <p className="text-xs text-gray-400">Medium Risk Days</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-red-400">
            {data.filter(d => d.severity === 'high').length}
          </p>
          <p className="text-xs text-gray-400">High Risk Days</p>
        </div>
      </div>
    </div>
  );
};

const SuccessRateOverTime: React.FC<{ data: StealthData['successRates'] }> = ({ data }) => {
  const agents = [...new Set(data.map(d => d.agent))];
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  
  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
          Success Rate Over Time
        </h3>
        <div className="flex items-center space-x-2">
          {agents.map((agent, index) => (
            <div key={agent} className="flex items-center space-x-1 text-xs">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-gray-400">{agent}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="h-48 relative">
        <svg className="w-full h-full">
          {agents.map((agent, agentIndex) => {
            const agentData = data.filter(d => d.agent === agent);
            const points = agentData.map((point, index) => {
              const x = (index / (agentData.length - 1)) * 100;
              const y = 100 - point.rate;
              return `${x},${y}`;
            }).join(' ');
            
            return (
              <polyline
                key={agent}
                fill="none"
                stroke={colors[agentIndex % colors.length]}
                strokeWidth="2"
                points={points}
                className="transition-all duration-300"
              />
            );
          })}
        </svg>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-400">
            {Math.round(data.reduce((sum, d) => sum + d.rate, 0) / data.length)}%
          </p>
          <p className="text-xs text-gray-400">Average Success Rate</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-400">
            {Math.max(...data.map(d => d.rate))}%
          </p>
          <p className="text-xs text-gray-400">Peak Performance</p>
        </div>
      </div>
    </div>
  );
};

const FingerprintUsageChart: React.FC<{ data: StealthData['fingerprintUsage'] }> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  
  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Shield className="w-5 h-5 mr-2 text-blue-400" />
          Fingerprint Usage Distribution
        </h3>
        <div className="text-xs text-gray-400">
          Total: {total.toLocaleString()} fingerprints
        </div>
      </div>
      
      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = (item.count / total) * 100;
          const colors = ['bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400'];
          
          return (
            <div key={item.type} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white text-sm font-medium">{item.type}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 text-xs">{item.count.toLocaleString()}</span>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    item.effectiveness >= 90 ? 'bg-green-500/20 text-green-400' :
                    item.effectiveness >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {item.effectiveness}%
                  </div>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${colors[index % colors.length]} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-blue-400">
            {Math.round(data.reduce((sum, d) => sum + d.effectiveness, 0) / data.length)}%
          </p>
          <p className="text-xs text-gray-400">Avg Effectiveness</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-green-400">
            {data.filter(d => d.effectiveness >= 90).length}
          </p>
          <p className="text-xs text-gray-400">High Performance</p>
        </div>
      </div>
    </div>
  );
};

const GeographicDistribution: React.FC<{ data: StealthData['geoData'] }> = ({ data }) => {
  const sortedData = data.sort((a, b) => b.requests - a.requests);
  
  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Globe className="w-5 h-5 mr-2 text-purple-400" />
          Geographic Distribution
        </h3>
        <div className="text-xs text-gray-400">
          {data.length} countries
        </div>
      </div>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {sortedData.map((country, index) => (
          <div key={country.country} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                <span className="text-purple-400 font-bold text-xs">
                  {index + 1}
                </span>
              </div>
              <div>
                <p className="text-white font-medium">{country.country}</p>
                <p className="text-gray-400 text-xs">
                  {country.requests.toLocaleString()} requests
                </p>
              </div>
            </div>
            
            <div className="text-right space-y-1">
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                country.successRate >= 90 ? 'bg-green-500/20 text-green-400' :
                country.successRate >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {country.successRate}% success
              </div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                country.detectionRate <= 5 ? 'bg-green-500/20 text-green-400' :
                country.detectionRate <= 15 ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {country.detectionRate}% detected
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Performance Metrics Component
const PerformanceMetrics: React.FC<{ data: StealthData['performanceMetrics'] }> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-2">
          <Clock className="w-5 h-5 text-blue-400" />
          <TrendingDown className="w-4 h-4 text-green-400" />
        </div>
        <p className="text-2xl font-bold text-white">{data.avgResponseTime}ms</p>
        <p className="text-gray-400 text-sm">Avg Response Time</p>
        <div className="mt-2 w-full bg-gray-700 rounded-full h-1">
          <div className="bg-blue-400 h-1 rounded-full" style={{ width: '75%' }} />
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          <TrendingUp className="w-4 h-4 text-green-400" />
        </div>
        <p className="text-2xl font-bold text-white">{data.throughput.toLocaleString()}</p>
        <p className="text-gray-400 text-sm">Requests/Hour</p>
        <div className="mt-2 w-full bg-gray-700 rounded-full h-1">
          <div className="bg-yellow-400 h-1 rounded-full" style={{ width: '85%' }} />
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <TrendingDown className="w-4 h-4 text-green-400" />
        </div>
        <p className="text-2xl font-bold text-white">{data.errorRate}%</p>
        <p className="text-gray-400 text-sm">Error Rate</p>
        <div className="mt-2 w-full bg-gray-700 rounded-full h-1">
          <div className="bg-red-400 h-1 rounded-full" style={{ width: `${data.errorRate * 10}%` }} />
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-2">
          <Activity className="w-5 h-5 text-green-400" />
          <CheckCircle className="w-4 h-4 text-green-400" />
        </div>
        <p className="text-2xl font-bold text-white">{data.uptime}%</p>
        <p className="text-gray-400 text-sm">System Uptime</p>
        <div className="mt-2 w-full bg-gray-700 rounded-full h-1">
          <div className="bg-green-400 h-1 rounded-full" style={{ width: `${data.uptime}%` }} />
        </div>
      </div>
    </div>
  );
};

// Threat Intelligence Component
const ThreatIntelligence: React.FC<{ data: StealthData['threatIntelligence'] }> = ({ data }) => {
  const getRiskColor = (score: number) => {
    if (score <= 30) return 'text-green-400';
    if (score <= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRiskLevel = (score: number) => {
    if (score <= 30) return 'Low';
    if (score <= 70) return 'Medium';
    return 'High';
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Shield className="w-5 h-5 mr-2 text-red-400" />
          Threat Intelligence
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          data.riskScore <= 30 ? 'bg-green-500/20 text-green-400' :
          data.riskScore <= 70 ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          {getRiskLevel(data.riskScore)} Risk
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <p className="text-3xl font-bold text-red-400">{data.blockedIPs.toLocaleString()}</p>
          <p className="text-gray-400 text-sm">Blocked IPs</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-yellow-400">{data.suspiciousPatterns.toLocaleString()}</p>
          <p className="text-gray-400 text-sm">Suspicious Patterns</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Mitigated Threats</span>
          <span className="text-green-400 font-semibold">{data.mitigatedThreats.toLocaleString()}</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Overall Risk Score</span>
            <span className={`font-semibold ${getRiskColor(data.riskScore)}`}>
              {data.riskScore}/100
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                data.riskScore <= 30 ? 'bg-green-400' :
                data.riskScore <= 70 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ width: `${data.riskScore}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Stealth Analytics Component
export const StealthAnalytics: React.FC = () => {
  const [stealthData, setStealthData] = useState<StealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStealthData();
  }, [timeRange]);

  const loadStealthData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockData: StealthData = {
        detectionRates: Array.from({ length: 30 }, (_, i) => ({
          timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
          rate: Math.random() * 20,
          severity: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
        })),
        successRates: Array.from({ length: 50 }, (_, i) => ({
          timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
          rate: 85 + Math.random() * 15,
          agent: `Agent-${Math.floor(Math.random() * 5) + 1}`
        })),
        fingerprintUsage: [
          { type: 'Chrome Desktop', count: 15420, effectiveness: 94 },
          { type: 'Firefox Desktop', count: 8930, effectiveness: 91 },
          { type: 'Safari Mobile', count: 6750, effectiveness: 88 },
          { type: 'Edge Desktop', count: 4320, effectiveness: 86 },
          { type: 'Chrome Mobile', count: 3210, effectiveness: 92 }
        ],
        geoData: [
          { country: 'United States', requests: 45230, successRate: 94, detectionRate: 3 },
          { country: 'Germany', requests: 23450, successRate: 91, detectionRate: 5 },
          { country: 'United Kingdom', requests: 18920, successRate: 89, detectionRate: 7 },
          { country: 'France', requests: 15670, successRate: 87, detectionRate: 8 },
          { country: 'Japan', requests: 12340, successRate: 93, detectionRate: 4 }
        ],
        performanceMetrics: {
          avgResponseTime: 234,
          throughput: 15420,
          errorRate: 2.3,
          uptime: 99.8
        },
        threatIntelligence: {
          blockedIPs: 1247,
          suspiciousPatterns: 89,
          mitigatedThreats: 156,
          riskScore: 25
        }
      };
      
      setStealthData(mockData);
    } catch (error) {
      console.error('Failed to load stealth data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStealthData();
    setRefreshing(false);
  };

  const exportData = () => {
    if (!stealthData) return;
    
    const dataStr = JSON.stringify(stealthData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stealth-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stealthData) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-300 mb-2">Failed to load analytics data</h3>
        <button
          onClick={loadStealthData}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white font-medium transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Stealth Analytics</h2>
          <p className="text-gray-400 mt-1">Advanced stealth effectiveness and performance monitoring</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg px-3 py-2 text-blue-400 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          <button
            onClick={exportData}
            className="flex items-center space-x-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg px-3 py-2 text-green-400 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Performance Metrics */}
      <PerformanceMetrics data={stealthData.performanceMetrics} />

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DetectionRateChart data={stealthData.detectionRates} />
        <SuccessRateOverTime data={stealthData.successRates} />
        <FingerprintUsageChart data={stealthData.fingerprintUsage} />
        <GeographicDistribution data={stealthData.geoData} />
      </div>

      {/* Threat Intelligence */}
      <ThreatIntelligence data={stealthData.threatIntelligence} />
    </div>
  );
};