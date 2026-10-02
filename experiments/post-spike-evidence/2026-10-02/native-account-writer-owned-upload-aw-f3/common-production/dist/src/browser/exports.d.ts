import { type ChartSource } from '../archive/chart.ts';
import type { AppSnapshot } from './protocol.ts';
import type { AppSession } from './session.ts';
import type { Evaluator } from './evaluator.ts';
export declare function archivePanel(snapshot: AppSnapshot, binding: AppSession, evaluator: Evaluator, visible: () => boolean, tell: (message: string) => void, failure: (error: unknown) => void): HTMLElement;
export declare function queryExport(value: unknown, source: ChartSource, visible: () => boolean, failure: (error: unknown) => void): HTMLDivElement;
//# sourceMappingURL=exports.d.ts.map