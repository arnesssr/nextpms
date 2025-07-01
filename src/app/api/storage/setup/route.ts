import { NextRequest, NextResponse } from 'next/server';
import { setupStorageBucket, testStorageConnection } from '@/lib/setupStorage';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing storage connection...');
    
    // First test the connection
    const connectionTest = await testStorageConnection();
    
    if (!connectionTest.success) {
      return NextResponse.json({
        success: false,
        error: `Storage connection failed: ${connectionTest.error}`,
        step: 'connection_test'
      }, { status: 500 });
    }
    
    console.log('Storage connection successful. Available buckets:', connectionTest.buckets);
    
    // Then setup the bucket
    const setupResult = await setupStorageBucket();
    
    if (!setupResult.success) {
      return NextResponse.json({
        success: false,
        error: `Bucket setup failed: ${setupResult.error}`,
        step: 'bucket_setup',
        availableBuckets: connectionTest.buckets
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Storage bucket setup completed successfully',
      availableBuckets: connectionTest.buckets
    });
    
  } catch (error) {
    console.error('Setup API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      step: 'api_error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Force bucket creation
    const setupResult = await setupStorageBucket();
    
    return NextResponse.json(setupResult);
    
  } catch (error) {
    console.error('Setup API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
