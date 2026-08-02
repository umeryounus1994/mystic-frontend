import { Injectable } from '@angular/core';
import { RestApiService } from '../api/rest-api.service';

export type QuestUploadFieldType =
  | 'quest_file'
  | 'reward'
  | 'option1'
  | 'option2'
  | 'option3'
  | 'option4'
  | 'option5';

@Injectable({
  providedIn: 'root'
})
export class QuestUploadService {
  constructor(private api: RestApiService) {}

  uploadFile(
    file: File,
    fieldType: QuestUploadFieldType,
    questTitle: string
  ): Promise<string> {
    return this.api
      .post('quest/presigned-upload-url', {
        file_name: file.name,
        content_type: file.type || 'application/octet-stream',
        field_type: fieldType,
        quest_title: questTitle || 'quest',
      })
      .then(async (response: any) => {
        const uploadUrl = response?.data?.upload_url;
        const publicUrl = response?.data?.public_url;

        if (!uploadUrl || !publicUrl) {
          throw new Error('Failed to get upload URL from server');
        }

        const contentType = file.type || 'application/octet-stream';
        const putResponse = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': contentType,
            'x-amz-acl': 'public-read',
          },
        });

        if (!putResponse.ok) {
          throw new Error(`Upload to storage failed (${putResponse.status})`);
        }

        return publicUrl;
      });
  }
}
