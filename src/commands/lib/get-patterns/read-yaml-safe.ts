import { TaskEither, tryCatch } from 'fp-ts/TaskEither';
import readYamlFile from 'read-yaml-file';

export function readYamlSafe<T = unknown>(filePath: string): TaskEither<Error, T> {
  return tryCatch(
    () => readYamlFile<T>(filePath),
    () => new Error(`Failed to read YAML file at ${filePath}`),
  );
}
