import {UserErrors} from "../errors/UserErrors";

export class Email {
    value : string;
    constructor(email: string) {
        const emailValidation: boolean = this.validEmail(email)
        if (!emailValidation){
            throw new UserErrors.InvalidEmailFormat();
        }
        this.value = email;
    }
    validEmail(email: string){
        const regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
        return regexp.test(email);
    }
}