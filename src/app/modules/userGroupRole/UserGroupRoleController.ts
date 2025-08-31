import {inject, injectable} from "inversify";
import {Body, JsonController, Post, Res, UseBefore} from "routing-controllers";
import {AssignRoleToUser} from "../../../core/write/usecases/userGroupRole/AssignRoleToUser";
import {Response} from "express";
import {AssignRoleToUserCommand} from "./commands/AssignRoleToUserCommand";
import {validateOrReject} from "class-validator";
import {AuthenticationMiddleware} from "../../middlewares/AuthenticationMiddleware";

@injectable()
@JsonController("/user-role")
export class UserGroupRoleController {
    constructor(
        @inject(AssignRoleToUser)
        private readonly _assignRoleToUser: AssignRoleToUser
    ) {
    }

    @UseBefore(AuthenticationMiddleware)
    @Post("/")
    async assignRoleToUser(
        @Res() res: Response,
        @Body() cmd: AssignRoleToUserCommand
    ) {
        const body = AssignRoleToUserCommand.setProperties(cmd);
        await validateOrReject(body);

        const userGroupRoles = [];
        for (const roleId of cmd.roleIds) {
            const userGroupRole = await this._assignRoleToUser.execute({
                userId: cmd.userId,
                groupId: cmd.groupId,
                roleId: roleId,
            });
            userGroupRoles.push(userGroupRole);
        }

        return res.status(201).json(userGroupRoles.map((userGroupRole) => ({
            id: userGroupRole.id,
            groupId: userGroupRole.props.groupId,
            user: userGroupRole.props.user,
            role: userGroupRole.props.role,
            createdAt: userGroupRole.createdAt,
            updatedAt: userGroupRole.updatedAt,
        })));
    }
}
