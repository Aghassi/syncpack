import { Json } from 'fp-ts/lib/Json';
import { none, Option, some } from 'fp-ts/lib/Option';

export function getIn<T = Json>(props: string[], origin: unknown): Option<T> {
  let value: unknown = origin;
  for (const prop of props) {
    if (isWalkable(value) && prop in value) {
      value = value[prop];
    } else {
      return none;
    }
  }
  if (value === undefined) return none;
  return some(value as T);
}

function isWalkable(value: unknown): value is Record<string, unknown> {
  return value !== null && ['object', 'function'].includes(typeof value);
}
