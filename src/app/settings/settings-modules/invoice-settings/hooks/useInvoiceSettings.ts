import { useState, useEffect } from 'react';
import { InvoiceSettings } from '../types';
import { invoiceSettingsService } from '../services/invoiceSettingsService';

export const useInvoiceSettings = () => {
  const [settings, setSettings] = useState<InvoiceSettings>({
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
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await invoiceSettingsService.getInvoiceSettings();
        setSettings(data);
        setError(null);
      } catch (err) {
        setError('Failed to load invoice settings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const updateSettings = (updatedValues: Partial<InvoiceSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...updatedValues
    }));
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      await invoiceSettingsService.updateInvoiceSettings(settings);
      setError(null);
      return true;
    } catch (err) {
      setError('Failed to save invoice settings');
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