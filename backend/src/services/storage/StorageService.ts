export interface UploadResult {
  url: string;
  key: string;
}

export interface StorageService {
  upload(file: Express.Multer.File, folder: string): Promise<UploadResult>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
}
