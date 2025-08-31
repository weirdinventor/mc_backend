export interface MessageData<T> {
  readonly id: string;
  readonly name: string;
  readonly timestamp: number;
  readonly namespace: string;
  readonly version: number;
  // readonly context: ExecutionContext;
  readonly payload: T;
}
