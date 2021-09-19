import { Json, parse } from 'fp-ts/Json';
import { Either, mapLeft } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import { chain, fromEither, TaskEither, tryCatch } from 'fp-ts/TaskEither';
import { readFile } from 'fs-extra';

export function readJsonSafe(filePath: string): TaskEither<Error | SyntaxError, Json> {
  return pipe(
    readFileSafe(filePath),
    chain((json: string) => pipe(parseJsonSafe(json), fromEither)),
  );
}

function readFileSafe(filePath: string): TaskEither<Error, string> {
  return tryCatch(
    () => readFile(filePath, { encoding: 'utf8' }),
    () => new Error(`Failed to read JSON file at ${filePath}`),
  );
}

function parseJsonSafe(json: string): Either<SyntaxError, Json> {
  return pipe(
    parse(json),
    mapLeft((err) => err as SyntaxError),
  );
}
