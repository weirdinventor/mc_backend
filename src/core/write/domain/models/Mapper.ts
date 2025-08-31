export interface Mapper<To, From> {
  toDomain?(raw: To): From;
  fromDomain?(t: From): To;
}
