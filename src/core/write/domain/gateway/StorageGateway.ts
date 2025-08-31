export interface StorageGatewayPayload {
    username: string,
    userId: string,
}

export interface StorageGateway {
    generatePreSignedUrl(payload: StorageGatewayPayload): Promise<{ url: string, filePath: string }>

    getDownloadUrl(filePath: string): Promise<string>
}
