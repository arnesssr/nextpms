export interface CustomField {
  name: string;
  enabled: boolean;
}

export interface InvoiceSettings {
  // Numbering
  invoicePrefix: string;
  nextInvoiceNumber: string;
  enableAutoNumbering: boolean;
  resetNumberingYearly: boolean;
  
  // Default Values
  defaultDueTerms: string;
  defaultNotes: string;
  defaultTerms: string;
  defaultTaxRate: string;
  
  // Email Settings
  enableAutomaticEmails: boolean;
  defaultEmailSubject: string;
  defaultEmailBody: string;
  ccEmails: string;
  bccEmails: string;
  
  // Payment Options
  acceptCreditCards: boolean;
  acceptBankTransfers: boolean;
  acceptPayPal: boolean;
  acceptCash: boolean;
  acceptChecks: boolean;
  
  // Appearance
  logoPosition: string;
  colorScheme: string;
  showPaidStamp: boolean;
  showSignature: boolean;
  signatureText: string;
  logoFile?: File | null;
  logoUrl?: string;
  
  // Reminders
  enablePaymentReminders: boolean;
  firstReminderDays: string;
  secondReminderDays: string;
  finalReminderDays: string;
  reminderEmailSubject: string;
  reminderEmailBody: string;
  
  // Custom Fields
  customFields: CustomField[];
}