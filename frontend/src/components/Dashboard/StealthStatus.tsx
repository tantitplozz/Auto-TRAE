/**
 * ✅ Military-Grade Stealth Dashboard
 * Advanced fingerprint monitoring and detection evasion
 */

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Eye,
  Target,
  Activity,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Radar,
  Lock
} from 'lucide-react';

interface FingerprintData {
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  webgl: string;
  canvas: string;
  fonts: string[];
  plugins: string[];
  lastUpdated: string;
  trustScore: number;
}

interface DetectionMetrics {
  score: number;
  risk: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
  recommendations: string[];
}

// Glass Card Component
const GlassCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({
  title,
  children,
  className = ''
}) => (
  <div className={`bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 shadow-xl ${className}`}>
    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
      <Shield className="w-5 h-5 mr-2 text-blue-400" />
      {title}
    </h3>
    {children}
  </div>
);

// Fingerprint Visualizer
const FingerprintVisualizer: React.FC<{ data: FingerprintData | null }> = ({ data }) => {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400">
        <div className="text-center">
          <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Generating fingerprint...</p>
        </div>
      </div>
    );
  }

  const getTrustColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-300">Trust Score</span>
        <span className={`text-lg font-bold ${getTrustColor(data.trustScore)}`}>
          {data.trustScore}%
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">User Agent</span>
          <span className="text-white truncate max-w-32" title={data.userAgent}>
            {data.userAgent.split(' ')[0]}...
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Resolution</span>
          <span className="text-white">{data.screenResolution}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Timezone</span>
          <span className="text-white">{data.timezone}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Platform</span>
          <span className="text-white">{data.platform}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Fonts</span>
          <span className="text-white">{data.fonts.length} loaded</span>
        </div>
      </div>

      <div className="mt-4 p-3 bg-black/20 rounded-lg">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Last Updated</span>
          <span className="text-green-400">{new Date(data.lastUpdated).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

// Detection Radar
const DetectionRadar: React.FC<{ score: number }> = ({ score }) => {
  const getRiskLevel = (score: number): { level: string; color: string; icon: React.ReactNode } => {
    if (score <= 25) return {
      level: 'STEALTH',
      color: 'text-green-400',
      icon: <CheckCircle className="w-5 h-5" />
    };
    if (score <= 50) return {
      level: 'CAUTION',
      color: 'text-yellow-400',
      icon: <AlertTriangle className="w-5 h-5" />
    };
    if (score <= 75) return {
      level: 'DETECTED',
      color: 'text-orange-400',
      icon: <Eye className="w-5 h-5" />
    };
    return {
      level: 'COMPROMISED',
      color: 'text-red-400',
      icon: <XCircle className="w-5 h-5" />
    };
  };

  const risk = getRiskLevel(score);
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={score <= 25 ? '#10B981' : score <= 50 ? '#F59E0B' : score <= 75 ? '#F97316' : '#EF4444'}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{score}%</div>
            <div className="text-xs text-gray-400">RISK</div>
          </div>
        </div>
      </div>

      <div className={`flex items-center space-x-2 ${risk.color}`}>
        {risk.icon}
        <span className="font-semibold text-sm">{risk.level}</span>
      </div>

      <div className="w-full bg-black/20 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-1000 ${
            score <= 25 ? 'bg-green-400' :
            score <= 50 ? 'bg-yellow-400' :
            score <= 75 ? 'bg-orange-400' : 'bg-red-400'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

// Stealth Controls
const StealthControls: React.FC = () => {
  const [autoRotate, setAutoRotate] = useState(true);
  const [stealthMode, setStealthMode] = useState('aggressive');
  const [isRotating, setIsRotating] = useState(false);

  const handleRotateFingerprint = async () => {
    setIsRotating(true);
    // Simulate fingerprint rotation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRotating(false);
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleRotateFingerprint}
          disabled={isRotating}
          className="flex items-center justify-center space-x-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg p-3 text-blue-400 transition-all disabled:opacity-50"
        >
          <Zap className={`w-4 h-4 ${isRotating ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium">
            {isRotating ? 'Rotating...' : 'Rotate Identity'}
          </span>
        </button>

        <button className="flex items-center justify-center space-x-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg p-3 text-green-400 transition-all">
          <Lock className="w-4 h-4" />
          <span className="text-sm font-medium">Lock Profile</span>
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Auto-Rotate</span>
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              autoRotate ? 'bg-blue-600' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                autoRotate ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-300">Stealth Mode</label>
          <select
            value={stealthMode}
            onChange={(e) => setStealthMode(e.target.value)}
            className="w-full bg-black/20 border border-white/20 rounded-lg p-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="passive">Passive</option>
            <option value="balanced">Balanced</option>
            <option value="aggressive">Aggressive</option>
            <option value="ghost">Ghost Mode</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Main Stealth Status Component
export const StealthStatus: React.FC = () => {
  const [fingerprint, setFingerprint] = useState<FingerprintData | null>(null);
  const [detectionScore, setDetectionScore] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Simulate WebSocket connection
    const ws = new WebSocket(process.env.REACT_APP_WS_URL || 'ws://localhost:3001');

    ws.onopen = () => {
      setIsConnected(true);
      console.log('🔗 Stealth monitoring connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'FINGERPRINT_UPDATE') {
          setFingerprint(data.payload);
        }

        if (data.type === 'DETECTION_SCORE') {
          setDetectionScore(data.score);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('🔌 Stealth monitoring disconnected');
    };

    // Simulate initial data
    setTimeout(() => {
      setFingerprint({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        screenResolution: '1920x1080',
        timezone: 'America/New_York',
        language: 'en-US',
        platform: 'Win32',
        webgl: 'ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0)',
        canvas: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAA...',
        fonts: ['Arial', 'Times New Roman', 'Courier New', 'Helvetica'],
        plugins: ['Chrome PDF Plugin', 'Chrome PDF Viewer'],
        lastUpdated: new Date().toISOString(),
        trustScore: 87
      });
      setDetectionScore(23);
    }, 1000);

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="relative">
      {/* Connection Status */}
      <div className="absolute top-4 right-4 z-10">
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
          isConnected
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
          }`} />
          <span>{isConnected ? 'SECURE' : 'OFFLINE'}</span>
        </div>
      </div>

      <GlassCard title="Military-Grade Stealth" className="bg-gradient-to-br from-gray-900/90 to-blue-900/90">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Digital Fingerprint
            </h4>
            <FingerprintVisualizer data={fingerprint} />
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
              <Radar className="w-4 h-4 mr-2" />
              Detection Radar
            </h4>
            <DetectionRadar score={detectionScore} />
          </div>
        </div>

        <StealthControls />
      </GlassCard>
    </div>
  );
};
