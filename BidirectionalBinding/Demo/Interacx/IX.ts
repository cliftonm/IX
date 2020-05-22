import { IXArrayProxy } from "./IXArrayProxy"
import { IXAttributeProxy } from "./IXAttributeProxy"
import { IXEvent } from "./IXEvent"

export class IX {
    private uiHandler = {
        get: (obj, prop) => {
            console.log(`GET: ${prop}`);
            return obj[prop];
        },

        set: (obj, prop, val) => {
            console.log(`SET: ${prop} to ${val}`);

            let el = document.getElementById(prop);

            switch (el.nodeName) {
                case "DIV":
                    (el as HTMLDivElement).innerHTML = val;
                    break;

                case "INPUT":
                    (el as HTMLInputElement).value = val;
                    break;
            }

            obj[prop] = val;

            // Return true to accept change.  Note that we can implement a "BeforeChange" event call on the container if we want to add logic to accept the change.
            return true;
        }
    };

    public CreateProxy<T>(container: T): T {
        this.CreateArrayProxies(container);
        this.CreatePropertyHandlers(container);
        this.CreateButtonHandlers(container);
        let target = new Proxy(container, this.uiHandler);

        return target;
    }

    public CreateNullProxy(): any {
        let target = new Proxy({}, this.uiHandler);

        return target;
    }

    // For clarity that we're updating the proxy with container properties that now have values.
    public UpdateProxy<T>(container: T): T {
        this.CreateProxy(container);

        return container;
    }

    private CreateArrayProxies<T>(container: T): void {
        // Set the ID for the ProxyArray, as we cannot determine the ID in the getter/setter itself because 
        // the proxy is operating on the array, not the container's property of the array.
        Object.keys(container).forEach(k => {
            let name = container[k].constructor?.name;

            if (name == "Array") {
                // If container property is already proxied, don't proxy it again!
                if (container[k]._id != k) {
                    container[k] = IXArrayProxy.Create(k, container);
                }
            }
        });
    }

    private CreatePropertyHandlers<T>(container: T) {
        Object.keys(container).forEach(k => {
            let el = document.getElementById(k);
            let anonEl = el as any;

            // If element exists and we haven't assigned a proxy to the container's field, then wire up the events.
            if (el && !anonEl._proxy) {
                anonEl._proxy = this;

                if (container[k].attr) {
                    // Proxy the attributes of the container so we can intercept the setter for attributes
                    console.log(`Creating proxy for attr ${k}`);
                    container[k].attr = IXAttributeProxy.Create(k, container[k].attr);
                }

                //if (container[k].title) {
                //    // mouse over title event
                //    el.addEventListener("mouseover", _ => el.setAttribute("title", container[k].title()));
                //}

                let idName = this.UpperCaseFirstChar(el.id);
                let changedEvent = `on${idName}Changed`;
                let hoverEvent = `on${idName}Hover`;

                if (container[hoverEvent]) {
                    this.WireUpEventHandler(el, container, null, "mouseover", hoverEvent);
                }

                if (container[changedEvent]) {
                    switch (el.nodeName) {
                        case "INPUT":
                            // TODO: If this is a button type, then what?
                            this.WireUpEventHandler(el, container, "value", "change", changedEvent);
                            break;
                    }
                }
            }
        });
    }

    private CreateButtonHandlers<T>(container: T) {
        Object.keys(container).forEach(k => {
            if (k.startsWith("on") && k.endsWith("Clicked")) {
                let elName = this.LeftOf(this.LowerCaseFirstChar(k.substring(2)), "Clicked");
                let el = document.getElementById(elName);
                let anonEl = el as any;

                if (el && !anonEl._proxy) {
                    anonEl._proxy = this;

                    switch (el.nodeName) {
                        case "BUTTON":
                            this.WireUpEventHandler(el, container, null, "click", k);
                            break;

                        case "INPUT":
                            // sort of not necessary to test type but a good idea, especially for checkboxes and radio buttons.
                            if (el.getAttribute("type") == "button") {
                                this.WireUpEventHandler(el, container, null, "click", k);
                            }
                            break;
                    }
                }
            }
        });
    }

    private WireUpEventHandler<T>(el: HTMLElement, container: T, propertyName: string, eventName: string, handlerName: string) {
        el.addEventListener(eventName, ev => {
            let el = ev.srcElement as HTMLElement;
            let oldVal = undefined;
            let newVal = undefined;
            let propName = undefined;

            // buttons are click events, not change properties.
            if (propertyName) {
                oldVal = container[el.id];
                newVal = el[propertyName];
                propName = el.id;
            }

            let ucPropName = this.UpperCaseFirstChar(propName ?? "");
            // let eventName = `on${ucPropName}${handlerName}`;
            // let eventName = `on${handlerName}`;
            let handler = container[handlerName];

            if (handler) {
                if (propertyName) {
                    newVal = this.CustomConverter(container, ucPropName, newVal);
                    container[propName] = newVal;
                }

                (handler as IXEvent).Invoke(newVal, container, oldVal);
            }
        });
    }

    private LeftOf(s: string, search: string): string {
        return s.substring(0, s.indexOf(search));
    }

    private LowerCaseFirstChar(s: string): string {
        return s.charAt(0).toLowerCase() + s.slice(1);
    }

    private UpperCaseFirstChar(s: string): string {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    private CustomConverter<T>(container: T, ucPropName: string, newVal: string): any {
        let converter = `onConvert${ucPropName}`;

        if (container[converter]) {
            newVal = container[converter](newVal);
        }

        return newVal;
    }
}
