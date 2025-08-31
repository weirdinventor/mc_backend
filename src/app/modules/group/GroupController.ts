import {inject, injectable} from "inversify";
import {
    Body,
    Delete,
    Get,
    JsonController,
    Param,
    Post,
    Put, Req,
    Res, UseBefore,
} from "routing-controllers";
import {GetUserOwnedGroups} from "../../../core/write/usecases/group/GetUserOwnedGroups";
import {Response} from "express";
import {CreateGroupCommand} from "./commands/CreateGroupCommand";
import {validateOrReject} from "class-validator";
import {CreateGroup} from "../../../core/write/usecases/group/CreateGroup";
import {UpdateGroupCommand} from "./commands/UpdateGroupCommand";
import {UpdateGroup} from "../../../core/write/usecases/group/UpdateGroup";
import {AddNewMember} from "../../../core/write/usecases/group/AddNewMemeber";
import {AddNewMemberCommand} from "./commands/AddNewMemberCommand";
import {GetUserJoinedGroups} from "../../../core/write/usecases/group/GetUserJoinedGroups";
import {DeleteGroup} from "../../../core/write/usecases/group/DeleteGroup";
import {SearchGroup} from "../../../core/write/usecases/group/SearchGroup";
import {SearchGroupCommand} from "./commands/SearchGroupCommand";
import {AuthenticationMiddleware} from "../../middlewares/AuthenticationMiddleware";
import {AuthenticatedRequest} from "../../config/AuthenticatedRequest";
import {GetGroupMembers} from "../../../core/read/queries/group/GetGroupMembers";
import {GetGroups} from "../../../core/write/usecases/group/GetGroups";
import {GetGroupById} from "../../../core/write/usecases/group/GetGroupById";

@injectable()
@JsonController("/group")
export class GroupController {
    constructor(
        @inject(SearchGroup) private readonly _searchGroup: SearchGroup,
        @inject(GetUserOwnedGroups) private readonly _getOwnedGroupsGroups: GetUserOwnedGroups,
        @inject(GetUserJoinedGroups)
        private readonly _getUserJoinedGroups: GetUserJoinedGroups,
        @inject(GetGroupMembers) private readonly _getGroupMembers: GetGroupMembers,
        @inject(CreateGroup) private readonly _createGroup: CreateGroup,
        @inject(UpdateGroup) private readonly _updateGroup: UpdateGroup,
        @inject(AddNewMember) private readonly _addNewMember: AddNewMember,
        @inject(DeleteGroup) private readonly _deleteGroup: DeleteGroup,
        @inject(GetGroups) private readonly _getGroups: GetGroups,
        @inject(GetGroupById) private readonly _getGroupById: GetGroupById
    ) {
    }

    @UseBefore(AuthenticationMiddleware)
    @Get("/:id")
    async getGroupById(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @Param("id") id: string
    ) {
        const group = await this._getGroupById.execute({
            id,
            user: req.identity
        });
        return res.status(200).json(group.props);
    }

    @UseBefore(AuthenticationMiddleware)
    @Get("/")
    async getGroups(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest
    ) {
        const groups = await this._getGroups.execute({
            user: req.identity,
            isModule: false,
        });
        return res.status(200).json(groups.map((group) => group.props));
    }

    @UseBefore(AuthenticationMiddleware)
    @Get("/search")
    async searchGroup(@Res() res: Response, @Body() cmd: SearchGroupCommand) {
        const body = SearchGroupCommand.setProperties(cmd);
        await validateOrReject(body);

        const {searchQuery, page} = body

        const take = 10
        const skip = (page - 1) * take

        const groups = await this._searchGroup.execute({
            query: searchQuery,
            skip,
            take
        })

        return res.status(200).json({
            groups: groups.map((group) => group),
            pagination: {
                totalItems: groups.length,
                totalPages: Math.ceil(groups.length / take),
                currentPage: page,
            }
        })
    }

    @UseBefore(AuthenticationMiddleware)
    @Get("/owned/:userId")
    async getGroupsByUserId(@Res() res: Response, @Param("userId") id: string) {
        const groups = await this._getOwnedGroupsGroups.execute(id);
        return res.status(200).json(groups.map((group) => group));
    }

    @UseBefore(AuthenticationMiddleware)
    @Get("/joined/:userId")
    async getUserJoinedGroups(@Res() res: Response, @Param("userId") id: string) {
        const groups = await this._getUserJoinedGroups.execute(id);
        return res.status(200).json(groups.map((group) => group));
    }

    @UseBefore(AuthenticationMiddleware)
    @Get("/:groupId/members")
    async getGroupMembers(@Res() res: Response, @Param("groupId") id: string) {
        const members = await this._getGroupMembers.execute({
            groupId: id,
        });
        return res.status(200).json(members.map((member) => member));
    }

    @UseBefore(AuthenticationMiddleware)
    @Post("/")
    async createGroup(
        @Req() req: AuthenticatedRequest,
        @Res() res: Response,
        @Body() cmd: CreateGroupCommand
    ) {
        const body = CreateGroupCommand.setProperties(cmd);

        await validateOrReject(body);

        const group = await this._createGroup.execute({
            user: req.identity,
            data: body,
            isModule: false,
        });

        return res.status(201).json(group.props);
    }

    @UseBefore(AuthenticationMiddleware)
    @Put("/:groupId")
    async updateGroup(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @Body() cmd: UpdateGroupCommand,
        @Param("groupId") id: string
    ) {
        const body = UpdateGroupCommand.setProperties(cmd);
        await validateOrReject(body);

        const {name, subject, thumbnail, coverImage, permissions} = body;

        const group = await this._updateGroup.execute({
            user: req.identity,
            data: {
                id,
                name,
                subject,
                coverImage,
                thumbnail,
                permissions,
            },
            isModule: false
        });

        return res.status(200).json(group.props);
    }

    @UseBefore(AuthenticationMiddleware)
    @Put("/")
    async addNewMember(
        @Res() res: Response,
        @Req() user: AuthenticatedRequest,
        @Body() cmd: AddNewMemberCommand) {
        const body = AddNewMemberCommand.setProperties(cmd);
        await validateOrReject(body);

        const {groupId, userId} = body;

        const group = await this._addNewMember.execute({
            user: user.identity,
            data: {
                groupId,
                userId
            }
        });

        return res.status(200).json(group.props);
    }


    @UseBefore(AuthenticationMiddleware)
    @Delete("/:groupId")
    async deleteGroup(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @Param("groupId") id: string
    ) {
        await this._deleteGroup.execute({
            user: req.identity,
            id,
            isModule: false
        });

        return res.status(200).json({
            message: "Group deleted successfully.",
        });
    }
}
