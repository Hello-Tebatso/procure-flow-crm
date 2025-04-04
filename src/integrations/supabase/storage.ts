
import { supabase } from './client';

export class StorageService {
  static async uploadFile(
    bucketName: string,
    filePath: string,
    file: File
  ): Promise<{ path: string; url: string } | null> {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading file:', error);
        return null;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      return {
        path: data.path,
        url: publicUrlData.publicUrl
      };
    } catch (error) {
      console.error('Storage service error:', error);
      return null;
    }
  }

  static async deleteFile(bucketName: string, filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) {
        console.error('Error deleting file:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Storage service error:', error);
      return false;
    }
  }

  static getPublicUrl(bucketName: string, filePath: string): string {
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
}
