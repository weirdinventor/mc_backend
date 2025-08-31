import { inject, injectable } from "inversify";
import { Usecase } from "../../domain/models/Usecase";
import { Identifiers } from "../../../Identifiers";
import { GroupRepository } from "../../domain/repositories/GroupRepository";
import {GroupDtoProperties} from "../../domain/dtos/GroupDto";

@injectable()
export class GetUserJoinedGroups implements Usecase<string, GroupDtoProperties[]> {
  constructor(
    @inject(Identifiers.groupRepository)
    private readonly _groupRepository: GroupRepository
  ) {}

  async execute(userId: string): Promise<GroupDtoProperties[]> {
    const groups = await this._groupRepository.getUserJoinedGroups(userId);
    return groups;
  }
}
