import { IXClassList } from "../Interacx/IXClassList"

export class IXClassListProxy {
    static Create(id: string, container: {}): {} {
        let p = new Proxy(new IXClassList(), IXClassListProxy.AttributeChangeHandler);
        p._id = id;
        p._container = container;

        Object.keys(container).forEach(k => {
            p[k] = container[k];
        });

        return p;
    }

    static AttributeChangeHandler = {
        get: function (obj, prop, receiver) {
            // return true for this special property, so we know that we're dealing with a ProxyArray object.
            if (prop == "_isProxy") {
                return true;
            }

            let val = null;

            // Prevent infinite recursion when logging.
            if (prop != "_id" && prop != "_container") {
                console.log('getting ' + prop + ' for ' + receiver._id);
            } 

            val = obj[prop];

            return val;
        },

        set: function (obj, prop, val, receiver) {
            if (prop != "_id" && prop != "_container") {
                console.log('setting ' + prop + ' for ' + receiver._id + ' with value ' + val);
                let el = document.getElementById(receiver._id);

                if (el && val) {
                    switch (prop) {
                        case "add":
                            el.classList.add(val);
                            break;

                        case "remove":
                            el.classList.remove(val);
                            break;
                    }
                }
            } else {
                obj[prop] = val;
            }

            // Return true to accept change.  Note that we can implement a "BeforeChange" event call on the container if we want to add logic to accept the change.
            return true;
        }
    };
}

