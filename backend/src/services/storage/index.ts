import { StorageService } from './StorageService';
import { LocalStorageService } from './LocalStorageService';
import { S3StorageService } from './S3StorageService';

export { StorageService, UploadResult } from './StorageService';

let storageInstance: StorageService;

export function getStorage(): StorageService {
  if (!storageInstance) {
    const type = process.env.STORAGE_TYPE || 'local';
    storageInstance = type === 's3' ? new S3StorageService() : new LocalStorageService();
  }
  return storageInstance;
}
