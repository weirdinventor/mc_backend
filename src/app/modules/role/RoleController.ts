import { inject, injectable } from "inversify";
import {
  Body,
  Delete,
  JsonController,
  Param,
  Post,
  Put,
  Res, UseBefore,
} from "routing-controllers";
import { CreateRole } from "../../../core/write/usecases/role/CreateRole";
import { Response } from "express";
import { CreateRoleCommand } from "./commands/CreateRoleCommand";
import { validateOrReject } from "class-validator";
import { DeleteRole } from "../../../core/write/usecases/role/DeleteRole";
import { UpdateRoleCommand } from "./commands/UpdateRoleCommand";
import { UpdateRole } from "../../../core/write/usecases/role/UpdateRole";
import {AuthenticationMiddleware} from "../../middlewares/AuthenticationMiddleware";

@injectable()
@JsonController("/role")
export class RoleController {
  constructor(
    @inject(CreateRole) private readonly _createRole: CreateRole,
    @inject(UpdateRole) private readonly _updateRole: UpdateRole,
    @inject(DeleteRole) private readonly _deleteRole: DeleteRole
  ) {}

  @UseBefore(AuthenticationMiddleware)
  @Post("/")
  async createRole(@Res() res: Response, @Body() cmd: CreateRoleCommand) {
    const body = CreateRoleCommand.setProperties(cmd);
    await validateOrReject(body);

    const role = await this._createRole.execute(body);

    return res.status(201).json(role.props);
  }

  @UseBefore(AuthenticationMiddleware)
  @Put("/:roleId")
  async updateRole(
    @Res() res: Response,
    @Body() cmd: UpdateRoleCommand,
    @Param("roleId") roleId: string
  ) {
    const boyd = UpdateRoleCommand.setProperties(cmd);

    await validateOrReject(boyd);

    const role = await this._updateRole.execute({
      id: roleId,
      name: cmd.name,
      permissions: cmd.permissions
    });

    return res.status(200).json(role.props);
  }

  @UseBefore(AuthenticationMiddleware)
  @Delete("/:roleId")
  async deleteRole(@Res() res: Response, @Param("roleId") roleId: string) {
    await this._deleteRole.execute({ roleId });

    return res.status(200).json({
      message: "Role deleted successfully.",
    });
  }
}
