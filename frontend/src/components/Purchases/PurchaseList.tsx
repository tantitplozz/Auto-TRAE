/**
 * ✅ Trae AI Agent System - PurchaseList Component
 * Advanced purchase management with real-time updates
 */

import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  MoreVertical,
  ExternalLink,
  X,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { usePurchases } from '../../hooks/usePurchases';
import { useAgents } from '../../hooks/useAgents';
import { Purchase, CreatePurchaseRequest } from '../../services/api';

const PurchaseList: React.FC = () => {
  const {
    filteredPurchases,
    loading,
    error,
    selectedPurchase,
    selectPurchase,
    createPurchase,
    cancelPurchase,
    pagination,
    nextPage,
    prevPage,
    goToPage,
    setStatusFilter,
    setAgentFilter,
    setSearchQuery,
    statusFilter,
    agentFilter,
    searchQuery
  } = usePurchases();

  const { agents } = useAgents();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);
  const [newPurchase, setNewPurchase] = useState<CreatePurchaseRequest>({
    agentId: '',
    productUrl: '',
    config: {
      maxPrice: undefined,
      quantity: 1,
      priority: 'medium'
    }
  });

  const getStatusIcon = (status: Purchase['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'cancelled':
        return <X className="w-4 h-4 text-gray-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Purchase['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreatePurchase = async () => {
    if (!newPurchase.agentId || !newPurchase.productUrl) {
      return;
    }

    const success = await createPurchase(newPurchase);
    if (success) {
      setShowCreateModal(false);
      setNewPurchase({
        agentId: '',
        productUrl: '',
        config: {
          maxPrice: undefined,
          quantity: 1,
          priority: 'medium'
        }
      });
    }
  };

  const handleCancelPurchase = async (purchaseId: string) => {
    const success = await cancelPurchase(purchaseId);
    if (success) {
      setShowCancelConfirm(null);
    }
  };

  const PurchaseCard: React.FC<{ purchase: Purchase }> = ({ purchase }) => {
    const agent = agents.find(a => a.id === purchase.agentId);

    return (
      <div
        className={`bg-white rounded-lg shadow-md p-6 border-2 transition-all cursor-pointer hover:shadow-lg ${
          selectedPurchase?.id === purchase.id ? 'border-blue-500' : 'border-gray-200'
        }`}
        onClick={() => selectPurchase(purchase)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Purchase {purchase.id.slice(0, 8)}...
              </h3>
              <p className="text-sm text-gray-500">
                Agent: {agent?.name || 'Unknown'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(purchase.status)}`}>
              {purchase.status}
            </span>
            <div className="relative">
              <button className="p-1 hover:bg-gray-100 rounded">
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {/* Product URL */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 mb-1">Product URL</p>
                <p className="text-sm text-gray-600 truncate">{purchase.productUrl}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(purchase.productUrl, '_blank');
                }}
                className="ml-2 p-1 hover:bg-gray-200 rounded"
              >
                <ExternalLink className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Status and Progress */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon(purchase.status)}
              <span className="text-sm text-gray-600 capitalize">
                {purchase.status}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Created</p>
              <p className="text-xs text-gray-500">
                {new Date(purchase.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {purchase.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Error</p>
                  <p className="text-sm text-red-700">{purchase.error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Result */}
          {purchase.result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm font-medium text-green-800 mb-1">Result</p>
              <pre className="text-xs text-green-700 whitespace-pre-wrap">
                {JSON.stringify(purchase.result, null, 2)}
              </pre>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            {(purchase.status === 'pending' || purchase.status === 'processing') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCancelConfirm(purchase.id);
                }}
                className="flex-1 flex items-center justify-center space-x-1 py-2 px-3 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(purchase.productUrl, '_blank');
              }}
              className="flex items-center justify-center p-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchases</h1>
          <p className="text-gray-600">Monitor and manage automated purchases</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Purchase</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search purchases..."
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
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={agentFilter || ''}
            onChange={(e) => setAgentFilter(e.target.value || null)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Agents</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2 text-gray-600">Loading purchases...</span>
        </div>
      )}

      {/* Purchases Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {filteredPurchases.map((purchase) => (
            <PurchaseCard key={purchase.id} purchase={purchase} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} purchases
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={prevPage}
              disabled={pagination.page <= 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      pagination.page === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={nextPage}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredPurchases.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No purchases found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || statusFilter || agentFilter
              ? 'Try adjusting your search or filter criteria'
              : 'Start your first automated purchase'
            }
          </p>
          {!searchQuery && !statusFilter && !agentFilter && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Create Your First Purchase
            </button>
          )}
        </div>
      )}

      {/* Create Purchase Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">New Purchase</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agent
                </label>
                <select
                  value={newPurchase.agentId}
                  onChange={(e) => setNewPurchase(prev => ({ ...prev, agentId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select an agent</option>
                  {agents.filter(agent => agent.status === 'active').map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product URL
                </label>
                <input
                  type="url"
                  value={newPurchase.productUrl}
                  onChange={(e) => setNewPurchase(prev => ({ ...prev, productUrl: e.target.value }))}
                  placeholder="https://example.com/product"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Price ($)
                  </label>
                  <input
                    type="number"
                    value={newPurchase.config?.maxPrice || ''}
                    onChange={(e) => setNewPurchase(prev => ({
                      ...prev,
                      config: {
                        ...prev.config,
                        maxPrice: e.target.value ? parseFloat(e.target.value) : undefined
                      }
                    }))}
                    placeholder="Optional"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newPurchase.config?.quantity || 1}
                    onChange={(e) => setNewPurchase(prev => ({
                      ...prev,
                      config: {
                        ...prev.config,
                        quantity: parseInt(e.target.value) || 1
                      }
                    }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={newPurchase.config?.priority || 'medium'}
                  onChange={(e) => setNewPurchase(prev => ({
                    ...prev,
                    config: {
                      ...prev.config,
                      priority: e.target.value as 'low' | 'medium' | 'high'
                    }
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePurchase}
                disabled={!newPurchase.agentId || !newPurchase.productUrl}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Create Purchase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Cancel Purchase</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              Are you sure you want to cancel this purchase? The process will be stopped immediately.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelConfirm(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Keep Running
              </button>
              <button
                onClick={() => handleCancelPurchase(showCancelConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel Purchase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseList;
