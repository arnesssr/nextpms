import { supabase } from './supabaseClient';

export async function setupStorageBucket() {
  const bucketName = 'media-files';
  
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return { success: false, error: listError.message };
    }
    
    const existingBucket = buckets?.find(bucket => bucket.name === bucketName);
    
    if (!existingBucket) {
      console.log('Creating bucket:', bucketName);
      
      // Create bucket
      const { data: newBucket, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: [
          'image/jpeg',
          'image/jpg', 
          'image/png',
          'image/webp',
          'image/gif',
          'video/mp4',
          'video/webm',
          'application/pdf'
        ],
        fileSizeLimit: 20 * 1024 * 1024 // 20MB
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        return { success: false, error: createError.message };
      }
      
      console.log('Bucket created successfully:', newBucket);
    } else {
      console.log('Bucket already exists:', existingBucket);
    }
    
    // Test bucket permissions
    const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const testPath = `test/${Date.now()}_test.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(testPath, testFile);
      
    if (uploadError) {
      console.error('Error testing upload:', uploadError);
      return { success: false, error: `Upload test failed: ${uploadError.message}` };
    }
    
    // Clean up test file
    await supabase.storage.from(bucketName).remove([testPath]);
    
    console.log('Storage bucket setup and test completed successfully');
    return { success: true };
    
  } catch (error) {
    console.error('Unexpected error in setupStorageBucket:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function testStorageConnection() {
  try {
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, buckets: data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
