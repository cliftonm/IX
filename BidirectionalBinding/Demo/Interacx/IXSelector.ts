export class IXOption {
    public text: string;
    public disabled?: boolean = false;
    public selected?: boolean = false;
    public value?: string | number;
}

export class IXSelector {
    public _element: HTMLSelectElement;
    private val: string | number;
    private txt: string;

    // List of options if set programmatically.
    public options: IXOption[] = [];

    public Add(option: IXOption): IXSelector {
        this.options.push(option);

        return this;
    }

    // Because we know the exact property names, we only need to implement getters & setters for "value" and "text"

    get value() {
        return this.val;
    }

    get text() {
        return this.txt;
    }

    set value(v: string | number) {
        let el = this._element;
        let oldVal = el.value;
        this.val = v;
        el.value = String(v);

        if (oldVal != v) {
            el.dispatchEvent(new Event('change'));
        }
    }

    set text(t: string) {
        this.txt = t;
        let el = this._element;
        let oldVal = el.value;

        for (let i = 0; i < el.options.length; i++) {
            if (el.options[i].text == t) {
                let newVal = el.options[i].value;

                if (oldVal != newVal) {
                    this.value = newVal;
                }

                break;
            }
        }
    }
}
