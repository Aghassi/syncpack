import { isArrayOfStrings } from 'expect-more';
import { pipe } from 'fp-ts/lib/function';
import { fromNullable, filter, some, Option } from 'fp-ts/lib/Option';
import { TaskEither, map } from 'fp-ts/lib/TaskEither';
import { sync } from 'glob';
import { join } from 'path';
import { ALL_PATTERNS, SyncpackConfig } from '../../../constants';
import { getLernaPatterns } from './get-lerna-patterns';
import { getPnpmPatterns } from './get-pnpm-patterns';
import { getYarnPatterns } from './get-yarn-patterns';

type Options = Pick<SyncpackConfig, 'source'>;

export async function getPatterns(program: Options): Promise<string[]> {
  if (isArrayOfStrings(program.source)) return program.source;
  const cwd = process.cwd();
  const configFiles: Array<TaskEither<Error, Option<string[]>>> = [
    getYarnPatterns(join(cwd, 'package.json')), //
    getPnpmPatterns(join(cwd, 'pnpm-workspace.yaml')),
    getLernaPatterns(join(cwd, 'lerna.json')),
  ];
  for (const configFile of configFiles) {
    const value = await configFile();
    console.log(value);
    // @TODO: flatMap resolvePattern
  }
  return ALL_PATTERNS;
}

function resolvePattern(pattern: string): string[] {
  return sync(pattern, { absolute: true });
}

function reduceFlatArray(all: string[], next: string[]): string[] {
  return all.concat(next);
}

getPatterns({} as any).then(console.log);
