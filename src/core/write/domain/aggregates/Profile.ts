import {AggregateRoot} from "../entities/AggregateRoot";
import {Handle} from "../../../../messages/utilsAndConfugrations/decorators/Handle";
import {ProfileCreated} from "../../../../messages/events/ProfileCreated";
import {UserGender} from "../types/UserGender";
import {ProfilePictureAdded} from "../../../../messages/events/ProfilePictureAdded";
import {UsernameUpdated} from "../../../../messages/events/UsernameUpdated";

export interface ProfileProperties {
    id: string;
    firstname: string;
    lastname: string;
    username: string;
    gender: UserGender;
    profilePicture?: string;
}

export class Profile extends AggregateRoot<ProfileProperties> {
    static restore(props: ProfileProperties) {
        return new Profile(props);
    }

    static create(payload: {
        id: string;
        firstname: string;
        lastname: string;
        username: string;
        gender: UserGender
    }) {
        const {id, firstname, lastname, username, gender} = payload;
        const profile = new Profile({
            id,
            firstname,
            lastname,
            username,
            gender
        });
        profile.applyChange(
            new ProfileCreated({
                id,
                firstname,
                lastname,
                username,
                gender
            })
        );
        return profile;
    }

    @Handle(ProfileCreated)
    private applyProfileCreated(event: ProfileCreated) {
        this.props.id = event.props.id;
        this.props.firstname = event.props.firstname;
        this.props.lastname = event.props.lastname;
        this.props.username = event.props.username;
        this.props.gender = event.props.gender;
    }

    addProfilePicture(params: { url: string }) {
        this.applyChange(
            new ProfilePictureAdded({
                url: params.url
            })
        )
        return this;
    }

    @Handle(ProfilePictureAdded)
    private applyProfilePictureAdded(event: ProfilePictureAdded) {
        this.props.profilePicture = event.props.url;
    }


    updateUsername(params: { username: string }) {
        this.applyChange(
            new UsernameUpdated({
                username: params.username
            })
        )

        return this;
    }

    @Handle(UsernameUpdated)
    private applyUsernameUpdated(event: UsernameUpdated) {
        this.props.username = event.props.username;
    }
}
