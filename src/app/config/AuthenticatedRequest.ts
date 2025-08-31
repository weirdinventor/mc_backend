import { Request } from "express";
import {UserIdentity} from "../../core/write/domain/entities/UserIdentity";


export interface AuthenticatedRequest extends Request {
    identity: UserIdentity;
}