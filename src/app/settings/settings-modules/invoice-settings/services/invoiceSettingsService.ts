import { InvoiceSettings } from '../types';

// Mock data for invoice settings
const mockInvoiceSettings: InvoiceSettings = {
  // Numbering
  invoicePrefix: 'INV-',
  nextInvoiceNumber: '1001',
  enableAutoNumbering: true,
  resetNumberingYearly: false,
  
  // Default Values
  defaultDueTerms: 'net30',
  defaultNotes: 'Thank you for your business!',
  defaultTerms: 'Payment is due within the specified terms.',
  defaultTaxRate: '8.5',
  
  // Email Settings
  enableAutomaticEmails: true,
  defaultEmailSubject: 'Invoice {invoice_number} from {company_name}',
  defaultEmailBody: 'Dear {client_name},\n\nPlease find attached invoice {invoice_number} for {invoice_amount}.\n\nPayment is due by {due_date}.\n\nThank you for your business!\n\n{company_name}',
  ccEmails: '',
  bccEmails: '',
  
  // Payment Options
  acceptCreditCards: true,
  acceptBankTransfers: true,
  acceptPayPal: true,
  acceptCash: true,
  acceptChecks: true,
  
  // Appearance
  logoPosition: 'left',
  colorScheme: 'blue',
  showPaidStamp: true,
  showSignature: true,
  signatureText: 'Authorized Signature',
  
  // Reminders
  enablePaymentReminders: true,
  firstReminderDays: '3',
  secondReminderDays: '7',
  finalReminderDays: '14',
  reminderEmailSubject: 'Payment Reminder: Invoice {invoice_number}',
  reminderEmailBody: 'Dear {client_name},\n\nThis is a friendly reminder that invoice {invoice_number} for {invoice_amount} is now {days_overdue} days overdue.\n\nPlease make payment at your earliest convenience.\n\nThank you,\n{company_name}',
  
  // Custom Fields
  customFields: [
    { name: 'Purchase Order', enabled: true },
    { name: 'Project', enabled: true },
    { name: 'Department', enabled: false }
  ]
};

/**
 * Service for managing invoice settings
 */
export const invoiceSettingsService = {
  /**
   * Get invoice settings
   */
  getInvoiceSettings: async (): Promise<InvoiceSettings> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockInvoiceSettings);
      }, 500);
    });
  },

  /**
   * Update invoice settings
   */
  updateInvoiceSettings: async (settings: InvoiceSettings): Promise<InvoiceSettings> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real application, this would send the data to the server
        console.log('Saving invoice settings:', settings);
        resolve(settings);
      }, 1000);
    });
  },

  /**
   * Upload invoice logo
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