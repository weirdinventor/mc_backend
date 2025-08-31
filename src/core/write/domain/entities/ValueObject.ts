import { isEqual } from 'lodash';
import { Primitive } from 'ts-essentials';

export abstract class ValueObject<TProps extends object | Primitive> {
  public readonly props: TProps;

  protected constructor(props: TProps) {
    this.props = Object.freeze(props);
  }

  get value(): TProps {
    return this.props;
  }

  public equals(vo?: ValueObject<TProps>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }

    if (vo.props === undefined) {
      return false;
    }

    if (this === vo) {
      return true;
    }

    return isEqual(this.props, vo.props);
  }
}
