export class IXClassList {
    // Bizarre way of adding / removing classes, via property setters!
    // I guess that since this is transparent to the programmer, they shouldn't care about the implementation!
    add: string = "";
    remove: string = "";

    public Add(className: string): void {
        this.add = className;    
    }
}