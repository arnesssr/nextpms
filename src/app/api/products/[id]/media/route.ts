import { NextRequest, NextResponse } from 'next/server';
import { ProductMediaService } from '@/services/products/mediaService';

// GET /api/products/[id]/media
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { searchParams } = new URL(request.url);
    const usageType = searchParams.get('usage_type') || undefined;

    // Use global ProductMediaService to get product media
    const result = await ProductMediaService.getProductMedia(resolvedParams.id, usageType);

    return NextResponse.json(result, {
      status: result.success ? 200 : 500
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/products/[id]/media
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const formData = await request.formData();
    
    const file = formData.get('file') as File;
    const mediaType = formData.get('media_type') as string || 'image';
    const usageType = formData.get('usage_type') as string || 'product_gallery';
    const altText = formData.get('alt_text') as string;
    const isPrimary = formData.get('is_primary') === 'true';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File is required' },
        { status: 400 }
      );
    }

    // Use global ProductMediaService to upload media
    const result = await ProductMediaService.uploadProductMedia(resolvedParams.id, {
      file,
      media_type: mediaType as any,
      usage_type: usageType as any,
      alt_text: altText,
      is_primary: isPrimary
    });

    return NextResponse.json(result, {
      status: result.success ? 201 : 500
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id]/media
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    
    // Use global ProductMediaService to delete all product media
    const result = await ProductMediaService.deleteProductMedia(resolvedParams.id);

    return NextResponse.json(result, {
      status: result.success ? 200 : 500
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
