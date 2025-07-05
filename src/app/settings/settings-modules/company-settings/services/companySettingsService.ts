import { CompanySettings } from '../types';

// Mock data for company settings
const mockCompanySettings: CompanySettings = {
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
};

/**
 * Service for managing company settings
 */
export const companySettingsService = {
  /**
   * Get company settings
   */
  getCompanySettings: async (): Promise<CompanySettings> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockCompanySettings);
      }, 500);
    });
  },

  /**
   * Update company settings
   */
  updateCompanySettings: async (settings: CompanySettings): Promise<CompanySettings> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real application, this would send the data to the server
        console.log('Saving company settings:', settings);
        resolve(settings);
      }, 1000);
    });
  },

  /**
   * Upload company logo
   */
  uploadLogo: async (file: File): Promise<string> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real application, this would upload the file to the server
        console.log('Uploading logo:', file.name);
        resolve('https://example.com/uploads/logo.png');
      }, 1500);
    });
  }
};