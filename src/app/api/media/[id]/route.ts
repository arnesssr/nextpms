import { NextRequest, NextResponse } from 'next/server';

// We'll need to implement a general MediaService for individual media operations
// For now, we'll use the Supabase client directly but structure it properly
import { supabase } from '@/lib/supabaseClient';

// GET /api/media/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;

    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('id', resolvedParams.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Media not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/media/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();

    // Prepare update data
    const updateData: any = {};
    
    if (body.alt_text !== undefined) updateData.alt_text = body.alt_text;
    if (body.caption !== undefined) updateData.caption = body.caption;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.is_primary !== undefined) updateData.is_primary = body.is_primary;
    if (body.display_order !== undefined) updateData.display_order = body.display_order;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.is_featured !== undefined) updateData.is_featured = body.is_featured;
    if (body.visibility !== undefined) updateData.visibility = body.visibility;
    if (body.tags !== undefined) updateData.tags = body.tags;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('media')
      .update(updateData)
      .eq('id', resolvedParams.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Media not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Media updated successfully'
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/media/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;

    // First, get the media record to retrieve file path for storage deletion
    const { data: mediaRecord, error: fetchError } = await supabase
      .from('media')
      .select('file_path, bucket_name')
      .eq('id', resolvedParams.id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Media not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: fetchError.message },
        { status: 500 }
      );
    }

    // Delete from storage first
    if (mediaRecord?.file_path) {
      const { error: storageError } = await supabase.storage
        .from(mediaRecord.bucket_name || 'media-files')
        .remove([mediaRecord.file_path]);

      if (storageError) {
        console.warn('Warning: Failed to delete file from storage:', storageError);
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete database record
    const { error } = await supabase
      .from('media')
      .delete()
      .eq('id', resolvedParams.id);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Media deleted successfully'
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
