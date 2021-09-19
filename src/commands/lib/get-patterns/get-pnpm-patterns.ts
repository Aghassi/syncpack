import { isArrayOfStrings } from 'expect-more';
import { pipe } from 'fp-ts/lib/function';
import { filter, Option, map as mapOption } from 'fp-ts/lib/Option';
import { map as mapTaskEither, TaskEither } from 'fp-ts/TaskEither';
import { join } from 'path';
import { getIn } from './get-in';
import { readYamlSafe } from './read-yaml-safe';

interface PnpmWorkspace {
  packages?: string[];
}

/**
 * @param filePath Absolute file path to a pnpm-workspace.yaml
 */
export function getPnpmPatterns(filePath: string): TaskEither<Error, Option<string[]>> {
  return pipe(
    // packages:
    //   - "packages/**"
    //   - "components/**"
    //   - "!**/test/**"
    readYamlSafe<PnpmWorkspace>(filePath),
    mapTaskEither((pnpm: PnpmWorkspace) =>
      pipe(
        getIn<string[]>(['packages'], pnpm),
        filter(isArrayOfStrings),
        mapOption(addRootDir),
        mapOption(limitToPackageJson),
      ),
    ),
  );
}

function addRootDir(patterns: string[]): string[] {
  return [process.cwd(), ...patterns];
}

function limitToPackageJson(patterns: string[]): string[] {
  return patterns.map((pattern) => join(pattern, 'package.json'));
}
