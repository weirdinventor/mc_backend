import { UserIdentity } from '../entities/UserIdentity';

export interface Query<IRequest, IResponse> {
  execute(request?: IRequest): Promise<IResponse> | IResponse;
  canExecute?(identity: UserIdentity, request?: IRequest): Promise<boolean>;
}
