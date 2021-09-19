import { readFileSync } from 'fs-extra';
import { SyncpackConfig } from '../../constants';
import { getPatterns } from './get-patterns';

export interface Source {
  bugs?: { url: string } | string;
  dependencies?: { [key: string]: string };
  description?: string;
  devDependencies?: { [key: string]: string };
  keywords?: string[];
  name?: string;
  peerDependencies?: { [key: string]: string };
  repository?: { type: string; url: string } | string;
  resolutions?: { [key: string]: string };
  scripts?: { [key: string]: string };
  version?: string;
  workspaces?: string[] | { [key: string]: string[] };
  [otherProps: string]: string | string[] | { [key: string]: string | string[] } | undefined;
}

export interface SourceWrapper {
  /** the absolute path on disk to this package.json file */
  filePath: string;
  /** the parsed JSON contents of this package.json file */
  contents: Source;
  /** the raw file contents of this package.json file */
  json: string;
}

type Options = Pick<SyncpackConfig, 'source'>;

export function getWrappers(program: Options): SourceWrapper[] {
  return getPatterns(program).map(createWrapper);
}

function createWrapper(filePath: string): SourceWrapper {
  const json = readFileSync(filePath, { encoding: 'utf8' });
  return {
    contents: JSON.parse(json),
    filePath,
    json,
  };
}
