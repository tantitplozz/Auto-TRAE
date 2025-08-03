/**
 * ✅ Trae AI Agent System - usePurchases Hook
 * React hook for purchase management with real-time updates
 */

import { useState, useEffect, useCallback } from 'react';
import { apiService, Purchase, CreatePurchaseRequest, PaginatedResponse } from '../services/api';
import { wsService } from '../services/websocket';

export interface UsePurchasesReturn {
  purchases: Purchase[];
  loading: boolean;
  error: string | null;
  selectedPurchase: Purchase | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // Actions
  fetchPurchases: (page?: number, limit?: number) => Promise<void>;
  createPurchase: (purchaseData: CreatePurchaseRequest) => Promise<boolean>;
  cancelPurchase: (id: string) => Promise<boolean>;
  selectPurchase: (purchase: Purchase | null) => void;
  refreshPurchase: (id: string) => Promise<void>;
  
  // Pagination
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  
  // Filters
  filteredPurchases: Purchase[];
  setStatusFilter: (status: string | null) => void;
  setAgentFilter: (agentId: string | null) => void;
  setSearchQuery: (query: string) => void;
  statusFilter: string | null;
  agentFilter: string | null;
  searchQuery: string;
}

export const usePurchases = (): UsePurchasesReturn => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [agentFilter, setAgentFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ✅ Fetch purchases from API
  const fetchPurchases = useCallback(async (page = 1, limit = 20) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getPurchases(page, limit);
      
      if (response.success && response.data) {
        setPurchases(response.data);
        setPagination(response.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        });
      } else {
        setError(response.error || 'Failed to fetch purchases');
      }
    } catch (err) {
      setError('Network error while fetching purchases');
      console.error('Error fetching purchases:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Create new purchase
  const createPurchase = useCallback(async (purchaseData: CreatePurchaseRequest): Promise<boolean> => {
    try {
      setError(null);
      
      const response = await apiService.createPurchase(purchaseData);
      
      if (response.success && response.data) {
        // Add to beginning of list
        setPurchases(prev => [response.data!, ...prev]);
        return true;
      } else {
        setError(response.error || 'Failed to create purchase');
        return false;
      }
    } catch (err) {
      setError('Network error while creating purchase');
      console.error('Error creating purchase:', err);
      return false;
    }
  }, []);

  // ✅ Cancel purchase
  const cancelPurchase = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      
      const response = await apiService.cancelPurchase(id);
      
      if (response.success && response.data) {
        setPurchases(prev => prev.map(purchase => 
          purchase.id === id ? response.data! : purchase
        ));
        
        if (selectedPurchase?.id === id) {
          setSelectedPurchase(response.data);
        }
        
        return true;
      } else {
        setError(response.error || 'Failed to cancel purchase');
        return false;
      }
    } catch (err) {
      setError('Network error while cancelling purchase');
      console.error('Error cancelling purchase:', err);
      return false;
    }
  }, [selectedPurchase]);

  // ✅ Select purchase
  const selectPurchase = useCallback((purchase: Purchase | null) => {
    setSelectedPurchase(purchase);
  }, []);

  // ✅ Refresh specific purchase
  const refreshPurchase = useCallback(async (id: string) => {
    try {
      const response = await apiService.getPurchase(id);
      
      if (response.success && response.data) {
        setPurchases(prev => prev.map(purchase => 
          purchase.id === id ? response.data! : purchase
        ));
        
        if (selectedPurchase?.id === id) {
          setSelectedPurchase(response.data);
        }
      }
    } catch (err) {
      console.error('Error refreshing purchase:', err);
    }
  }, [selectedPurchase]);

  // ✅ Pagination controls
  const nextPage = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      const newPage = pagination.page + 1;
      setPagination(prev => ({ ...prev, page: newPage }));
      fetchPurchases(newPage, pagination.limit);
    }
  }, [pagination, fetchPurchases]);

  const prevPage = useCallback(() => {
    if (pagination.page > 1) {
      const newPage = pagination.page - 1;
      setPagination(prev => ({ ...prev, page: newPage }));
      fetchPurchases(newPage, pagination.limit);
    }
  }, [pagination, fetchPurchases]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page }));
      fetchPurchases(page, pagination.limit);
    }
  }, [pagination.totalPages, pagination.limit, fetchPurchases]);

  // ✅ Filtered purchases
  const filteredPurchases = purchases.filter(purchase => {
    const matchesStatus = !statusFilter || purchase.status === statusFilter;
    const matchesAgent = !agentFilter || purchase.agentId === agentFilter;
    const matchesSearch = !searchQuery || 
      purchase.productUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesAgent && matchesSearch;
  });

  // ✅ WebSocket event handlers
  useEffect(() => {
    const handlePurchaseStatusChanged = (data: { 
      purchaseId: string; 
      status: string; 
      progress?: number; 
      timestamp: string 
    }) => {
      setPurchases(prev => prev.map(purchase => 
        purchase.id === data.purchaseId 
          ? { 
              ...purchase, 
              status: data.status as Purchase['status'], 
              updatedAt: data.timestamp 
            }
          : purchase
      ));
      
      if (selectedPurchase?.id === data.purchaseId) {
        setSelectedPurchase(prev => prev ? { 
          ...prev, 
          status: data.status as Purchase['status'], 
          updatedAt: data.timestamp 
        } : null);
      }
    };

    const handlePurchaseCompleted = (data: { 
      purchaseId: string; 
      result: any; 
      timestamp: string 
    }) => {
      setPurchases(prev => prev.map(purchase => 
        purchase.id === data.purchaseId 
          ? { 
              ...purchase, 
              status: 'completed', 
              result: data.result,
              updatedAt: data.timestamp 
            }
          : purchase
      ));
      
      if (selectedPurchase?.id === data.purchaseId) {
        setSelectedPurchase(prev => prev ? { 
          ...prev, 
          status: 'completed', 
          result: data.result,
          updatedAt: data.timestamp 
        } : null);
      }
    };

    const handlePurchaseFailed = (data: { 
      purchaseId: string; 
      error: string; 
      timestamp: string 
    }) => {
      setPurchases(prev => prev.map(purchase => 
        purchase.id === data.purchaseId 
          ? { 
              ...purchase, 
              status: 'failed', 
              error: data.error,
              updatedAt: data.timestamp 
            }
          : purchase
      ));
      
      if (selectedPurchase?.id === data.purchaseId) {
        setSelectedPurchase(prev => prev ? { 
          ...prev, 
          status: 'failed', 
          error: data.error,
          updatedAt: data.timestamp 
        } : null);
      }
    };

    // Subscribe to WebSocket events
    wsService.on('purchase:status_changed', handlePurchaseStatusChanged);
    wsService.on('purchase:completed', handlePurchaseCompleted);
    wsService.on('purchase:failed', handlePurchaseFailed);

    // Cleanup
    return () => {
      wsService.off('purchase:status_changed', handlePurchaseStatusChanged);
      wsService.off('purchase:completed', handlePurchaseCompleted);
      wsService.off('purchase:failed', handlePurchaseFailed);
    };
  }, [selectedPurchase]);

  // ✅ Initial data fetch
  useEffect(() => {
    fetchPurchases(1, 20);
  }, [fetchPurchases]);

  // ✅ Auto-refresh purchases periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && wsService.isConnected()) {
        // Only refresh if WebSocket is not connected
        return;
      }
      fetchPurchases(pagination.page, pagination.limit);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [loading, pagination.page, pagination.limit, fetchPurchases]);

  return {
    purchases,
    loading,
    error,
    selectedPurchase,
    pagination,
    fetchPurchases,
    createPurchase,
    cancelPurchase,
    selectPurchase,
    refreshPurchase,
    nextPage,
    prevPage,
    goToPage,
    filteredPurchases,
    setStatusFilter,
    setAgentFilter,
    setSearchQuery,
    statusFilter,
    agentFilter,
    searchQuery
  };
};