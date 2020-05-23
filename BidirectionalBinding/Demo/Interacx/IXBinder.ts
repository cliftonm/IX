export interface IXBind {
    bindFrom: string;
    op?: (v: string) => string;
}

export class IXBinder {
    public binders: IXBind[] = [];

    constructor(binder: IXBind) {
        this.binders.push(binder);
    }

    public Add(binder: IXBind): IXBinder {
        this.binders.push(binder);

        return this;
    }
}
