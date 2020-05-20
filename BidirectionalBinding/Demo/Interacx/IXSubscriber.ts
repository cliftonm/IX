export class IXSubscriber {
    subscriber: (obj: any, oldVal: string, newVal: string) => void;

    constructor(subscriber: (obj: any, oldVal: string, newVal: string) => void) {
        this.subscriber = subscriber;
    }

    Invoke(obj: any, oldVal: string, newVal: string): void {
        this.subscriber(obj, oldVal, newVal);
    }
}
