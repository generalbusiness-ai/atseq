import { Lexicons } from '@atproto/lexicon';
import { Folder } from '../src/application/folder.ts';
import { Schemas } from '../src/definition/schemas.ts';

export interface TimedCalls {
  calls: number;
  elapsedMs: number;
  failed: number;
}
export interface InterpretationObservation {
  actionValidation: TimedCalls;
  stateValidation: TimedCalls;
  otherValidation: TimedCalls;
  lexiconValidation: TimedCalls;
  foldRegion: TimedCalls;
  structuredClone: TimedCalls;
}
let observing = false;
const counter = (): TimedCalls => ({ calls: 0, elapsedMs: 0, failed: 0 });

/** Benchmark-only spans around the existing validator/copy methods. */
export async function observeInterpretation<T>(
  folder: Folder,
  run: () => Promise<T>,
): Promise<{ result: T; stages: InterpretationObservation }> {
  if (observing) throw new Error('Interpretation measurements must run in isolation');
  observing = true;
  const stages: InterpretationObservation = {
    actionValidation: counter(),
    stateValidation: counter(),
    otherValidation: counter(),
    lexiconValidation: counter(),
    foldRegion: counter(),
    structuredClone: counter(),
  };
  const restores: (() => void)[] = [];
  let actionFinished: number | undefined;
  const schemas = folder.activeDefinition().schemas;
  const stateRef = folder.activeDefinition().manifest.state.ref;
  const actions = new Set(folder.activeDefinition().manifest.actions.map((action) => action.ref));
  function replace(object: object, name: string, replacement: unknown) {
    const descriptor = Object.getOwnPropertyDescriptor(object, name);
    Object.defineProperty(object, name, { configurable: true, writable: true, value: replacement });
    restores.push(() =>
      descriptor ? Object.defineProperty(object, name, descriptor) : Reflect.deleteProperty(object, name),
    );
  }
  function measure<R>(span: TimedCalls, operation: () => R): R {
    const started = performance.now();
    span.calls++;
    try {
      return operation();
    } catch (error) {
      span.failed++;
      throw error;
    } finally {
      span.elapsedMs += performance.now() - started;
    }
  }
  try {
    const validate = Schemas.prototype.validate;
    replace(Schemas.prototype, 'validate', function (this: Schemas, ref: string, value: unknown) {
      const relevant = this === schemas;
      const action = relevant && actions.has(ref);
      const state = relevant && ref === stateRef;
      if (state && actionFinished !== undefined) {
        stages.foldRegion.calls++;
        stages.foldRegion.elapsedMs += performance.now() - actionFinished;
        actionFinished = undefined;
      }
      // An ineffective fold does not reach state validation. Do not attribute
      // the time between two different actions to a successful fold region.
      if (action) actionFinished = undefined;
      const result = measure(
        action ? stages.actionValidation : state ? stages.stateValidation : stages.otherValidation,
        () => Reflect.apply(validate, this, [ref, value]),
      );
      if (action) actionFinished = performance.now();
      return result;
    });
    const lexiconValidate = Lexicons.prototype.validate;
    replace(Lexicons.prototype, 'validate', function (this: Lexicons, ...args: unknown[]) {
      return measure(stages.lexiconValidation, () => Reflect.apply(lexiconValidate, this, args));
    });
    const clone = globalThis.structuredClone;
    replace(globalThis, 'structuredClone', (...args: Parameters<typeof structuredClone>) =>
      measure(stages.structuredClone, () => Reflect.apply(clone, globalThis, args)),
    );
    return { result: await run(), stages };
  } finally {
    for (const restore of restores.reverse()) restore();
    observing = false;
  }
}
