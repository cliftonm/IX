import { IXSubscriber } from "./IXSubscriber"

export class IXEvent {
    subscribers: IXSubscriber[] = [];

    Add(subscriber: (obj: any, oldVal: string, newVal: string) => void) {
        this.subscribers.push(new IXSubscriber(subscriber));
    }

    Invoke(obj: any, oldVal: string, newVal: string): void {
        this.subscribers.forEach(s => s.Invoke(obj, oldVal, newVal));
    }
}
