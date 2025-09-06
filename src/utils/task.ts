export class Task<T> {
    isPending: boolean;
    private promise: Promise<T>;
    private resolver: Function;
    private rejecter: Function;

    constructor() {
        this.isPending = true;
        this.promise = new Promise<T>((resolve, reject) => {
            this.resolver = resolve;
            this.rejecter = reject;
        });
    }

    async wait() {
        return await this.promise;
    }

    success(param?: T) {
        this.isPending = false;
        this.resolver(param);
    }

    fail(param?: any) {
        this.isPending = false;
        this.rejecter(param);
    }
}
