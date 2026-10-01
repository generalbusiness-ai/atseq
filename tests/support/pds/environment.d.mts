export interface TestEnvironment {
  dir: string;
  url: string;
  credentials: { adminPassword: string; jwtSecret: string };
  start(): Promise<void>;
  stop(signal?: NodeJS.Signals): Promise<void>;
  close(): Promise<void>;
}
export function startEnvironment(): Promise<TestEnvironment>;
export function assertDisposable(dir: string): Promise<string>;
export function resetDisposable(dir: string): Promise<void>;
