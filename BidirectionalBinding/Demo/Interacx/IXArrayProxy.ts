﻿import { IXOption } from "./IXSelector"
import { IXTemplate } from "./IXTemplate"

export class IXArrayProxy {
    static Create(id: string, container: any): any {
        // let p = new Proxy(container[id], IXArrayProxy.ArrayChangeHandler);
        let p = new Proxy([], IXArrayProxy.ArrayChangeHandler);
        p._id = id;
        p._container = container;

        return p;
    }

    static ArrayChangeHandler = {
        get: function (obj, prop, receiver) {
            // return true for this special property, so we know that we're dealing with a ProxyArray object.
            if (prop == "_isProxy") {
                return true;
            }

            // Setup for push and pop, preserve state when the setter is called.
            // Very kludgy but I don't know of any other way to do this.
            if (prop == "push") {
                receiver._push = true;
            }

            if (prop == "pop") {
                receiver._pop = true;
            }

            if (prop == "length") {
                return obj[receiver._id].length;
            }

            // Prevent infinite recursion when logging.
            //if (prop != "_id") {
            //    console.log('getting ' + prop + ' for ' + receiver._id);
            //}

            return obj[prop];
        },

        set: function (obj, prop, val, receiver) {
            // we're looking for this pattern:
            // "setting 0 for someList with value Learn Javascript"
            let id = receiver._id;
            console.log('setting ' + prop + ' for ' + id + ' with value ' + val);

            if (prop == "length" && receiver._pop) {
                let el = document.getElementById(id);
                let len = obj[id].length;

                for (let i = val; i < len; i++) {
                    el.childNodes[val].remove();
                    obj[id].pop();
                }

                receiver._pop = false;
            } else {
                // We might be setting an array item, or we might be doing a push, in either case "prop" is the index value.
                if (!isNaN(prop)) {
                    let el = document.getElementById(id);
                    switch (el.nodeName) {
                        // TODO: "UL"!
                        case "OL": {
                            let n = Number(prop);
                            let ol = el as HTMLOListElement;

                            if (n < ol.childNodes.length && !receiver._push) {
                                // We are replacing a node
                                // innerText or innerHTML?
                                (ol.childNodes[n] as HTMLLIElement).innerText = val;
                            } else {
                                let li = document.createElement("li") as HTMLLIElement;
                                let v = val;

                                if (val._isTemplate) {
                                    let t = val as IXTemplate;
                                    // innerText or innerHTML?
                                    li.innerText = t.value;
                                    li.id = t.id;
                                    v = t.value;
                                } else {
                                    li.innerText = val;
                                }

                                (el as HTMLOListElement).append(li);
                                obj[id].push(v);
                                receiver._push = false;
                            }

                            break;
                        }

                        case "SELECT": {
                            let n = Number(prop);
                            let sel = el as HTMLSelectElement;

                            if (n < sel.childNodes.length && !receiver._push) {
                                // We are replacing a node
                                // innerText or innerHTML?
                                let opt = sel.childNodes[n] as HTMLOptionElement;
                                opt.value = val.value;
                                opt.text = val.text;
                            } else {
                                let opt = document.createElement("option") as HTMLOptionElement;
                                opt.value = val.value;
                                opt.text = val.text;
                                sel.append(opt);
                                obj[id].push(val);
                                receiver._push = false;
                            }

                            break;
                        }
                    }
                } else if (val.constructor.name == "Array") {
                    let el = document.getElementById(id);

                    // TODO: remove all child elements?

                    switch (el.nodeName) {
                        case "SELECT":
                            (val as IXOption[]).forEach(v => {
                                let opt = document.createElement("option") as HTMLOptionElement;
                                opt.innerText = v.text;
                                opt.value = String(v.value);
                                opt.disabled = v.disabled;
                                opt.selected = v.selected;
                                (el as HTMLSelectElement).append(opt);
                            });
                            break;

                        case "OL":
                        case "UL":
                            (val as []).forEach(v => {
                                let li = document.createElement("li") as HTMLLIElement;
                                li.innerText = v;
                                (el as HTMLOListElement).append(li);
                            });
                            break;
                    }
                }
            }

            // Whe an array is being set to the id, this initializes obj[prop] is equivalent to receiver[id]
            obj[prop] = val;

            return true;
        }
    };
}

