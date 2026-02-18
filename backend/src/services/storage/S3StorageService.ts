/**
 * S3StorageService - AWS S3 기반 이미지 저장 서비스
 *
 * TODO: S3 전환 시 아래 패키지 설치 필요
 *   npm install @aws-sdk/client-s3 @aws-sdk/lib-storage
 *
 * 구현 시 LocalStorageService와 동일한 StorageService 인터페이스를 구현하면
 * 코드 변경 없이 스토리지 교체 가능
 */
import { StorageService, UploadResult } from './StorageService';

export class S3StorageService implements StorageService {
  private bucket: string;
  private region: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET || '';
    this.region = process.env.AWS_REGION || 'ap-northeast-2';

    if (!this.bucket) {
      throw new Error('S3_BUCKET environment variable is required');
    }
  }

  async upload(_file: Express.Multer.File, _folder: string): Promise<UploadResult> {
    // TODO: Implement S3 upload
    // const client = new S3Client({ region: this.region });
    // const key = `${folder}/${file.filename}`;
    // await new Upload({ client, params: { Bucket: this.bucket, Key: key, Body: file.buffer } }).done();
    throw new Error('S3StorageService.upload() not yet implemented');
  }

  async delete(_key: string): Promise<void> {
    // TODO: Implement S3 delete
    throw new Error('S3StorageService.delete() not yet implemented');
  }

  getUrl(key: string): string {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }
}
