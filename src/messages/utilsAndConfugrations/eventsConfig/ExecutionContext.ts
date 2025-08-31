import {HandlerContext} from "../handlers/HandlerContext";

export interface ExecutionContext extends HandlerContext {
  /**
   * Represent an execution context id,
   * it should b equals to correlationId,
   * when it is the same service that initializes the correlationId
   */
  executionId?: string;
}
