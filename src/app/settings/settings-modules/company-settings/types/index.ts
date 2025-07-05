export interface CompanySettings {
  // Company Information
  companyName: string;
  legalName: string;
  taxId: string;
  registrationNumber: string;
  industry: string;
  companySize: string;
  yearFounded: string;
  
  // Contact Information
  email: string;
  phone: string;
  website: string;
  
  // Address
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  
  // Branding
  primaryColor: string;
  secondaryColor: string;
  enableCustomLogo: boolean;
  enableDarkMode: boolean;
  logoFile?: File | null;
  logoUrl?: string;
  
  // Business Hours
  businessHoursStart: string;
  businessHoursEnd: string;
  businessDays: string[];
  timeZone: string;
  
  // Fiscal Settings
  fiscalYearStart: string;
  currency: string;
  taxRate: string;
  enableAutomaticTaxCalculation: boolean;
}