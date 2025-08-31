import { inject, injectable } from "inversify";
import { Identifiers } from "../../../Identifiers";
import { Usecase } from "../../domain/models/Usecase";
import { ProfileRepository } from "../../domain/repositories/ProfileRepository";
import { uniqueNamesGenerator, Config, adjectives, colors, animals } from 'unique-names-generator';
import {nouns} from "unique-username-generator";

export interface GetProfileByUsernameRequest {
    username: string;
}

export interface IsUsernameTakenResponse {
    isTaken: boolean;
    suggestions: string[];
}

@injectable()
export class IsUsernameTaken implements Usecase<GetProfileByUsernameRequest, IsUsernameTakenResponse> {
    constructor(
        @inject(Identifiers.profileRepository)
        private readonly _profileRepository: ProfileRepository
    ) { }

    async execute(request: GetProfileByUsernameRequest): Promise<IsUsernameTakenResponse> {
        const isTaken = await this._profileRepository.isUsernameExists(request.username);
        if(!isTaken) return {isTaken, suggestions: []};
        const suggestions = [];
        while (suggestions.length < 5) {
            const randomNumber = getRandomNumber(1, 100);
            const username = generateCustomUsername("-", request.username, randomNumber);
            if (!await this._profileRepository.isUsernameExists(username) && suggestions.indexOf(username) === -1) {
                suggestions.push(username);
            }
        }
        return {
            isTaken,
            suggestions
        };
    }
}

function getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateCustomUsername(separator: string, baseName: string, randomNumber: number): string {
    const config: Config = {
        dictionaries: [nouns], // Use a simpler dictionary for concise usernames
        separator: separator,
        length: 1, // Generate one word for simplicity
    };

    const generatedName = uniqueNamesGenerator(config);
    const includeColor = Math.random() < 0.5; // 50% chance to include a color
    return includeColor ? `${baseName}${separator}${generatedName}${randomNumber}` : `${baseName}${separator}${randomNumber}`;
}
