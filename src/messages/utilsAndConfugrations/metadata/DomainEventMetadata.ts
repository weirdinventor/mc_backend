export interface DomainEventMetadata {
  aggregateId: string;
  aggregate: string;
  /*
   * Dynamically setted property with decorators
   * **/
  eventName?: string;
  boundedContext?: string;
  version?: number;
  type?: string;
}
