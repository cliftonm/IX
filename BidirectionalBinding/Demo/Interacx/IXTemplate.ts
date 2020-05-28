export class IXTemplate {
    public _isTemplate: boolean = true;

    public value?: string;
    public id?: string;

    public static Create(t: any): IXTemplate {
        let template = new IXTemplate();
        template.value = t.value;
        template.id = t.id;

        return template;
    }
}

