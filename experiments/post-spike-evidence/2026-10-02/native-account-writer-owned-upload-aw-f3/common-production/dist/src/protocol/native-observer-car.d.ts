import { type AuthenticatedRepo } from './native-proof.ts';
/** No signing key or authenticated-root brand is minted by this byte owner. */
export declare class NativeObserverCar {
    #private;
    readonly root: string;
    constructor(raw: Uint8Array);
    addExact(raw: Uint8Array, requested: readonly string[]): void;
    bytes(): Promise<Uint8Array<ArrayBuffer>>;
    authenticate(principal: string, signingKeyDid: string): Promise<AuthenticatedRepo>;
}
//# sourceMappingURL=native-observer-car.d.ts.map