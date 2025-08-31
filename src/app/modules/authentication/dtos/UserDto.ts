import {injectable} from "inversify";
import {UserRole} from "../../../../core/write/domain/types/UserRole";
import {Mapper} from "../../../../core/write/domain/models/Mapper";
import {User} from "../../../../core/write/domain/aggregates/User";
import {AccountStatus} from "../../../../core/write/domain/types/AccountStatus";


export interface UserApiResponse {
  id: string;
  phone: string;
  email: string;
  role: UserRole;
  status : AccountStatus;
  createdAt: Date;
  updatedAt: Date;
}

@injectable()
export class UserDto implements Mapper<UserApiResponse, User> {
  fromDomain(t: User): UserApiResponse {
    return {
      phone: t.props.phone,
      email: t.props.email,
      id: t.id,
      role: t.props.role,
      status : t.props.status,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }
  }
}
