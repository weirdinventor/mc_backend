import {ExpressMiddlewareInterface} from "routing-controllers";
import {inject, injectable} from "inversify";
import {NextFunction, Response} from "express";
import {AuthenticatedRequest} from "../config/AuthenticatedRequest";
import {Identifiers} from "../../core/Identifiers";
import {IdentityGateway} from "../../core/write/domain/gateway/IdentityGateway";


@injectable()
export class AuthenticationMiddleware implements ExpressMiddlewareInterface {

    constructor(
        @inject(Identifiers.identityGateway)
        private readonly _identityGateway: IdentityGateway,
    ) {
    }

    async use(request: AuthenticatedRequest, response: Response, next?: NextFunction) {
        const authorization = request.header('Authorization');
        if (!authorization) {
            return response.sendStatus(401);
        }
        const [, token] = authorization.split(' ');
        request.identity = await this._identityGateway.verify(token);
        next();
    }
}
