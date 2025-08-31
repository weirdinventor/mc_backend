
import { Newable } from 'ts-essentials';
import {ReflectMetadataService} from "../metadata/ReflectMetadataService";
import {DomainEvent} from "../../../core/write/domain/entities/DomainEvent";

export function Handle<T extends DomainEvent<any>>(event: Newable<T>) {
  return function (target: any, functionName: any) {
    const meta = ReflectMetadataService.ensureSchemaMetadata(target.constructor);
    // todo check the key index
    meta.handlers.set(event.name, functionName);
  };
}
