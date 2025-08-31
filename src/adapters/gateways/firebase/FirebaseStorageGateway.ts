import {Storage} from 'firebase-admin/storage';
import {injectable} from "inversify";
import {v4} from "uuid";
import {StorageGateway, StorageGatewayPayload} from "../../../core/write/domain/gateway/StorageGateway";

export interface FirebaseStorageGatewayPayload {
    bucketName: string,
    storage: Storage
}

@injectable()
export class FirebaseStorageGateway implements StorageGateway {
    constructor(private readonly firebaseStorage: FirebaseStorageGatewayPayload) {
    }

    async generatePreSignedUrl(payload: StorageGatewayPayload): Promise<{ url: string, filePath: string }> {
        const {username, userId} = payload;
        const bucket = this.firebaseStorage.storage.bucket(this.firebaseStorage.bucketName);
        const filePath = `${username}_${userId}/${v4()}`;
        const file = bucket.file(filePath);

        const expires = Date.now() + 60 * 60 * 1000; // 1 hour

        const [url] = await file.getSignedUrl({
            version: 'v4',
            action: 'write',
            expires
        });
        return {url, filePath};
    }

    async getDownloadUrl(filePath: string): Promise<string> {

        const bucket = this.firebaseStorage.storage.bucket(this.firebaseStorage.bucketName);
        const file = bucket.file(filePath);
        await file.makePublic();
        const [exists] = await file.exists();
        if (!exists) {
            throw new Error('FILE_NOT_FOUND');
        }
        return file.publicUrl();
    }
}
