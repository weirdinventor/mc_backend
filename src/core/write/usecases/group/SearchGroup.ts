import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Identifiers} from "../../../Identifiers";
import {GroupRepository} from "../../domain/repositories/GroupRepository";
import {GroupDtoProperties} from "../../domain/dtos/GroupDto";

export interface SearchGroupInput {
    query: string;
    take: number;
    skip: number;
}

@injectable()
export class SearchGroup implements Usecase<SearchGroupInput, GroupDtoProperties[]> {

    constructor(
        @inject(Identifiers.groupRepository) private readonly _groupRepository: GroupRepository
    ) {
    }

    async execute(request: SearchGroupInput): Promise<GroupDtoProperties[]> {
        return await this._groupRepository.searchGroup(request)
    }
}