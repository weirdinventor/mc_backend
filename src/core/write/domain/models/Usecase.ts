import { UserIdentity } from '../entities/UserIdentity';

export interface Usecase<IRequest, IResponse> {
  execute(request?: IRequest): Promise<IResponse> | IResponse;
  canExecute?(identity: UserIdentity, request?: IRequest): Promise<boolean>;
}
