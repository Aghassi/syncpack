import { isArrayOfStrings } from 'expect-more';
import { pipe } from 'fp-ts/lib/function';
import { Json } from 'fp-ts/lib/Json';
import { filter, map as mapOption, match, Option, some } from 'fp-ts/lib/Option';
import { map as mapTaskEither, TaskEither } from 'fp-ts/TaskEither';
import { join } from 'path';
import { CWD } from '../../../constants';
import { getIn } from './get-in';
import { readJsonSafe } from './read-json-safe';

/**
 * @param filePath Absolute path to a package.json
 */
export function getYarnPatterns(): TaskEither<Error, Option<string[]>> {
  return pipe(
    readJsonSafe(join(CWD, 'package.json')),
    mapTaskEither((yarn) => pipe(findPackages(yarn), mapOption(addRootDir), mapOption(limitToPackageJson))),
  );
}

function findPackages(yarn: Json): Option<string[]> {
  return pipe(
    getArrayOfStrings(['workspaces'], yarn),
    match(() => getArrayOfStrings(['workspaces', 'packages'], yarn), some),
  );
}

function getArrayOfStrings(paths: string[], yarn: Json): Option<string[]> {
  return pipe(getIn(paths, yarn), filter(isArrayOfStrings));
}

function addRootDir(patterns: string[]): string[] {
  return [CWD, ...patterns];
}

function limitToPackageJson(patterns: string[]): string[] {
  return patterns.map((pattern) => join(pattern, 'package.json'));
}
