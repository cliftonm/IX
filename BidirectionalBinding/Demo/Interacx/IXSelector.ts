export class IXOption {
    public text: string;
    public disabled?: boolean = false;
    public selected?: boolean = false;
    public value?: string | number;
}

export class IXSelector {
    // The current selection text and value:
    public text: string;
    public value: string | number;

    // List of options if set programmatically.
    public options: IXOption[] = [];

    public Add(option: IXOption): IXSelector {
        this.options.push(option);

        return this;
    }
}
