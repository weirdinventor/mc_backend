import "reflect-metadata";
import {inject, injectable} from "inversify";
import {Identifiers} from "../../../Identifiers";
import {ProfileRepository} from "../../domain/repositories/ProfileRepository";
import {Usecase} from "../../domain/models/Usecase";
import {StorageGateway} from "../../domain/gateway/StorageGateway";

export interface GeneratePreSignedUrlInput {
    userId: string;
}

@injectable()
export class GeneratePreSignedUrl implements Usecase<GeneratePreSignedUrlInput, { url: string, filePath: string }> {
    constructor(
        @inject(Identifiers.storageGateway)
        private readonly storageGateway: StorageGateway,
        @inject(Identifiers.profileRepository)
        private readonly profileRepository: ProfileRepository
    ) {
    }

    async execute(input: GeneratePreSignedUrlInput): Promise<{ url: string, filePath: string }> {
        const profile = await this.profileRepository.getById(input.userId);
        return await this.storageGateway.generatePreSignedUrl({
            userId: profile.props.id,
            username: profile.props.username
        });
    }
}
