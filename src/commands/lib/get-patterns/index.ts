import { isArrayOfStrings } from 'expect-more';
import { flatten, map as mapArray } from 'fp-ts/lib/Array';
import { match as matchEither, tryCatch } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import {
  chain as chainOption,
  filter as filterOption,
  match as matchOption,
  none,
  of as optionOf,
  Option,
} from 'fp-ts/lib/Option';
import { map as taskMap, of as taskOf, Task } from 'fp-ts/lib/Task';
import { getOrElse, orElse } from 'fp-ts/lib/TaskEither';
import { sync as globSync } from 'glob';
import { ALL_PATTERNS, CWD, SyncpackConfig } from '../../../constants';
import { getLernaPatterns } from './get-lerna-patterns';
import { getPnpmPatterns } from './get-pnpm-patterns';
import { getYarnPatterns } from './get-yarn-patterns';

type Options = Pick<SyncpackConfig, 'source'>;

export function getFiles(program: Options): Task<Option<string[]>> {
  return pipe(getPatterns(program), taskMap(chainOption(resolvePatterns)));
}

function getPatterns(program: Options): Task<Option<string[]>> {
  const rewrapPatternsFromCli = (patterns: string[]) => taskOf(optionOf(patterns));
  const revertToDefaults = () => optionOf(ALL_PATTERNS);
  const rewrapPatternsFromConfig = optionOf;
  return pipe(
    getPatternsFromCli(program),
    matchOption(getPatternsFromConfig, rewrapPatternsFromCli),
    taskMap(matchOption(revertToDefaults, rewrapPatternsFromConfig)),
  );
}

function getPatternsFromCli(program: Options): Option<string[]> {
  return pipe(optionOf(program.source), filterOption(isArrayOfStrings));
}

function getPatternsFromConfig(): Task<Option<string[]>> {
  return pipe(
    getYarnPatterns(),
    orElse(getPnpmPatterns),
    orElse(getLernaPatterns),
    getOrElse(() => taskOf<Option<string[]>>(none)),
  );
}

function resolvePatterns(patterns: string[]): Option<string[]> {
  const wrapResultInOption = optionOf;
  const swapErrorForNone = () => none;
  return pipe(
    tryCatch(
      () =>
        pipe(
          patterns,
          mapArray((pattern) => globSync(pattern, { absolute: true, cwd: CWD })),
          flatten,
        ),
      () => new Error(`Failed to resolve ${patterns}`),
    ),
    matchEither(swapErrorForNone, wrapResultInOption),
    filterOption(isArrayOfStrings),
  );
}

(async function run() {
  await getFiles({} as any)().then(console.log);
  await getFiles({ source: [] } as any)().then(console.log);
  await getFiles({ source: [1] } as any)().then(console.log);
  await getFiles({ source: ['package.json'] } as any)().then(console.log);
})();

// mapEither((v) => {
//   console.log('either', v);
//   return v;
// }),
// mapLeft((err) => {
//   console.log('left', err);
//   return err;
// }),
