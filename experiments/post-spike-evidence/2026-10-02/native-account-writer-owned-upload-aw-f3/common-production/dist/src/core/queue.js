/** Serialize work while allowing a rejected operation to be retried later. */
export class SerialQueue {
    tail = Promise.resolve();
    run(operation) {
        const result = this.tail.then(operation);
        this.tail = result.catch(() => { });
        return result;
    }
    async idle() {
        await this.tail;
    }
}
//# sourceMappingURL=queue.js.map