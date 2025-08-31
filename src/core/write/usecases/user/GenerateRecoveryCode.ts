import {inject, injectable} from "inversify";
import {UserRepository} from "../../domain/repositories/UserRepository";
import {UserErrors} from "../../domain/errors/UserErrors";
import {Usecase} from "../../domain/models/Usecase";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";
import {Identifiers} from "../../../Identifiers";
import {customAlphabet} from "nanoid";


export interface GenerateRecoveryCodeInput {
  email: string;
}

@injectable()
export class GenerateRecoveryCode implements Usecase<GenerateRecoveryCodeInput, void> {

  constructor(
    @inject(Identifiers.userRepository)
    private readonly userRepository: UserRepository,
    @inject(EventDispatcher)
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(request: GenerateRecoveryCodeInput): Promise<void> {
    const { email } = request;
    const user = await this.userRepository.getByEmail(email);
    if (!user) {
      throw new UserErrors.UserNotFound();
    }

    const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVW1234567890')

    user.generateRecoveryCode(nanoid(5));
    await this.userRepository.save(user);
    await this.eventDispatcher.dispatch(user);
    return;
  }
}
