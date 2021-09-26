import { isArrayOfStrings } from 'expect-more';
import { pipe } from 'fp-ts/lib/function';
import { filter, map as mapOption, Option } from 'fp-ts/lib/Option';
import { map as mapTaskEither, TaskEither } from 'fp-ts/TaskEither';
import { join } from 'path';
import { CWD } from '../../../constants';
import { getIn } from './get-in';
import { readJsonSafe } from './read-json-safe';

/**
 * @param filePath Absolute file path to a lerna.json
 */
export function getLernaPatterns(): TaskEither<Error, Option<string[]>> {
  return pipe(
    readJsonSafe(join(CWD, 'lerna.json')),
    mapTaskEither((lerna) =>
      pipe(
        getIn<string[]>(['packages'], lerna),
        filter(isArrayOfStrings),
        mapOption(addRootDir),
        mapOption(limitToPackageJson),
      ),
    ),
  );
}

function addRootDir(patterns: string[]): string[] {
  return [CWD, ...patterns];
}

function limitToPackageJson(patterns: string[]): string[] {
  return patterns.map((pattern) => join(pattern, 'package.json'));
}
