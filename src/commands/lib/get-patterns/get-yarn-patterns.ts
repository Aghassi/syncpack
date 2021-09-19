import { isArrayOfStrings } from 'expect-more';
import { pipe } from 'fp-ts/lib/function';
import { Json } from 'fp-ts/lib/Json';
import { filter, isSome, map as mapOption, none, Option } from 'fp-ts/lib/Option';
import { map as mapTaskEither, TaskEither } from 'fp-ts/TaskEither';
import { join } from 'path';
import { getIn } from './get-in';
import { readJsonSafe } from './read-json-safe';

const possiblePaths = [['workspaces', 'packages'], ['workspaces']];

/**
 * @param filePath Absolute path to a package.json
 */
export function getYarnPatterns(filePath: string): TaskEither<Error, Option<string[]>> {
  return pipe(
    readJsonSafe(filePath),
    mapTaskEither((yarn) => pipe(findPackages(yarn), mapOption(addRootDir), mapOption(limitToPackageJson))),
  );
}

function findPackages(yarn: Json): Option<string[]> {
  return possiblePaths.map((paths) => pipe(getIn(paths, yarn), filter(isArrayOfStrings))).find(isSome) || none;
}

function addRootDir(patterns: string[]): string[] {
  return [process.cwd(), ...patterns];
}

function limitToPackageJson(patterns: string[]): string[] {
  return patterns.map((pattern) => join(pattern, 'package.json'));
}
