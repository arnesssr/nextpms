import { ProductWithCategory } from '@/types/products';
import { supabase } from '@/lib/supabaseClient';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { randomUUID } from 'crypto';

export interface ImportResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: ImportError[];
  message: string;
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
  data?: any;
}

export interface ExportOptions {
  format: 'csv' | 'excel';
  includeImages: boolean;
  categoryFilter?: string;
  statusFilter?: string;
}

export class ProductImportExportService {
  
  /**
   * Export products to CSV format
   */
  static async exportToCSV(products: ProductWithCategory[], options: ExportOptions = { format: 'csv', includeImages: false }): Promise<string> {
    const headers = [
      'Name',
      'Description', 
      'SKU',
      'Category',
      'Base Price',
      'Selling Price',
      'Stock Quantity',
      'Min Stock Level',
      'Status',
      'Is Active',
      'Is Featured',
      'Is Digital',
      'Track Inventory',
      'Requires Shipping',
      'Discount Percentage',
      'Tax Rate',
      'Weight',
      'Dimensions',
      'Barcode',
      'Tags',
      ...(options.includeImages ? ['Primary Image URL', 'Gallery Images'] : []),
      'Created At',
      'Updated At'
    ];

    const csvRows = [headers.join(',')];

    for (const product of products) {
      const row = [
        this.escapeCsvField(product.name || ''),
        this.escapeCsvField(product.description || ''),
        this.escapeCsvField(product.sku || ''),
        this.escapeCsvField(product.category?.name || ''),
        product.base_price || 0,
        product.selling_price || 0,
        product.stock_quantity || 0,
        product.min_stock_level || 0,
        product.status || 'draft',
        product.is_active || false,
        product.is_featured || false,
        product.is_digital || false,
        product.track_inventory || true,
        product.requires_shipping || true,
        product.discount_percentage || 0,
        product.tax_rate || 0,
        product.weight || '',
        product.dimensions || '',
        product.barcode || '',
        this.escapeCsvField((product.tags || []).join(';')),
        ...(options.includeImages ? [
          product.featured_image_url || '',
          (product.gallery_images || []).join(';')
        ] : []),
        product.created_at || '',
        product.updated_at || ''
      ];

      csvRows.push(row.join(','));
    }

    return csvRows.join('\n');
  }

  /**
   * Generate a CSV template for importing products
   */
  static generateImportTemplate(): string {
    const headers = [
      'Name*',
      'Description*', 
      'SKU',
      'Category*',
      'Base Price*',
      'Selling Price*',
      'Stock Quantity*',
      'Min Stock Level',
      'Status',
      'Is Active',
      'Is Featured',
      'Is Digital',
      'Track Inventory',
      'Requires Shipping',
      'Discount Percentage',
      'Tax Rate',
      'Weight',
      'Dimensions',
      'Barcode',
      'Tags'
    ];

    const sampleRow = [
      'Sample Product Name',
      'This is a sample product description with features and benefits',
      'SAMP-001',
      'Electronics', // This should match existing category
      '50.00',
      '75.00',
      '100',
      '10',
      'draft',
      'true',
      'false',
      'false',
      'true',
      'true',
      '0',
      '0',
      '1.5',
      '10x5x3 cm',
      '1234567890123',
      'electronics;gadget;sample'
    ];

    return [headers.join(','), sampleRow.join(',')].join('\n');
  }

  /**
   * Parse CSV content and validate data
   */
  static async parseCSV(csvContent: string): Promise<{ data: any[], errors: ImportError[] }> {
    const lines = csvContent.trim().split('\n');
    const headers = this.parseCsvRow(lines[0]);
    const data: any[] = [];
    const errors: ImportError[] = [];

    // Get categories for validation
    const { data: categories } = await supabase.from('categories').select('id, name');
    const categoryMap = new Map(categories?.map(cat => [cat.name.toLowerCase(), cat.id]) || []);

    for (let i = 1; i < lines.length; i++) {
      const row = this.parseCsvRow(lines[i]);
      const rowData: any = {};
      
      // Map CSV columns to product fields
      headers.forEach((header, index) => {
        const cleanHeader = header.replace('*', '').toLowerCase().replace(/\s+/g, '_');
        rowData[cleanHeader] = row[index] || '';
      });

      // Validate required fields
      const rowErrors = this.validateProductRow(rowData, i + 1, categoryMap);
      
      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
      } else {
        // Transform data to match database schema
        const transformedData = this.transformImportData(rowData, categoryMap);
        data.push(transformedData);
      }
    }

    return { data, errors };
  }

  /**
   * Import products from parsed data
   */
  static async importProducts(data: any[]): Promise<ImportResult> {
    let successCount = 0;
    let errorCount = 0;
    const errors: ImportError[] = [];

    for (let i = 0; i < data.length; i++) {
      try {
        const productData = {
          ...data[i],
          id: randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error } = await supabaseAdmin
          .from('products')
          .insert(productData);

        if (error) {
          errorCount++;
          errors.push({
            row: i + 2, // +2 because of header and 0-based index
            message: `Database error: ${error.message}`,
            data: productData
          });
        } else {
          successCount++;
        }
      } catch (error) {
        errorCount++;
        errors.push({
          row: i + 2,
          message: error instanceof Error ? error.message : 'Unknown error',
          data: data[i]
        });
      }
    }

    return {
      success: errorCount === 0,
      totalRows: data.length,
      successCount,
      errorCount,
      errors,
      message: `Import completed: ${successCount} successful, ${errorCount} failed`
    };
  }

  /**
   * Helper methods
   */
  private static escapeCsvField(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }

  private static parseCsvRow(row: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      
      if (char === '"') {
        if (inQuotes && row[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  private static validateProductRow(rowData: any, rowNumber: number, categoryMap: Map<string, string>): ImportError[] {
    const errors: ImportError[] = [];

    // Required fields validation
    if (!rowData.name || rowData.name.trim() === '') {
      errors.push({ row: rowNumber, field: 'name', message: 'Product name is required' });
    }

    if (!rowData.description || rowData.description.trim() === '') {
      errors.push({ row: rowNumber, field: 'description', message: 'Description is required' });
    }

    if (!rowData.category || rowData.category.trim() === '') {
      errors.push({ row: rowNumber, field: 'category', message: 'Category is required' });
    } else if (!categoryMap.has(rowData.category.toLowerCase())) {
      errors.push({ row: rowNumber, field: 'category', message: `Category "${rowData.category}" not found` });
    }

    // Price validation
    const basePrice = parseFloat(rowData.base_price);
    if (isNaN(basePrice) || basePrice <= 0) {
      errors.push({ row: rowNumber, field: 'base_price', message: 'Base price must be a positive number' });
    }

    const sellingPrice = parseFloat(rowData.selling_price);
    if (isNaN(sellingPrice) || sellingPrice <= 0) {
      errors.push({ row: rowNumber, field: 'selling_price', message: 'Selling price must be a positive number' });
    }

    // Stock validation
    const stockQuantity = parseInt(rowData.stock_quantity);
    if (isNaN(stockQuantity) || stockQuantity < 0) {
      errors.push({ row: rowNumber, field: 'stock_quantity', message: 'Stock quantity must be a non-negative number' });
    }

    return errors;
  }

  private static transformImportData(rowData: any, categoryMap: Map<string, string>): any {
    return {
      name: rowData.name.trim(),
      description: rowData.description.trim(),
      sku: rowData.sku || this.generateSKU(rowData.name),
      category_id: categoryMap.get(rowData.category.toLowerCase()),
      base_price: parseFloat(rowData.base_price),
      selling_price: parseFloat(rowData.selling_price),
      stock_quantity: parseInt(rowData.stock_quantity) || 0,
      min_stock_level: parseInt(rowData.min_stock_level) || 0,
      status: rowData.status || 'draft',
      is_active: this.parseBoolean(rowData.is_active, true),
      is_featured: this.parseBoolean(rowData.is_featured, false),
      is_digital: this.parseBoolean(rowData.is_digital, false),
      track_inventory: this.parseBoolean(rowData.track_inventory, true),
      requires_shipping: this.parseBoolean(rowData.requires_shipping, true),
      discount_percentage: parseFloat(rowData.discount_percentage) || 0,
      tax_rate: parseFloat(rowData.tax_rate) || 0,
      weight: rowData.weight || null,
      dimensions: rowData.dimensions || null,
      barcode: rowData.barcode || null,
      tags: rowData.tags ? rowData.tags.split(';').map((tag: string) => tag.trim()) : []
    };
  }

  private static generateSKU(name: string): string {
    return name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 6) + '-' + Math.random().toString(36).substring(2, 5).toUpperCase();
  }

  private static parseBoolean(value: string, defaultValue: boolean): boolean {
    if (!value) return defaultValue;
    return value.toLowerCase() === 'true' || value === '1';
  }
}
