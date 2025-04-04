
import { supabase } from "@/integrations/supabase/client";
import { RequestFile, User } from "@/types";
import { logActivity, LogActions } from "./LogService";

export async function uploadRequestFile(
  requestId: string, 
  file: File, 
  user: User, 
  isPublic: boolean = true
): Promise<RequestFile | null> {
  try {
    // Upload file to storage
    const filename = `${requestId}/${Date.now()}_${file.name}`;
    const { data: storageData, error: storageError } = await supabase.storage
      .from('procurement_files')
      .upload(filename, file);

    if (storageError) throw storageError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('procurement_files')
      .getPublicUrl(filename);

    const fileUrl = urlData.publicUrl;

    // Create file record in database
    const fileRecord = {
      request_id: requestId,
      name: file.name,
      url: fileUrl,
      size: file.size,
      type: file.type,
      is_public: isPublic,
      uploaded_by: user.id
    };

    const { data, error } = await supabase
      .from('request_files')
      .insert(fileRecord)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await logActivity(
      user,
      LogActions.UPLOAD_FILE,
      "file",
      data.id,
      { requestId, fileName: file.name }
    );

    // Convert to frontend model
    const requestFile: RequestFile = {
      id: data.id,
      name: data.name,
      url: data.url,
      size: data.size,
      type: data.type,
      uploadedAt: data.uploaded_at,
      isPublic: data.is_public,
      uploadedBy: data.uploaded_by
    };

    return requestFile;
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
}

export async function getRequestFiles(requestId: string): Promise<RequestFile[]> {
  try {
    const { data, error } = await supabase
      .from('request_files')
      .select('*')
      .eq('request_id', requestId);

    if (error) throw error;

    return (data || []).map(file => ({
      id: file.id,
      name: file.name,
      url: file.url,
      size: file.size,
      type: file.type,
      uploadedAt: file.uploaded_at,
      isPublic: file.is_public,
      uploadedBy: file.uploaded_by
    }));
  } catch (error) {
    console.error("Error fetching request files:", error);
    return [];
  }
}
