export interface HandlerContext {
  [key: string]: any;

  /** human readable correlation id initiator name */
  initiator?: string;

  /** id of the authenticated actor, it can be an user or an entity / organization */
  actorId?: string;

  /** Used to track a global workflow through the system */
  correlationId?: string;
}
