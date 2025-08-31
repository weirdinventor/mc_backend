export interface Message<T = any> {
    id: string;
    timestamp?: number;
    props: T;
}




export type Event<T = any> = Message<T>;
