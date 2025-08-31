import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateBadgeCommand {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(['Module_Expert_Contributor', 'Special', 'Achievement', 'Skill', 'Community'])
    @IsNotEmpty()
    badgeType: 'Module_Expert_Contributor' | 'Special' | 'Achievement' | 'Skill' | 'Community';

    @IsString()
    @IsOptional()
    pictureUrl?: string;

    static setProperties(cmd: CreateBadgeCommand): CreateBadgeCommand {
        const command = new CreateBadgeCommand();
        command.name = cmd.name;
        command.description = cmd.description;
        command.badgeType = cmd.badgeType;
        command.pictureUrl = cmd.pictureUrl;
        return command;
    }
}