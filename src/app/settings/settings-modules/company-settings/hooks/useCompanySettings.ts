import { useState, useEffect } from 'react';
import { CompanySettings } from '../types';
import { companySettingsService } from '../services/companySettingsService';

export const useCompanySettings = () => {
  const [settings, setSettings] = useState<CompanySettings>({
    // Company Information
    companyName: 'Acme Corporation',
    legalName: 'Acme Inc.',
    taxId: 'US123456789',
    registrationNumber: 'REG-987654321',
    industry: 'technology',
    companySize: 'medium',
    yearFounded: '2010',
    
    // Contact Information
    email: 'info@acmecorp.com',
    phone: '+1 (555) 123-4567',
    website: 'https://www.acmecorp.com',
    
    // Address
    addressLine1: '123 Main Street',
    addressLine2: 'Suite 100',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94105',
    country: 'United States',
    
    // Branding
    primaryColor: '#3b82f6',
    secondaryColor: '#10b981',
    enableCustomLogo: true,
    enableDarkMode: true,
    
    // Business Hours
    businessHoursStart: '09:00',
    businessHoursEnd: '17:00',
    businessDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    timeZone: 'America/Los_Angeles',
    
    // Fiscal Settings
    fiscalYearStart: 'january',
    currency: 'USD',
    taxRate: '8.5',
    enableAutomaticTaxCalculation: true,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await companySettingsService.getCompanySettings();
        setSettings(data);
        setError(null);
      } catch (err) {
        setError('Failed to load company settings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const updateSettings = (updatedValues: Partial<CompanySettings>) => {
    setSettings(prev => ({
      ...prev,
      ...updatedValues
    }));
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      await companySettingsService.updateCompanySettings(settings);
      setError(null);
      return true;
    } catch (err) {
      setError('Failed to save company settings');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    settings,
    updateSettings,
    saveSettings,
    loading,
    error
  };
};