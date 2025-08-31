import {inject, injectable} from "inversify";
import {
    Body,
    Get,
    JsonController,
    Param,
    Patch,
    Post,
    Put,
    QueryParam,
    Req,
    Res,
    UseBefore,
    Delete
} from "routing-controllers";
import {Response} from "express";
import {validateOrReject} from "class-validator";
import {Signup} from "../../../core/write/usecases/authentication/Signup";
import {SignupCommand} from "./commands/SignupCommand";
import {Identifiers} from "../../../core/Identifiers";
import {IdentityGateway} from "../../../core/write/domain/gateway/IdentityGateway";
import {SignIn} from "../../../core/write/usecases/authentication/SignIn";
import {SignInCommand} from "./commands/SignInCommand";
import {CreateProfile} from "../../../core/write/usecases/user/CreateProfile";
import {CreateProfileCommand} from "./commands/CreateProfileCommand";
import {AuthenticatedRequest} from "../../config/AuthenticatedRequest";
import {AuthenticationMiddleware} from "../../middlewares/AuthenticationMiddleware";
import {UnAuthorizedAction} from "../../config/models/UnAuthorizedAction";
import {SignInAppleUser} from "../../../core/write/usecases/apple/SignInAppleUser";
import {SignUpGoogleUser} from "../../../core/write/usecases/google/SignUpGoogleUser";
import {SignInGoogleUser} from "../../../core/write/usecases/google/SignInGoogleUser";
import {GeneratePreSignedUrl} from "../../../core/write/usecases/user/GeneratePreSignedUrl";
import {AddProfilePicture} from "../../../core/write/usecases/user/AddProfilePicture";
import {GetPersonalInformation} from "../../../core/read/queries/users/GetPersonalInformation";
import {EnrollDeviceCommand} from "./commands/EnrollDeviceCommand";
import {EnrollDevice} from "../../../core/write/usecases/notification/EnrollDevice";
import {UserDto} from "./dtos/UserDto";
import {SignUpAppleUser} from "../../../core/write/usecases/apple/SignUpAppleUser";
import {GetUserById} from "../../../core/read/queries/users/GetUserById";
import {UpdateUsername} from "../../../core/write/usecases/user/UpdateUsername";
import {UpdateUsernameCommand} from "./commands/UpdateUsernameCommand";
import {GenerateRecoveryCodeCommand} from "./commands/GenerateRecoveryCodeCommand";
import {ResetPasswordCommand} from "./commands/ResetPasswordCommand";
import {ResetPassword} from "../../../core/write/usecases/user/ResetPassword";
import {GenerateRecoveryCode} from "../../../core/write/usecases/user/GenerateRecoveryCode";
import {ChangePasswordCommand} from "./commands/ChangePasswordCommand";
import {ChangePassword} from "../../../core/write/usecases/user/ChangePassword";
import {SearchUser} from "../../../core/read/queries/users/SearchUser";
import {GenerateFirebaseToken} from "../../../core/write/usecases/firebase/GenerateFirebaseToken";
import {DeleteAccount} from "../../../core/write/usecases/user/DeleteAccount";
import {GetAllUsers} from "../../../core/read/queries/users/GetAllUsers";
import {BlockUser} from "../../../core/write/usecases/user/BlockUser";
import {ActivateAccount} from "../../../core/write/usecases/user/ActivateAccount";
import {GamificationService} from "../../../adapters/services/GamificationService";

@injectable()
@JsonController("/user")
export class UserController {
    private readonly _userDto: UserDto = new UserDto()

    constructor(
        @inject(Signup) private readonly _signup: Signup,
        @inject(Identifiers.identityGateway) private readonly _identityGateway: IdentityGateway,
        @inject(SignIn) private readonly _signIn: SignIn,
        @inject(GenerateFirebaseToken) private readonly _generateFirebaseToken: GenerateFirebaseToken,
        @inject(CreateProfile) private readonly _createProfile: CreateProfile,
        @inject(SignInAppleUser) private readonly _signInAppleUser: SignInAppleUser,
        @inject(SignUpAppleUser) private readonly _signUpAppleUser: SignUpAppleUser,
        @inject(SignUpGoogleUser) private readonly _signUpGoogleUser: SignUpGoogleUser,
        @inject(SignInGoogleUser) private readonly _signInGoogleUser: SignInGoogleUser,
        @inject(GeneratePreSignedUrl) private readonly _generatePreSignedUrl: GeneratePreSignedUrl,
        @inject(AddProfilePicture) private readonly _addProfilePicture: AddProfilePicture,
        @inject(GetPersonalInformation) private readonly _getPersonalInformation: GetPersonalInformation,
        @inject(EnrollDevice) private readonly _enrollDevice: EnrollDevice,
        @inject(GetUserById) private readonly _getUserById: GetUserById,
        @inject(UpdateUsername) private readonly _updateUsername: UpdateUsername,
        @inject(GenerateRecoveryCode) private readonly _generateRecoveryCode: GenerateRecoveryCode,
        @inject(ResetPassword) private readonly _resetPassword: ResetPassword,
        @inject(ChangePassword) private readonly _changePassword: ChangePassword,
        @inject(SearchUser) private readonly _searchUser: SearchUser,
        @inject(GetAllUsers) private readonly _getAllUsers: GetAllUsers,
        @inject(BlockUser) private readonly _blockUser: BlockUser,
        @inject(DeleteAccount) private readonly _deleteAccount: DeleteAccount,
        @inject(ActivateAccount) private readonly _activateAccount: ActivateAccount,
        @inject(Identifiers.gamificationService) private readonly _gamificationService: GamificationService
    ) {
    }

    @Post("/signup")
    async signup(@Res() res: Response, @Body() cmd: SignupCommand) {
        const body = SignupCommand.setProperties(cmd);
        await validateOrReject(body);

        const user = await this._signup.execute({
            email: body.email,
            password: body.password,
        });
        const {email, id, role, isSubscribed} = user.props
        const response = this._userDto.fromDomain(user)
        const token = await this._identityGateway.encode({email, id, role, isSubscribed})
        const firebaseToken = await this._generateFirebaseToken.execute({email, id, role})
        return res.status(201).send({
            token,
            firebaseToken,
            user: response
        });
    }

    @Post("/signin")
    async signIn(@Res() res: Response, @Body() cmd: SignInCommand) {
        const body = SignInCommand.setProperties(cmd);
        await validateOrReject(body);
        const user = await this._signIn.execute({
            email: body.email,
            password: body.password,
        });
        const {email, id, role, isSubscribed} = user

        // Check and grant daily reward
        await this._gamificationService.checkAndGrantDailyReward(id);

        const token = await this._identityGateway.encode({email, id, role, isSubscribed})
        const firebaseToken = await this._generateFirebaseToken.execute({email, id, role})
        return res.status(201).send({
            token,
            firebaseToken,
            user
        });
    }

    @UseBefore(AuthenticationMiddleware)
    @Post("/profile")
    async createProfile(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @Body() cmd: CreateProfileCommand
    ) {
        const body = CreateProfileCommand.setProperties(cmd);
        await validateOrReject(body);
        const {firstname, lastname, username, gender} = body;
        const isAuthorized = await this._createProfile.canExecute(req.identity, {
            id: req.identity.id,
            firstname,
            lastname,
            username,
            gender
        });
        if (!isAuthorized) {
            return UnAuthorizedAction(res);
        }
        const result = await this._createProfile.execute({
            id: req.identity.id,
            firstname,
            lastname,
            username,
            gender
        });
        return res.status(200).send(result.props);
    }

    @UseBefore(AuthenticationMiddleware)
    @Post('/auth/refresh-token')
    async refreshFirebaseToken(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest
    ) {
        const {email, id, role} = req.identity
        const firebaseToken = await this._generateFirebaseToken.execute({email, id, role})
        return res.status(200).send({
            token: firebaseToken
        });
    }

    @Post('/auth/apple')
    async signInAppleUser(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @Body() cmd: { token: string }
    ) {
        const body = cmd;
        await validateOrReject(body);
        const user = await this._signInAppleUser.execute({token: body.token});
        const {email, id, role} = user.props
        const response = this._userDto.fromDomain(user)
        const token = await this._identityGateway.encode({email, id, role, isSubscribed: user.props.isSubscribed})
        const firebaseToken = await this._generateFirebaseToken.execute({email, id, role})
        return res.status(201).send({
            token,
            firebaseToken,
            user: response
        });
    }

    @Post('/register/apple')
    async signUpAppleUser(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @Body() cmd: { token: string }
    ) {
        const body = cmd;
        await validateOrReject(body);
        const user = await this._signUpAppleUser.execute({token: body.token});
        const {email, id, role, isSubscribed} = user.props
        const response = this._userDto.fromDomain(user)
        const token = await this._identityGateway.encode({email, id, role, isSubscribed})
        const firebaseToken = await this._generateFirebaseToken.execute({email, id, role})
        return res.status(201).send({
            token,
            firebaseToken,
            user: response
        });
    }

    @Post('/auth/google')
    async signInGoogleUser(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @Body() cmd: { token: string }
    ) {
        const body = cmd;
        await validateOrReject(body);
        const user = await this._signInGoogleUser.execute({token: body.token});
        const {email, id, role, isSubscribed} = user.props
        const response = this._userDto.fromDomain(user)
        const token = await this._identityGateway.encode({email, id, role, isSubscribed})
        const firebaseToken = await this._generateFirebaseToken.execute({email, id, role})
        return res.status(201).send({
            token,
            firebaseToken,
            user: response
        });
    }

    @Post('/register/google')
    async signUpGoogleUser(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @Body() cmd: { token: string }
    ) {
        const body = cmd;
        await validateOrReject(body);
        const user = await this._signUpGoogleUser.execute({token: body.token});
        const {email, id, role, isSubscribed} = user.props
        const response = this._userDto.fromDomain(user)
        const token = await this._identityGateway.encode({email, id, role, isSubscribed})
        const firebaseToken = await this._generateFirebaseToken.execute({email, id, role})
        return res.status(201).send({
            token,
            firebaseToken,
            user: response
        });
    }

    @UseBefore(AuthenticationMiddleware)
    @Post("/picture/upload")
    async uploadProfilePicture(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
    ) {
        const url = await this._generatePreSignedUrl.execute({
            userId: req.identity.id,
        });
        return res.status(200).send(url);
    }

    @UseBefore(AuthenticationMiddleware)
    @Put("/picture/upload")
    async addProfilePicture(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @Body() cmd: { filePath: string }
    ) {
        const body = cmd;
        await validateOrReject(body);
        const result = await this._addProfilePicture.execute({
            userId: req.identity.id,
            filePath: body.filePath
        });
        return res.status(200).send(result.props);
    }

    @UseBefore(AuthenticationMiddleware)
    @Get('/me')
    async getPersonalInformation(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest
    ) {
        const result = await this._getPersonalInformation.execute({id: req.identity.id});
        return res.status(200).send(result);
    }

    @UseBefore(AuthenticationMiddleware)
    @Post('/device')
    async enrollPhoneDevice(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @Body() cmd: EnrollDeviceCommand
    ) {
        const body = EnrollDeviceCommand.setProperties(cmd)
        await validateOrReject(body)
        const {registrationToken, os} = body
        const phone = await this._enrollDevice.execute({
            id: req.identity.id,
            registrationToken,
            os
        })
        return res.status(200).send(phone.props)
    }

    @UseBefore(AuthenticationMiddleware)
    @Get('/profile/:id')
    async getUserById(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest
    ) {
        const result = await this._getUserById.execute({id: req.params.id});

        if (!result) {
            return res.status(404).send({message: "User not found"});
        }

        return res.status(200).send(result);
    }

    @Patch("/password/recovery")
    async generateRecoveryCode(
        @Res() res: Response,
        @Body() cmd: GenerateRecoveryCodeCommand
    ) {
        const body = GenerateRecoveryCodeCommand.setProperties(cmd);
        await validateOrReject(body);
        await this._generateRecoveryCode.execute({
            email: body.email,
        });
        return res.sendStatus(200);
    }

    @Patch("/password/reset")
    async resetPassword(
        @Res() res: Response,
        @Body() cmd: ResetPasswordCommand
    ) {
        const body = ResetPasswordCommand.setProperties(cmd);
        await validateOrReject(body);
        await this._resetPassword.execute({
            password: body.password,
            email: body.email,
            recoveryCode: body.recoveryCode,
        })
        return res.sendStatus(200);
    }

    @UseBefore(AuthenticationMiddleware)
    @Put('/profile/username')
    async updateUsername(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @Body() cmd: UpdateUsernameCommand
    ) {
        const body = cmd;
        await validateOrReject(body);
        const result = await this._updateUsername.execute({
            id: req.identity.id,
            username: body.username
        });
        return res.status(200).send(result.props);
    }

    @UseBefore(AuthenticationMiddleware)
    @Put('/password/change-password')
    async changePassword(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @Body() cmd: ChangePasswordCommand
    ) {
        const body = cmd;
        await validateOrReject(body);

        await this._changePassword.execute({
            user: req.identity,
            passwordPayload: body
        });

        return res.status(200).send({
            message: "Password changed successfully"
        });
    }

    @UseBefore(AuthenticationMiddleware)
    @Get('/search/:username')
    async searchUser(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest
    ) {
        const result = await this._searchUser.execute({
            username: req.params.username,
            user: req.identity
        });
        return res.status(200).send(result);
    }

    @UseBefore(AuthenticationMiddleware)
    @Put('/block/:userToBlockId')
    async blockUser(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @Param('userToBlockId') userToBlockId: string
    ) {

        await this._blockUser.execute({
            user: req.identity,
            userToBlockId
        });

        return res.status(200).send({
            message: "User blocked successfully."
        });
    }

    @UseBefore(AuthenticationMiddleware)
    @Delete('/account')
    async deleteAccount(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest
    ) {

        await this._deleteAccount.execute(req.identity);
        return res.status(200).send({
            message: "Account deleted successfully"
        });
    }

    /* ADMIN ENDPOINT */

    @UseBefore(AuthenticationMiddleware)
    @Get('/all')
    async getAllUsers(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @QueryParam("page") page: number,
        @QueryParam("subscribed") subscribed?: boolean,
    ) {

        if (!page || typeof page !== "number") {
            return res.status(400).json({
                message: 'Missing or invalid page query parameter.'
            })
        }

        const take = 10
        const skip = (page - 1) * take

        const result = await this._getAllUsers.execute({
            user: req.identity,
            take,
            skip,
            subscribed
        })

        return res.status(200).json({
            users: result.users,
            pagination: {
                totalItems: result.total,
                totalPages: Math.ceil(result.total / take),
                currentPage: page,
            }
        })
    }

    @Put('/activate/:id')
    @UseBefore(AuthenticationMiddleware)
    async activateAccount(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @Param('id') id: string
    ) {
        await this._activateAccount.execute({
            user: req.identity,
            id
        })

        return res.status(200).json({
            message: "User account activated successfully !"
        })

    }

}
