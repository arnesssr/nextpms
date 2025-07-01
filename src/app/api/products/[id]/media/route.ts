import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { randomUUID } from 'crypto';

// GET /api/products/[id]/media
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { searchParams } = new URL(request.url);
    const usageType = searchParams.get('usage_type') || undefined;

    // Get product media directly from database
    let query = supabaseAdmin
      .from('media')
      .select('*')
      .eq('product_id', resolvedParams.id)
      .eq('is_active', true);
    
    if (usageType) {
      query = query.eq('usage_type', usageType);
    }
    
    query = query.order('display_order', { ascending: true })
                 .order('created_at', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    // Add URLs to media items
    const mediaWithUrls = data?.map(media => ({
      ...media,
      url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${media.bucket_name}/${media.file_path}`,
      thumbnail_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${media.bucket_name}/${media.file_path}?width=150&height=150`,
      filename: media.file_name
    })) || [];

    return NextResponse.json({
      success: true,
      data: mediaWithUrls
    }, { status: 200 });
    
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

    // Generate unique file path
    const fileExtension = file.name.split('.').pop() || '';
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const fileName = `${timestamp}_${randomId}.${fileExtension}`;
    const filePath = `products/${resolvedParams.id}/${usageType}/${fileName}`;
    const bucketName = 'media-files';

    // Upload file to Supabase storage using admin client
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      return NextResponse.json({
        success: false,
        error: `Upload failed: ${uploadError.message}`
      }, { status: 500 });
    }

    // Create media record in database using admin client (bypasses RLS)
    const mediaRecord = {
      id: randomUUID(),
      file_name: file.name,
      file_path: uploadData.path,
      bucket_name: bucketName,
      file_size: file.size,
      mime_type: file.type,
      file_extension: fileExtension,
      product_id: resolvedParams.id,
      media_type: mediaType,
      usage_type: usageType,
      is_primary: isPrimary,
      display_order: 0,
      alt_text: altText || '',
      caption: '',
      description: '',
      tags: [],
      visibility: 'public',
      is_active: true,
      is_featured: false,
      created_by: 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: media, error: dbError } = await supabaseAdmin
      .from('media')
      .insert(mediaRecord)
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file if database insert fails
      await supabaseAdmin.storage.from(bucketName).remove([uploadData.path]);
      return NextResponse.json({
        success: false,
        error: `Database error: ${dbError.message}`
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      media: media
    }, { status: 201 });
    
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
    
    // Get all media files for the product
    const { data: mediaFiles, error: fetchError } = await supabaseAdmin
      .from('media')
      .select('*')
      .eq('product_id', resolvedParams.id);
    
    if (fetchError) {
      return NextResponse.json({
        success: false,
        error: fetchError.message
      }, { status: 500 });
    }
    
    // Delete files from storage
    if (mediaFiles && mediaFiles.length > 0) {
      const deletePromises = mediaFiles.map(async (media) => {
        if (media.file_path) {
          const { error } = await supabaseAdmin.storage
            .from(media.bucket_name || 'media-files')
            .remove([media.file_path]);
          
          if (error) {
            console.warn(`Failed to delete file ${media.file_path} from storage:`, error);
          }
        }
      });
      
      await Promise.all(deletePromises);
    }
    
    // Delete database records
    const { error: deleteError } = await supabaseAdmin
      .from('media')
      .delete()
      .eq('product_id', resolvedParams.id);
    
    if (deleteError) {
      return NextResponse.json({
        success: false,
        error: deleteError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: true
    }, { status: 200 });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
