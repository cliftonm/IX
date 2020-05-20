import { IXArrayProxy } from "./IXArrayProxy"
import { IXEvent } from "./IXEvent"

export class IX {
    private uiHandler = {
        get: (obj, prop) => {
            console.log(`GET: ${prop}`);
            return obj[prop];
        },

        set: (obj, prop, val) => {
            console.log(`SET: ${prop} to ${val}`);

            // Return true to accept change.  Note that we can implement a "BeforeChange" event call on the container if we want to add logic to accept the change.
            (document.getElementById(prop) as HTMLInputElement).value = val;
            obj[prop] = val;

            return true;
        }
    };

    public CreateProxy<T>(container: T): T {
        this.CreateArrayProxies(container);
        this.CreateHandlers(container);
        let target = new Proxy(container, this.uiHandler);

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
            let name = container[k].constructor.name;

            if (name == "Array") {
                // If container property is already proxied, don't proxy it again!
                if (container[k]._id != k) {
                    container[k] = IXArrayProxy.Create(k, container);
                }
            }
        });
    }

    private CreateHandlers<T>(container: T) {
        Object.keys(container).forEach(k => {
            let el = document.getElementById(k) as any;

            // If element exists and we haven't assigned a proxy to the container's field, then wire up the events.
            if (el && !el._proxy) {
                el._proxy = this;

                switch (el.nodeName) {
                    case "INPUT":
                        this.WireUpChangeHandler(el, container, "value", "change", "Changed");
                        break;
                }
            }
        });
/*
        Array
            .from(root.querySelectorAll('*[id]'))
            .filter(e => e.nodeName == nodeName)
            .forEach(e => {
                console.log(`Binding ${e.id}`);
                this.WireUpChangeHandler(document.getElementById(e.id) as HTMLElement, container, propertyName, eventName, handlerName);
            });
*/
    }

    private WireUpChangeHandler<T>(el: HTMLElement, container: T, propertyName: string, eventName: string, handlerName: string) {
        el.addEventListener(eventName, ev => {
            let el = ev.srcElement as HTMLElement;
            let oldVal = container[el.id];
            let newVal = el[propertyName];
            let propName = el.id;
            let ucPropName = propName.charAt(0).toUpperCase() + propName.slice(1);
            let eventName = `on${ucPropName}${handlerName}`;
            let changeHandler = container[eventName];


            if (changeHandler) {
                newVal = this.CustomConverter(container, ucPropName, newVal);
                container[propName] = newVal;
                (changeHandler as IXEvent).Invoke(newVal, container, oldVal);
            }
        });
    }

    private CustomConverter<T>(container: T, ucPropName: string, newVal: string): any {
        let converter = `onConvert${ucPropName}`;

        if (container[converter]) {
            newVal = container[converter](newVal);
        }

        return newVal;
    }
}
