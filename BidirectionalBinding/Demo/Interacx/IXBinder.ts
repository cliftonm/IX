export interface IXBind {
    bindFrom: string;
    attribute?: string;
    op?: (v: string) => string;
}

export class IXBinder {
    public binders: IXBind[] = [];
    public asArray: boolean;
    public arrayOp: (v: string[]) => string;

    public static AsArray(op: (v: string[]) => string): IXBinder {
        let ix = new IXBinder();
        ix.asArray = true;
        ix.arrayOp = op;

        return ix;
    }

    // Can't do real overloaded constructors.  Very annoying.
    constructor(binder?: IXBind) {
        if (binder) {
            this.binders.push(binder);
        }
    }

    public Add(binder: IXBind): IXBinder {
        this.binders.push(binder);

        return this;
    }
}
