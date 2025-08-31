import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class AssignBadgeCommand {
    @IsString()
    @IsUUID()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsUUID()
    @IsNotEmpty()
    badgeId: string;

    static setProperties(cmd: AssignBadgeCommand): AssignBadgeCommand {
        const command = new AssignBadgeCommand();
        command.userId = cmd.userId;
        command.badgeId = cmd.badgeId;
        return command;
    }
}