import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, X, Check, Plus, Trash2 } from 'lucide-react';

interface InvoiceSettingsProps {
  onSettingsChange?: () => void;
}

const InvoiceSettings: React.FC<InvoiceSettingsProps> = ({ onSettingsChange }) => {
  const [settings, setSettings] = useState({
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

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('numbering');

  const handleInputChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    if (onSettingsChange) onSettingsChange();
  };

  const handleSwitchChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    if (onSettingsChange) onSettingsChange();
  };

  const handleCustomFieldChange = (index: number, field: 'name' | 'enabled', value: string | boolean) => {
    const updatedFields = [...settings.customFields];
    updatedFields[index] = {
      ...updatedFields[index],
      [field]: value
    };
    
    setSettings(prev => ({
      ...prev,
      customFields: updatedFields
    }));
    
    if (onSettingsChange) onSettingsChange();
  };

  const addCustomField = () => {
    setSettings(prev => ({
      ...prev,
      customFields: [...prev.customFields, { name: '', enabled: true }]
    }));
    
    if (onSettingsChange) onSettingsChange();
  };

  const removeCustomField = (index: number) => {
    const updatedFields = [...settings.customFields];
    updatedFields.splice(index, 1);
    
    setSettings(prev => ({
      ...prev,
      customFields: updatedFields
    }));
    
    if (onSettingsChange) onSettingsChange();
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setLogoPreview(event.target.result);
        }
      };
      reader.readAsDataURL(file);
      
      if (onSettingsChange) onSettingsChange();
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (onSettingsChange) onSettingsChange();
  };

  const handleSave = () => {
    console.log('Saving invoice settings:', settings);
    // TODO: Implement actual save functionality
  };

  const dueTermsOptions = [
    { value: 'due_on_receipt', label: 'Due on Receipt' },
    { value: 'net7', label: 'Net 7 Days' },
    { value: 'net15', label: 'Net 15 Days' },
    { value: 'net30', label: 'Net 30 Days' },
    { value: 'net45', label: 'Net 45 Days' },
    { value: 'net60', label: 'Net 60 Days' },
    { value: 'custom', label: 'Custom' }
  ];

  const colorSchemeOptions = [
    { value: 'blue', label: 'Blue' },
    { value: 'green', label: 'Green' },
    { value: 'purple', label: 'Purple' },
    { value: 'red', label: 'Red' },
    { value: 'orange', label: 'Orange' },
    { value: 'gray', label: 'Gray' },
    { value: 'custom', label: 'Custom' }
  ];

  const logoPositionOptions = [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' }
  ];

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="numbering">Numbering</TabsTrigger>
          <TabsTrigger value="defaults">Defaults</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
        </TabsList>

        {/* Numbering Tab */}
        <TabsContent value="numbering" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Numbering</CardTitle>
              <CardDescription>
                Configure how invoices are numbered
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice-prefix">Invoice Prefix</Label>
                  <Input
                    id="invoice-prefix"
                    value={settings.invoicePrefix}
                    onChange={(e) => handleInputChange('invoicePrefix', e.target.value)}
                    placeholder="e.g., INV-"
                  />
                  <p className="text-xs text-muted-foreground">
                    Text that appears before the invoice number
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="next-invoice-number">Next Invoice Number</Label>
                  <Input
                    id="next-invoice-number"
                    value={settings.nextInvoiceNumber}
                    onChange={(e) => handleInputChange('nextInvoiceNumber', e.target.value)}
                    placeholder="e.g., 1001"
                  />
                  <p className="text-xs text-muted-foreground">
                    The number to use for the next invoice
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-numbering">Automatic Numbering</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically increment invoice numbers
                  </p>
                </div>
                <Switch
                  id="auto-numbering"
                  checked={settings.enableAutoNumbering}
                  onCheckedChange={(checked) => handleSwitchChange('enableAutoNumbering', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reset-yearly">Reset Numbering Yearly</Label>
                  <p className="text-sm text-muted-foreground">
                    Reset invoice numbers at the start of each year
                  </p>
                </div>
                <Switch
                  id="reset-yearly"
                  checked={settings.resetNumberingYearly}
                  onCheckedChange={(checked) => handleSwitchChange('resetNumberingYearly', checked)}
                />
              </div>

              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm">
                  <strong>Preview:</strong> {settings.invoicePrefix}{settings.nextInvoiceNumber}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Default Values Tab */}
        <TabsContent value="defaults" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Default Values</CardTitle>
              <CardDescription>
                Set default values for new invoices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="default-terms">Default Payment Terms</Label>
                <Select 
                  value={settings.defaultDueTerms} 
                  onValueChange={(value) => handleInputChange('defaultDueTerms', value)}
                >
                  <SelectTrigger id="default-terms">
                    <SelectValue placeholder="Select payment terms" />
                  </SelectTrigger>
                  <SelectContent>
                    {dueTermsOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-tax-rate">Default Tax Rate (%)</Label>
                <Input
                  id="default-tax-rate"
                  type="number"
                  value={settings.defaultTaxRate}
                  onChange={(e) => handleInputChange('defaultTaxRate', e.target.value)}
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-notes">Default Notes</Label>
                <Textarea
                  id="default-notes"
                  value={settings.defaultNotes}
                  onChange={(e) => handleInputChange('defaultNotes', e.target.value)}
                  placeholder="Notes to appear on invoices"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-terms-conditions">Default Terms & Conditions</Label>
                <Textarea
                  id="default-terms-conditions"
                  value={settings.defaultTerms}
                  onChange={(e) => handleInputChange('defaultTerms', e.target.value)}
                  placeholder="Terms and conditions to appear on invoices"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Custom Fields</Label>
                <div className="space-y-2">
                  {settings.customFields.map((field, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={field.name}
                        onChange={(e) => handleCustomFieldChange(index, 'name', e.target.value)}
                        placeholder="Field name"
                        className="flex-1"
                      />
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={field.enabled}
                          onCheckedChange={(checked) => handleCustomFieldChange(index, 'enabled', checked)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCustomField(index)}
                          disabled={settings.customFields.length <= 1}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addCustomField}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Custom Field
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Tab */}
        <TabsContent value="email" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>
                Configure invoice email settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-emails">Automatic Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically send emails when invoices are created
                  </p>
                </div>
                <Switch
                  id="auto-emails"
                  checked={settings.enableAutomaticEmails}
                  onCheckedChange={(checked) => handleSwitchChange('enableAutomaticEmails', checked)}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="email-subject">Default Email Subject</Label>
                <Input
                  id="email-subject"
                  value={settings.defaultEmailSubject}
                  onChange={(e) => handleInputChange('defaultEmailSubject', e.target.value)}
                  placeholder="Email subject line"
                />
                <p className="text-xs text-muted-foreground">
                  Use {'{invoice_number}'}, {'{company_name}'}, {'{client_name}'}, {'{invoice_amount}'}, {'{due_date}'} as placeholders
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-body">Default Email Body</Label>
                <Textarea
                  id="email-body"
                  value={settings.defaultEmailBody}
                  onChange={(e) => handleInputChange('defaultEmailBody', e.target.value)}
                  placeholder="Email message body"
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  Use {'{invoice_number}'}, {'{company_name}'}, {'{client_name}'}, {'{invoice_amount}'}, {'{due_date}'} as placeholders
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cc-emails">CC Emails</Label>
                  <Input
                    id="cc-emails"
                    value={settings.ccEmails}
                    onChange={(e) => handleInputChange('ccEmails', e.target.value)}
                    placeholder="email@example.com, another@example.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate multiple emails with commas
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bcc-emails">BCC Emails</Label>
                  <Input
                    id="bcc-emails"
                    value={settings.bccEmails}
                    onChange={(e) => handleInputChange('bccEmails', e.target.value)}
                    placeholder="email@example.com, another@example.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate multiple emails with commas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Options Tab */}
        <TabsContent value="payment" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Options</CardTitle>
              <CardDescription>
                Configure accepted payment methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <Label htmlFor="credit-cards">Credit Cards</Label>
                    <p className="text-sm text-muted-foreground">
                      Accept Visa, Mastercard, Amex, etc.
                    </p>
                  </div>
                  <Switch
                    id="credit-cards"
                    checked={settings.acceptCreditCards}
                    onCheckedChange={(checked) => handleSwitchChange('acceptCreditCards', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <Label htmlFor="bank-transfers">Bank Transfers</Label>
                    <p className="text-sm text-muted-foreground">
                      Accept ACH, wire transfers, etc.
                    </p>
                  </div>
                  <Switch
                    id="bank-transfers"
                    checked={settings.acceptBankTransfers}
                    onCheckedChange={(checked) => handleSwitchChange('acceptBankTransfers', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <Label htmlFor="paypal">PayPal</Label>
                    <p className="text-sm text-muted-foreground">
                      Accept payments via PayPal
                    </p>
                  </div>
                  <Switch
                    id="paypal"
                    checked={settings.acceptPayPal}
                    onCheckedChange={(checked) => handleSwitchChange('acceptPayPal', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <Label htmlFor="cash">Cash</Label>
                    <p className="text-sm text-muted-foreground">
                      Accept cash payments
                    </p>
                  </div>
                  <Switch
                    id="cash"
                    checked={settings.acceptCash}
                    onCheckedChange={(checked) => handleSwitchChange('acceptCash', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <Label htmlFor="checks">Checks</Label>
                    <p className="text-sm text-muted-foreground">
                      Accept check payments
                    </p>
                  </div>
                  <Switch
                    id="checks"
                    checked={settings.acceptChecks}
                    onCheckedChange={(checked) => handleSwitchChange('acceptChecks', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Appearance</CardTitle>
              <CardDescription>
                Customize how your invoices look
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invoice-logo">Invoice Logo</Label>
                {logoPreview ? (
                  <div className="relative inline-block">
                    <img 
                      src={logoPreview} 
                      alt="Invoice logo preview" 
                      className="max-h-16 border rounded p-2"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={removeLogo}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-md hover:bg-muted">
                        <Upload className="h-4 w-4" />
                        <span>Upload Logo</span>
                      </div>
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Recommended size: 300x100px, max 1MB
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logo-position">Logo Position</Label>
                  <Select 
                    value={settings.logoPosition} 
                    onValueChange={(value) => handleInputChange('logoPosition', value)}
                  >
                    <SelectTrigger id="logo-position">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {logoPositionOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color-scheme">Color Scheme</Label>
                  <Select 
                    value={settings.colorScheme} 
                    onValueChange={(value) => handleInputChange('colorScheme', value)}
                  >
                    <SelectTrigger id="color-scheme">
                      <SelectValue placeholder="Select color scheme" />
                    </SelectTrigger>
                    <SelectContent>
                      {colorSchemeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="paid-stamp">Show "PAID" Stamp</Label>
                  <p className="text-sm text-muted-foreground">
                    Display a "PAID" stamp on paid invoices
                  </p>
                </div>
                <Switch
                  id="paid-stamp"
                  checked={settings.showPaidStamp}
                  onCheckedChange={(checked) => handleSwitchChange('showPaidStamp', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="signature">Show Signature</Label>
                  <p className="text-sm text-muted-foreground">
                    Display a signature line on invoices
                  </p>
                </div>
                <Switch
                  id="signature"
                  checked={settings.showSignature}
                  onCheckedChange={(checked) => handleSwitchChange('showSignature', checked)}
                />
              </div>

              {settings.showSignature && (
                <div className="space-y-2">
                  <Label htmlFor="signature-text">Signature Text</Label>
                  <Input
                    id="signature-text"
                    value={settings.signatureText}
                    onChange={(e) => handleInputChange('signatureText', e.target.value)}
                    placeholder="Text to appear below signature line"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reminders Tab */}
        <TabsContent value="reminders" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Reminders</CardTitle>
              <CardDescription>
                Configure automatic payment reminder emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="payment-reminders">Enable Payment Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Send automatic reminders for overdue invoices
                  </p>
                </div>
                <Switch
                  id="payment-reminders"
                  checked={settings.enablePaymentReminders}
                  onCheckedChange={(checked) => handleSwitchChange('enablePaymentReminders', checked)}
                />
              </div>

              {settings.enablePaymentReminders && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-reminder">First Reminder (days)</Label>
                      <Input
                        id="first-reminder"
                        type="number"
                        value={settings.firstReminderDays}
                        onChange={(e) => handleInputChange('firstReminderDays', e.target.value)}
                        min="1"
                        max="30"
                      />
                      <p className="text-xs text-muted-foreground">
                        Days after due date
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="second-reminder">Second Reminder (days)</Label>
                      <Input
                        id="second-reminder"
                        type="number"
                        value={settings.secondReminderDays}
                        onChange={(e) => handleInputChange('secondReminderDays', e.target.value)}
                        min="1"
                        max="60"
                      />
                      <p className="text-xs text-muted-foreground">
                        Days after due date
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="final-reminder">Final Reminder (days)</Label>
                      <Input
                        id="final-reminder"
                        type="number"
                        value={settings.finalReminderDays}
                        onChange={(e) => handleInputChange('finalReminderDays', e.target.value)}
                        min="1"
                        max="90"
                      />
                      <p className="text-xs text-muted-foreground">
                        Days after due date
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reminder-subject">Reminder Email Subject</Label>
                    <Input
                      id="reminder-subject"
                      value={settings.reminderEmailSubject}
                      onChange={(e) => handleInputChange('reminderEmailSubject', e.target.value)}
                      placeholder="Email subject line for reminders"
                    />
                    <p className="text-xs text-muted-foreground">
                      Use {'{invoice_number}'}, {'{days_overdue}'}, {'{due_date}'} as placeholders
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reminder-body">Reminder Email Body</Label>
                    <Textarea
                      id="reminder-body"
                      value={settings.reminderEmailBody}
                      onChange={(e) => handleInputChange('reminderEmailBody', e.target.value)}
                      placeholder="Email message body for reminders"
                      rows={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      Use {'{invoice_number}'}, {'{client_name}'}, {'{invoice_amount}'}, {'{days_overdue}'}, {'{due_date}'}, {'{company_name}'} as placeholders
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline">
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Invoice Settings
        </Button>
      </div>
    </div>
  );
};

export default InvoiceSettings;