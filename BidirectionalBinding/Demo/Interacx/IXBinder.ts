export interface IXIBind {
    [key: string]: any;
}

export class IXBinder {
    public binders: IXIBind[] = [];

    constructor(binder: IXIBind) {
        this.binders.push(binder);
    }

    public Add(binder: IXIBind): IXBinder {
        this.binders.push(binder);

        return this;
    }
}
