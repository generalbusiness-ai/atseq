import type { Invitation } from '../protocol/log.ts';
export interface AppSession extends Invitation {
  definition: string;
}
export function sameSession(a: AppSession | undefined, b: AppSession | undefined) {
  return !!a && !!b && a.app === b.app && a.genesis === b.genesis && a.definition === b.definition;
}
/** A page generation also distinguishes leaving and returning to the same app. */
export class SessionGeneration {
  private generation = 0;
  begin() {
    return ++this.generation;
  }
  capture() {
    return this.generation;
  }
  current(generation: number) {
    return generation === this.generation;
  }
}
