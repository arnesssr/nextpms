import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { ProductImportExportService } from '@/services/products/importExportService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const includeImages = searchParams.get('includeImages') === 'true';
    const categoryFilter = searchParams.get('category') || undefined;
    const statusFilter = searchParams.get('status') || undefined;

    // Fetch products with filters
    let query = supabaseAdmin
      .from('products')
      .select(`
        *,
        categories(id, name, slug),
        media!product_id(
          id,
          file_name,
          file_path,
          bucket_name,
          alt_text,
          is_primary,
          created_at
        )
      `);

    if (categoryFilter) {
      query = query.eq('category_id', categoryFilter);
    }

    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }

    query = query.order('created_at', { ascending: false });

    const { data: products, error } = await query;

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    // Process products to include image URLs
    const processedProducts = products?.map(product => {
      const primaryImage = product.media?.find((m: any) => m.is_primary);
      const allImages = product.media?.map((m: any) => 
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${m.bucket_name}/${m.file_path}`
      );

      return {
        ...product,
        featured_image_url: primaryImage 
          ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${primaryImage.bucket_name}/${primaryImage.file_path}`
          : null,
        gallery_images: allImages || []
      };
    }) || [];

    // Generate CSV
    const csvContent = await ProductImportExportService.exportToCSV(processedProducts, {
      format: format as 'csv' | 'excel',
      includeImages,
      categoryFilter,
      statusFilter
    });

    // Set appropriate headers for file download
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `products_export_${timestamp}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': csvContent.length.toString()
      }
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Export failed'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Generate and return import template
    const templateContent = ProductImportExportService.generateImportTemplate();
    const filename = 'product_import_template.csv';

    return new NextResponse(templateContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': templateContent.length.toString()
      }
    });

  } catch (error) {
    console.error('Template generation error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Template generation failed'
    }, { status: 500 });
  }
}
