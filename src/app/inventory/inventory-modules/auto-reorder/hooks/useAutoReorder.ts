import { useState, useEffect } from 'react';
import { 
  AutoReorderRule, 
  AutoReorderRecommendation, 
  AutoReorderSettings, 
  AutoReorderFilter, 
  AutoReorderSummary 
} from '../types/auto-reorder.types';
import { AutoReorderService } from '../services/autoReorderService';

export function useAutoReorderRules() {
  const [rules, setRules] = useState<AutoReorderRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRules = async (filters?: AutoReorderFilter) => {
    setLoading(true);
    setError(null);
    try {
      const data = await AutoReorderService.getAutoReorderRules(filters);
      setRules(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch auto reorder rules');
    } finally {
      setLoading(false);
    }
  };

  return {
    rules,
    loading,
    error,
    fetchRules
  };
}

export function useAutoReorderRecommendations() {
  const [recommendations, setRecommendations] = useState<AutoReorderRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async (filters?: AutoReorderFilter) => {
    setLoading(true);
    setError(null);
    try {
      const data = await AutoReorderService.getRecommendations(filters);
      setRecommendations(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reorder recommendations');
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await AutoReorderService.generateRecommendations();
      setRecommendations(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to generate recommendations');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    recommendations,
    loading,
    error,
    fetchRecommendations,
    generateRecommendations
  };
}

export function useAutoReorderSettings() {
  const [settings, setSettings] = useState<AutoReorderSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await AutoReorderService.getSettings();
      setSettings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch auto reorder settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<AutoReorderSettings>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await AutoReorderService.updateSettings(newSettings);
      setSettings(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to update auto reorder settings');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleGlobalAutoReorder = async (enabled: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const data = await AutoReorderService.toggleGlobalAutoReorder(enabled);
      setSettings(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to toggle auto reorder');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
    toggleGlobalAutoReorder
  };
}

export function useAutoReorderSummary() {
  const [summary, setSummary] = useState<AutoReorderSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await AutoReorderService.getSummary();
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch auto reorder summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return {
    summary,
    loading,
    error,
    fetchSummary
  };
}

export function useAutoReorderActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeRecommendations = async (recommendationIds: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const result = await AutoReorderService.executeRecommendations(recommendationIds);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to execute recommendations');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const runAutoReorderCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await AutoReorderService.runAutoReorderCheck();
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to run auto reorder check');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createRule = async (ruleData: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await AutoReorderService.createAutoReorderRule(ruleData);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to create auto reorder rule');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRule = async (ruleData: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await AutoReorderService.updateAutoReorderRule(ruleData);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to update auto reorder rule');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRule = async (ruleId: string) => {
    setLoading(true);
    setError(null);
    try {
      await AutoReorderService.deleteAutoReorderRule(ruleId);
    } catch (err: any) {
      setError(err.message || 'Failed to delete auto reorder rule');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    executeRecommendations,
    runAutoReorderCheck,
    createRule,
    updateRule,
    deleteRule
  };
}
