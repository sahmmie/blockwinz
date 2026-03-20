import { Injectable, StreamableFile } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  async uploadFile(
    file: Express.Multer.File,
    folderTitle: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream(
        { folder: folderTitle },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      new StreamableFile(file.buffer).getStream().pipe(upload);
    });
  }
}
