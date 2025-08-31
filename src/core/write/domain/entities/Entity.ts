const isEntity = (v: any): v is Entity<any> => {
  return v instanceof Entity;
};

export class Entity<T> {
  public readonly id: string;

  protected constructor(id: string) {
    this.id = id;
  }

  protected equals(object?: Entity<T>): boolean {
    if (object == null) {
      return false;
    }

    if (this === object) {
      return true;
    }

    return isEntity(object);
  }
}
