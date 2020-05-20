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

    // Return "any" or interface T if you want intellisense, not "ProxyConstructor", otherwise we get "Property [x] does not exist on ProxyConstructor" error.
    public CreateProxy<T>(container: T, root: HTMLElement): T {
        // update the UI with the container.field = 'some value';

        this.CreateArrayProxies(container);
        this.CreateHandlers(container, root, "INPUT", "value", "change", "Changed");
        let target = new Proxy(container, this.uiHandler);

        return target;
    }

    private CreateArrayProxies<T>(container: T): void {
        // Set the ID for the ProxyArray, as we cannot determine the ID in the getter/setter itself because 
        // the proxy is operating on the array, not the container's property of the array.
        Object.keys(container).forEach(k => {
            let name = container[k].constructor.name;

            if (name == "Array") {
                container[k] = IXArrayProxy.Create(k, container);
            }
        });
    }

    private CreateHandlers<T>(container: T, root: HTMLElement, nodeName: string, propertyName: string, eventName: string, handlerName: string) {
        // At the moment, just scan for all the "input" elements.
        Array
            .from(root.querySelectorAll('*[id]'))
            .filter(e => e.nodeName == nodeName)
            .forEach(e => {
                console.log(`Binding ${e.id}`);
                this.WireUpChangeHandler(document.getElementById(e.id) as HTMLElement, container, propertyName, eventName, handlerName);
            });
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

            // Update the container
            container[propName] = newVal;

            if (changeHandler) {
                (changeHandler as IXEvent).Invoke(container, oldVal, newVal);
            }
        });
    }
}
