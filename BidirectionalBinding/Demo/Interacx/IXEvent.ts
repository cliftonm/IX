import { IXSubscriber } from "./IXSubscriber"

export class IXEvent {
    subscribers: IXSubscriber[] = [];

    // We probably only usually want the new value, followed by the container, folloed by the old value.
    Add(subscriber: (newVal: string, obj: any, oldVal: string) => void) : IXEvent {
        this.subscribers.push(new IXSubscriber(subscriber));

        return this;
    }

    Invoke(newVal: string, obj: any, oldVal: string): void {
        this.subscribers.forEach(s => s.Invoke(newVal, obj, oldVal));
    }
}
