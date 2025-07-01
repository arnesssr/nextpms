import { NextRequest, NextResponse } from 'next/server';
import { ProductImportExportService } from '@/services/products/importExportService';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided'
      }, { status: 400 });
    }

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({
        success: false,
        error: 'Only CSV files are supported'
      }, { status: 400 });
    }

    // Read file content
    const fileContent = await file.text();

    // Parse and validate CSV
    const { data, errors: parseErrors } = await ProductImportExportService.parseCSV(fileContent);

    if (parseErrors.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        errors: parseErrors,
        totalRows: 0,
        successCount: 0,
        errorCount: parseErrors.length
      }, { status: 400 });
    }

    // Import products
    const importResult = await ProductImportExportService.importProducts(data);

    return NextResponse.json(importResult, {
      status: importResult.success ? 200 : 207 // 207 Multi-Status for partial success
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Import failed',
      totalRows: 0,
      successCount: 0,
      errorCount: 1,
      errors: [{
        row: 0,
        message: error instanceof Error ? error.message : 'Unknown error'
      }]
    }, { status: 500 });
  }
}
