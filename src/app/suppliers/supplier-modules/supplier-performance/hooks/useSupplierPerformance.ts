import { useState, useEffect } from 'react';
import {
  PerformanceDashboardData,
  PerformanceFilters,
  PerformanceHistory,
  PerformanceMetric,
  SupplierPerformanceSummary
} from '../types';
import {
  getPerformanceDashboard,
  getPerformanceMetrics,
  getSupplierPerformance,
  getSupplierPerformanceHistory,
  getAllSuppliersPerformance
} from '../services/supplierPerformanceService';

export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const data = await getPerformanceMetrics();
        setMetrics(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch performance metrics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return { metrics, loading, error };
};

export const useSupplierPerformance = (supplierId: string) => {
  const [performance, setPerformance] = useState<SupplierPerformanceSummary | null>(null);
  const [history, setHistory] = useState<PerformanceHistory | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [performanceData, historyData] = await Promise.all([
          getSupplierPerformance(supplierId),
          getSupplierPerformanceHistory(supplierId)
        ]);
        
        setPerformance(performanceData);
        setHistory(historyData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch supplier performance data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (supplierId) {
      fetchData();
    }
  }, [supplierId]);

  return { performance, history, loading, error };
};

export const useAllSuppliersPerformance = (initialFilters?: PerformanceFilters) => {
  const [performanceData, setPerformanceData] = useState<SupplierPerformanceSummary[]>([]);
  const [filters, setFilters] = useState<PerformanceFilters | undefined>(initialFilters);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getAllSuppliersPerformance(filters);
        setPerformanceData(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch suppliers performance data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  const updateFilters = (newFilters: PerformanceFilters) => {
    setFilters(newFilters);
  };

  return { performanceData, loading, error, filters, updateFilters };
};

export const usePerformanceDashboard = () => {
  const [dashboardData, setDashboardData] = useState<PerformanceDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getPerformanceDashboard();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch performance dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { dashboardData, loading, error };
};