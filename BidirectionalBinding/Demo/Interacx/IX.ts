import { IXArrayProxy } from "./IXArrayProxy"
import { IXAttributeProxy } from "./IXAttributeProxy"
import { IXBind } from "./IXBinder"
import { IXBinder } from "./IXBinder"
import { IXClassListProxy } from "./IXClassListProxy"
import { IXEvent } from "./IXEvent"
import { IXSelector } from "./IXSelector"


export class IX {
    // TODO: We might want to break apart the uiHandler to specific getter/setters based on the UI element to get rid of the switch statement.
    private static uiHandler = {
        get: (obj, prop) => {
            console.log(`GET: ${prop}`);
            return obj[prop];
        },

        set: (obj, prop, val) => {
            console.log(`SET: ${prop} to ${val.toString()}`);

            let el = document.getElementById(prop);

            if (!el) {
                console.log(`${prop} not found!.`);
            } else {
                switch (el.nodeName) {
                    case "DIV":
                    case "P":
                    case "LABEL":
                    case "SPAN":
                        (el as HTMLElement).innerHTML = val;
                        break;

                    case "INPUT":
                        let typeAttr = el.getAttribute("type");
                        // Limited support at the moment.
                        if (typeAttr == "checkbox" || typeAttr == "radio") {

                            let oldValue = (el as HTMLInputElement).checked;

                            if (oldValue != val) {
                                console.log(`INPUT => old value: "${oldValue}" new value: "${val}"`);
                                (el as HTMLInputElement).checked = val;
                                el.dispatchEvent(new Event('click'));
                            }
                        } else {
                            let oldValue = (el as HTMLInputElement).value;

                            if (oldValue != val) {
                                console.log(`INPUT => old value: "${oldValue}" new value: "${val}"`);
                                (el as HTMLInputElement).value = val;
                                el.dispatchEvent(new Event('changed'));
                            }
                        }

                        break;

                    case "OL":
                        // We expect an array.
                        if (val.constructor?.name == "Array") {
                            // Remove the list elements as we're replacing them with a new array.
                            let ol = el as HTMLOListElement;

                            while (ol.firstChild) {
                                ol.removeChild(ol.firstChild);
                            }

                            (val as []).forEach(v => obj[prop].push(v));
                        }

                        break;

                    // Why didn't they have HTMLOListElement and HTMLUListElement derive from an HTMLListElement interface?
                    case "UL":
                        // We expect an array.
                        if (val.constructor?.name == "Array") {
                            // Remove the list elements as we're replacing them with a new array.
                            let ul = el as HTMLUListElement;

                            while (ul.firstChild) {
                                ul.removeChild(ul.firstChild);
                            }

                            (val as []).forEach(v => obj[prop].push(v));
                        }

                        break;

                    // debugging, to see if this ever happens.
                    case "SELECT":
                        console.log("set SELECT!");

                        break;
                }
            }

            obj[prop] = val;

            // Return true to accept change.  Note that we can implement a "BeforeChange" event call on the container if we want to add logic to accept the change.
            return true;
        }
    };

    public static CreateProxy<T>(container: T): T {
        let proxy = new Proxy(container, IX.uiHandler);
        // IX.CreateArrayProxies(container, proxy);
        IX.CreatePropertyHandlers(container, proxy);
        IX.CreateButtonHandlers(container, proxy);
        IX.CreateBinders(container, proxy);
        IX.Initialize(container, proxy);

        return proxy;
    }

    public static CreateNullProxy(): any {
        let proxy = new Proxy({}, IX.uiHandler);

        return proxy;
    }

    // For clarity that we're updating the proxy with container properties that now have values.
    public static UpdateProxy<T>(container: T): T {
        IX.CreateProxy(container);

        return container;
    }

    private static Initialize<T>(container: T, proxy: T): void {
        Object.keys(container).forEach(k => {
            let name = container[k].constructor?.name;

            switch (name) {
                case "String":
                case "Number":
                case "Boolean":
                case "BigInt":
                    proxy[k] = container[k];        // Force the proxy to handle the initial value.

                    break;

                case "Array":
                    // Special handling of arrays that have an initial set of elements so we don't duplicate the elements.
                    // At this point, container[k] IS the proxy (IXArrayProxy) so we have the issue that the proxy is set to 
                    // the array but the UI elements haven't been created.  If we just do: 
                    // proxy[k] = container[k];   
                    // This will initialize the UI list but push duplicates of the into the array.

                    // So, for arrays, we want to create the array proxy as an empty array during initialization instead,
                    // then set the empty proxy to the container, then the container to the proxy.
                    if (container[k]._id != k) {
                        let newProxy = IXArrayProxy.Create(k, container);
                        newProxy[k] = container[k];
                        container[k] = newProxy;
                    }

                    break;

                case "IXSelector":
                    // Similar to "Array" above, except we are proxying the IXSelector.options array, not the container itself.
                    if (container[k]._id != k) {
                        // Set the element that this IXSelector manages so we know what to do when value and text are assigned.
                        container[k]._element = document.getElementById(k);
                        let selector = container[k] as IXSelector;

                        // Proxy the options array so we can initialize it as well as push/pop.
                        if (selector.options.length > 0) {
                            let newProxy = IXArrayProxy.Create(k, container);
                            newProxy[k] = selector.options;
                            selector.options = newProxy;
                        }
                    }

                    break;
            }
        });
    }

    public static nameof<TResult>(name: () => TResult): string {
        let ret = IX.RightOf(name.toString(), ".");

        return ret;
    }

/*
    private static CreateArrayProxies<T>(container: T, proxy: T): void {
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
*/

    // We assume binders are created on input elements.  Probably not a great assumption.
    private static CreateBinders<T>(container: T, proxy: T): void {
        Object.keys(container).forEach(k => {

            if (container[k].binders?.length ?? 0 > 0) {
                let binderContainer = container[k] as IXBinder;
                let binders = binderContainer.binders as IXBind[];

                if (binderContainer.asArray) {
                    binders.forEach(b => {
                        let elName = b.bindFrom;
                        let el = document.getElementById(elName);

                        let typeAttr = el.getAttribute("type");

                        // Limited support at the moment.
                        if (typeAttr == "checkbox" || typeAttr == "radio") {
                            el.addEventListener("click", ev => {
                                let values: string[] = [];

                                // Get all the items currently checked
                                binders.forEach(binderItem => {
                                    let boundElement = (document.getElementById(binderItem.bindFrom) as HTMLInputElement);
                                    let checked = boundElement.checked;

                                    if (checked) {
                                        values.push(boundElement[binderItem.attribute]);
                                    }
                                });

                                let ret = binderContainer.arrayOp(values);
                                proxy[k] = ret;
                            });
                        }
                    });
                } else {
                    binders.forEach(b => {
                        let elName = b.bindFrom;
                        let el = document.getElementById(elName);
                        console.log(`Binding receiver ${k} to sender ${elName}`);

                        let typeAttr = el.getAttribute("type");

                        if (typeAttr == "checkbox" || typeAttr == "radio") {
                            el.addEventListener("click", ev => {
                                let boundAttr = b.attribute ?? "checked";
                                let v = String((ev.currentTarget as HTMLInputElement)[boundAttr]);
                                v = b.op === undefined ? v : b.op(v);
                                proxy[k] = v;
                            });
                        } else {
                            // Realtime typing
                            el.addEventListener("keyup", ev => {
                                let v = (ev.currentTarget as HTMLInputElement).value;
                                // proxy[elName] = v;    --- why?
                                v = b.op === undefined ? v : b.op(v);
                                proxy[k] = v;
                            });

                            // Lost focus, or called when value is set programmatically in the proxy setter.
                            el.addEventListener("changed", ev => {
                                let v = (ev.currentTarget as HTMLInputElement).value;
                                v = b.op === undefined ? v : b.op(v);
                                proxy[k] = v;
                            });
                        }
                    });
                }
            }
        });
    }

    private static CreatePropertyHandlers<T>(container: T, proxy: T) {
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

                if (container[k].classList) {
                    console.log(`Creating proxy for classList ${k}`);
                    container[k].classList = IXClassListProxy.Create(k, container[k].classList);
                }

                //if (container[k].title) {
                //    // mouse over title event
                //    el.addEventListener("mouseover", _ => el.setAttribute("title", container[k].title()));
                //}

                let idName = IX.UpperCaseFirstChar(el.id);
                
                // TODO: create a dictionary to handle this.
                let changedEvent = `on${idName}Changed`;
                let hoverEvent = `on${idName}Hover`;
                let keyUpEvent = `on${idName}KeyUp`;

                if (container[hoverEvent]) {
                    IX.WireUpEventHandler(el, container, proxy, null, "mouseover", hoverEvent);
                }

                // Change event is always wired up so we set the container's value when the UI element value changes.
                switch (el.nodeName) {
                    case "SELECT":
                    case "INPUT":
                        // TODO: If this is a button type, then what?
                        IX.WireUpEventHandler(el, container, proxy, "value", "change", changedEvent);
                        break;
                }

                if (container[keyUpEvent]) {
                    switch (el.nodeName) {
                        case "INPUT":
                            // TODO: If this is a button type, then what?
                            IX.WireUpEventHandler(el, container, proxy, "value", "keyup", keyUpEvent);
                            break;
                    }
                }
            }
        });
    }

    private static CreateButtonHandlers<T>(container: T, proxy: T) {
        Object.keys(container).forEach(k => {
            if (k.startsWith("on") && k.endsWith("Clicked")) {
                let elName = IX.LeftOf(IX.LowerCaseFirstChar(k.substring(2)), "Clicked");
                let el = document.getElementById(elName);
                let anonEl = el as any;

                if (el) {
                    if (!anonEl._proxy) {
                        anonEl._proxy = this;
                    }

                    if (!anonEl._clickEventWiredUp) {
                        anonEl._clickEventWiredUp = true;

                        switch (el.nodeName) {
                            case "BUTTON":
                                IX.WireUpEventHandler(el, container, proxy, null, "click", k);
                                break;

                            case "INPUT":
                                // sort of not necessary to test type but a good idea, especially for checkboxes and radio buttons.
                                let typeAttr = el.getAttribute("type");

                                if (typeAttr == "checkbox" || typeAttr == "radio") {
                                    IX.WireUpEventHandler(el, container, proxy, "checked", "click", k);
                                } else {
                                    IX.WireUpEventHandler(el, container, proxy, null, "click", k);
                                }

                                break;
                        }
                    }
                }
            }
        });
    }

    private static WireUpEventHandler<T>(el: HTMLElement, container: T, proxy: T, propertyName: string, eventName: string, handlerName: string) {
        el.addEventListener(eventName, ev => {
            let el = ev.srcElement as HTMLElement;
            let oldVal = undefined;
            let newVal = undefined;
            let propName = undefined;
            let handler = container[handlerName];

            switch (el.nodeName) {
                case "SELECT":
                    let elSelector = el as HTMLSelectElement;
                    let selector = container[el.id] as IXSelector;
                    selector.value = elSelector.value;
                    selector.text = elSelector.options[elSelector.selectedIndex].text;
                    break;

                default:
                    // buttons are click events, not change properties.
                    if (propertyName) {
                        oldVal = container[el.id];
                        newVal = el[propertyName];
                        propName = el.id;
                    }

                    let ucPropName = IX.UpperCaseFirstChar(propName ?? "");

                    if (propertyName) {
                        newVal = IX.CustomConverter(proxy, ucPropName, newVal);
                        container[propName] = newVal;
                    }

                    break;
            }

            if (handler) {
                (handler as IXEvent).Invoke(newVal, proxy, oldVal);
            }
        });
    }

    private static CustomConverter<T>(container: T, ucPropName: string, newVal: string): any {
        let converter = `onConvert${ucPropName}`;

        if (container[converter]) {
            newVal = container[converter](newVal);
        }

        return newVal;
    }

    // Helpers

    public static LeftOf(s: string, search: string): string {
        return s.substring(0, s.indexOf(search));
    }

    public static RightOf(s: string, search: string): string {
        return s.substring(s.indexOf(search) + 1);
    }

    public static LowerCaseFirstChar(s: string): string {
        return s.charAt(0).toLowerCase() + s.slice(1);
    }

    public static UpperCaseFirstChar(s: string): string {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }
}
