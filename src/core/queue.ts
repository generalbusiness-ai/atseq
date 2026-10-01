/** Serialize work while allowing a rejected operation to be retried later. */
export class SerialQueue {
  private tail: Promise<unknown> = Promise.resolve();
  run<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.tail.then(operation);
    this.tail = result.catch(() => {});
    return result;
  }
  async idle(): Promise<void> {
    await this.tail;
  }
}
