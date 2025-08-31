import { Expose, plainToClass } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";
import { injectable } from "inversify";

@injectable()
export class AddNewMemberCommand {
  @Expose()
  @IsString()
  @IsNotEmpty()
  groupId: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  userId: string;

  static setProperties(cmd: AddNewMemberCommand): AddNewMemberCommand {
    return plainToClass(AddNewMemberCommand, cmd, {
      excludeExtraneousValues: true,
    });
  }
}
