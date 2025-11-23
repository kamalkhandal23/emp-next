// uploadService.js - Supabase Storage Integration
import supabase from './supabaseService.js';
import path from 'path';
import fs from 'fs';

const BUCKET_NAME = 'assignments';

/**
 * Initialize Supabase Storage bucket for assignments
 */
export const initializeBucket = async () => {
  if (!supabase) {
    console.warn('Supabase not initialized. Skipping bucket creation.');
    return false;
  }

  try {
    // Check if bucket exists
    const { data: buckets, error: listError } =
      await supabase.storage.listBuckets();

    if (listError) throw listError;

    const bucketExists = buckets.some((bucket) => bucket.name === BUCKET_NAME);

    if (!bucketExists) {
      // Create bucket if it doesn't exist
      const { data, error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: false, // Private bucket - requires authentication
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: [
          'image/jpeg',
          'image/png',
          'image/gif',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'application/zip',
          'application/x-rar-compressed',
          'text/javascript',
          'text/x-python',
          'text/x-java',
          'text/x-c',
          'text/x-c++',
          'text/html',
          'text/css',
          'application/json',
          'text/xml',
        ],
      });

      if (error) throw error;
      console.log('Supabase bucket created successfully:', BUCKET_NAME);
    }

    return true;
  } catch (error) {
    console.error('Error initializing Supabase bucket:', error.message);
    return false;
  }
};

/**
 * Upload a file to Supabase Storage
 * @param {Object} file - File object from multer or similar
 * @param {string} folder - Folder path within the bucket (e.g., 'student-123/assignment-456')
 * @returns {Object} - { success, url, path, error }
 */
export const uploadFile = async (file, folder = '') => {
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase not initialized. Check environment variables.',
    };
  }

  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || file.name || '');
    const filename = `${timestamp}-${randomString}${ext}`;
    const filePath = folder ? `${folder}/${filename}` : filename;

    // Read file buffer
    let fileBuffer;
    if (file.buffer) {
      fileBuffer = file.buffer;
    } else if (file.path) {
      fileBuffer = fs.readFileSync(file.path);
    } else {
      throw new Error('No file data available');
    }

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileBuffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) throw error;

    // Get public URL (for private buckets, this requires signed URL)
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      success: true,
      path: data.path,
      url: urlData.publicUrl,
      filename: filename,
      originalName: file.originalname || file.name,
      mimetype: file.mimetype,
      size: file.size,
    };
  } catch (error) {
    console.error('Error uploading file to Supabase:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Upload multiple files to Supabase Storage
 * @param {Array} files - Array of file objects
 * @param {string} folder - Folder path within the bucket
 * @returns {Array} - Array of upload results
 */
export const uploadMultipleFiles = async (files, folder = '') => {
  if (!files || files.length === 0) {
    return [];
  }

  const uploadPromises = files.map((file) => uploadFile(file, folder));
  const results = await Promise.allSettled(uploadPromises);

  return results.map((result, index) => {
    if (result.status === 'fulfilled' && result.value.success) {
      return result.value;
    } else {
      return {
        success: false,
        error: result.reason || result.value?.error || 'Upload failed',
        filename: files[index].originalname,
      };
    }
  });
};

/**
 * Get a signed URL for a private file (expires in 1 hour by default)
 * @param {string} filePath - Path to the file in the bucket
 * @param {number} expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns {Object} - { success, signedUrl, error }
 */
export const getSignedUrl = async (filePath, expiresIn = 3600) => {
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase not initialized',
    };
  }

  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, expiresIn);

    if (error) throw error;

    return {
      success: true,
      signedUrl: data.signedUrl,
    };
  } catch (error) {
    console.error('Error getting signed URL:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Delete a file from Supabase Storage
 * @param {string} filePath - Path to the file in the bucket
 * @returns {Object} - { success, error }
 */
export const deleteFile = async (filePath) => {
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase not initialized',
    };
  }

  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Delete multiple files from Supabase Storage
 * @param {Array} filePaths - Array of file paths
 * @returns {Object} - { success, error }
 */
export const deleteMultipleFiles = async (filePaths) => {
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase not initialized',
    };
  }

  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(filePaths);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting files:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default {
  initializeBucket,
  uploadFile,
  uploadMultipleFiles,
  getSignedUrl,
  deleteFile,
  deleteMultipleFiles,
};
