'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileSpreadsheet,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { ImportResult, ImportError } from '@/services/products/importExportService';

interface ImportExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete?: () => void;
}

export function ImportExportDialog({ open, onOpenChange, onImportComplete }: ImportExportDialogProps) {
  const [exportOptions, setExportOptions] = useState({
    includeImages: false,
    format: 'csv' as 'csv' | 'excel'
  });
  
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({
        format: exportOptions.format,
        includeImages: exportOptions.includeImages.toString()
      });

      const response = await fetch(`/api/products/export?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Products exported successfully!');
    } catch (error) {
      toast.error('Export failed. Please try again.');
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  }, [exportOptions]);

  const handleDownloadTemplate = useCallback(async () => {
    try {
      const response = await fetch('/api/products/export', { method: 'POST' });
      
      if (!response.ok) {
        throw new Error('Template download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'product_import_template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Import template downloaded!');
    } catch (error) {
      toast.error('Failed to download template.');
      console.error('Template download error:', error);
    }
  }, []);

  const handleImport = useCallback(async () => {
    if (!importFile) {
      toast.error('Please select a file to import.');
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', importFile);

      const response = await fetch('/api/products/import', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      setImportResult(result);

      if (result.success) {
        toast.success(`Import completed! ${result.successCount} products imported successfully.`);
        onImportComplete?.();
      } else if (result.successCount > 0) {
        toast.warning(`Partial import: ${result.successCount} successful, ${result.errorCount} failed.`);
        onImportComplete?.();
      } else {
        toast.error('Import failed. Please check the errors and try again.');
      }
    } catch (error) {
      toast.error('Import failed. Please try again.');
      console.error('Import error:', error);
    } finally {
      setImporting(false);
    }
  }, [importFile, onImportComplete]);

  const handleFileSelect = useCallback((file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file.');
      return;
    }
    setImportFile(file);
    setImportResult(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileSpreadsheet className="mr-2 h-5 w-5" />
            Import & Export Products
          </DialogTitle>
          <DialogDescription>
            Import products from CSV files or export your current product catalog
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="export" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export" className="flex items-center">
              <Download className="mr-2 h-4 w-4" />
              Export Products
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center">
              <Upload className="mr-2 h-4 w-4" />
              Import Products
            </TabsTrigger>
          </TabsList>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-green-800">
                  <Download className="mr-2 h-5 w-5" />
                  Export Products
                </CardTitle>
                <CardDescription>
                  Download your product catalog as a CSV file
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-images"
                    checked={exportOptions.includeImages}
                    onCheckedChange={(checked) => 
                      setExportOptions(prev => ({ ...prev, includeImages: checked }))
                    }
                  />
                  <Label htmlFor="include-images">Include image URLs</Label>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    The exported file will include all products with their complete information.
                    You can use this file as a backup or to import products into another system.
                  </AlertDescription>
                </Alert>

                <Button 
                  onClick={handleExport} 
                  disabled={exporting}
                  className="w-full"
                  size="lg"
                >
                  {exporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Export Products to CSV
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-blue-800">
                  <Upload className="mr-2 h-5 w-5" />
                  Import Products
                </CardTitle>
                <CardDescription>
                  Upload a CSV file to add multiple products at once
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Download Template */}
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>Need a template? Download our CSV template to get started.</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleDownloadTemplate}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Download Template
                    </Button>
                  </AlertDescription>
                </Alert>

                {/* File Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragOver 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <input
                    type="file"
                    id="csv-upload"
                    accept=".csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                    className="hidden"
                  />
                  
                  {importFile ? (
                    <div className="space-y-2">
                      <FileText className="mx-auto h-8 w-8 text-green-600" />
                      <p className="font-medium text-green-800">{importFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(importFile.size / 1024).toFixed(1)} KB
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setImportFile(null)}
                      >
                        Remove File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="font-medium">Drop your CSV file here or click to browse</p>
                      <p className="text-sm text-gray-500">Only CSV files are supported</p>
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('csv-upload')?.click()}
                      >
                        Choose File
                      </Button>
                    </div>
                  )}
                </div>

                {/* Import Button */}
                <Button 
                  onClick={handleImport} 
                  disabled={!importFile || importing}
                  className="w-full"
                  size="lg"
                >
                  {importing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Import Products
                    </>
                  )}
                </Button>

                {/* Import Results */}
                {importResult && (
                  <Card className={`border-l-4 ${
                    importResult.success 
                      ? 'border-l-green-500' 
                      : importResult.successCount > 0 
                        ? 'border-l-yellow-500' 
                        : 'border-l-red-500'
                  }`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center">
                        {importResult.success ? (
                          <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                        ) : importResult.successCount > 0 ? (
                          <AlertTriangle className="mr-2 h-5 w-5 text-yellow-600" />
                        ) : (
                          <XCircle className="mr-2 h-5 w-5 text-red-600" />
                        )}
                        Import Results
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            {importResult.totalRows}
                          </div>
                          <div className="text-sm text-gray-500">Total Rows</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {importResult.successCount}
                          </div>
                          <div className="text-sm text-gray-500">Successful</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {importResult.errorCount}
                          </div>
                          <div className="text-sm text-gray-500">Failed</div>
                        </div>
                      </div>

                      {importResult.errorCount > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-red-800">Errors:</h4>
                          <div className="max-h-40 overflow-y-auto space-y-1">
                            {importResult.errors.slice(0, 10).map((error, index) => (
                              <div key={index} className="text-sm p-2 bg-red-50 rounded border-l-2 border-red-200">
                                <span className="font-medium">Row {error.row}:</span>{' '}
                                {error.field && <span className="text-red-600">({error.field})</span>}{' '}
                                {error.message}
                              </div>
                            ))}
                            {importResult.errors.length > 10 && (
                              <div className="text-sm text-gray-500 italic">
                                ... and {importResult.errors.length - 10} more errors
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
