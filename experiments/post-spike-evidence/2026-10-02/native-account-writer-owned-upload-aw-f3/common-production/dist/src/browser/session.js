export function sameSession(a, b) {
    return !!a && !!b && a.app === b.app && a.genesis === b.genesis && a.definition === b.definition;
}
/** A page generation also distinguishes leaving and returning to the same app. */
export class SessionGeneration {
    generation = 0;
    begin() {
        return ++this.generation;
    }
    capture() {
        return this.generation;
    }
    current(generation) {
        return generation === this.generation;
    }
}
//# sourceMappingURL=session.js.map