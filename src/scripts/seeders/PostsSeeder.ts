import {CreatePost} from "../../core/write/usecases/feed/CreatePost";
import {PostMediaType} from "../../core/write/domain/types/PostMediaType";
import {UserRepository} from "../../core/write/domain/repositories/UserRepository";
import {Identifiers} from "../../core/Identifiers";
import {AppDependencies} from "../../app/config/AppDependencies";


const main = async (container: AppDependencies)  => {

    const createPost = container.get(CreatePost)
    const userRepo = container.get<UserRepository>(Identifiers.userRepository)

    const user = await userRepo.getByEmail('admin@moula.app')

    if (!user) {
        throw new Error('User not found')
    }
    const Post = await createPost.execute({
        post: {
            text: 'Hello Moula Club',
            mediaType: PostMediaType.TEXT
        },
        user: {
            id: user.id,
            email: user.props.email,
            role:  user.props.role,
            isSubscribed: false
        }
    })
    return Post;
}

export default main;