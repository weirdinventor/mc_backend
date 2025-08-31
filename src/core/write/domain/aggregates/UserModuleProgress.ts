import { AggregateRoot } from "../entities/AggregateRoot";

export type CompletionStatus = 'NotStarted' | 'InProgress' | 'Completed';

export interface UserModuleProgressProperties {
    id: string;
    userId: string;
    moduleId: string;
    completionStatus: CompletionStatus;
    discussionMessageCount: number;
}

export class UserModuleProgress extends AggregateRoot<UserModuleProgressProperties> {
    static restore(props: UserModuleProgressProperties) {
        return new UserModuleProgress(props);
    }
}