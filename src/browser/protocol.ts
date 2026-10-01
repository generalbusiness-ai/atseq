import type { RetainedInput, importArchive } from '../archive/archive.ts';
import type { Folder, Projection } from '../application/folder.ts';
import type { Genesis, Head, Intent, Invitation } from '../protocol/log.ts';
import type { Json } from '../core/values.ts';
import type { previewSource } from '../client/definition.ts';
import type { DefinitionInfo } from '../client/definition.ts';
import type { ViewNode } from '../view/inlay.ts';
import type { AppSession } from './session.ts';
export type Preview = Awaited<ReturnType<typeof previewSource>>;
export type AppSnapshot = ReturnType<Folder['snapshot']> & {
  genesis: Genesis;
  definition: DefinitionInfo;
  session: AppSession;
};
export interface Comparison {
  current: DefinitionInfo;
  candidate: DefinitionInfo;
  closure: string[];
  statePreserved: boolean;
  replayPassed: boolean;
  frontier: Projection['frontier'];
}
export interface Operations {
  preview: {
    args: { source: number[] | Uint8Array; action?: string; payload?: Record<string, Json>; state?: Json };
    result: Preview;
  };
  sync: { args: { session: AppSession; input: RetainedInput }; result: AppSnapshot };
  exportArchive: { args: { session: AppSession; position?: number }; result: { bytes: Uint8Array; head: Head } };
  importArchive: {
    args: { source: Uint8Array; expected: Invitation[] };
    result: {
      input: RetainedInput;
      projection: Projection;
      retries: Awaited<ReturnType<typeof importArchive>>['retries'];
    };
  };
  compareDefinition: { args: { session: AppSession; source: number[]; expected: string }; result: Comparison };
  previewPending: {
    args: { session: AppSession; intents: Intent[] };
    result: { state: Json; outcomes: unknown[]; basedOn: Projection['frontier'] };
  };
  validateAction: { args: { session: AppSession; action: string; payload: Record<string, Json> }; result: boolean };
  query: {
    args: { session: AppSession; name: string; params: Record<string, Json> };
    result: Awaited<ReturnType<Folder['query']>>;
  };
  view: { args: { session: AppSession; name: string; params?: Record<string, Json> }; result: ViewNode[] };
  reset: { args: Record<string, never>; result: boolean };
}
export type WorkerRequest = {
  [K in keyof Operations]: { id: number; kind: K } & Operations[K]['args'];
}[keyof Operations];
export type WorkerReply = { id: number } & (
  { result: unknown; error?: never } | { result?: never; error: { code: string; message: string } }
);
