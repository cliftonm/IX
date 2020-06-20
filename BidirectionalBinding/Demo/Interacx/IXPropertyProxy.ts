export class IXPropertyProxy {
    static Create(id: string, propName: string, container: {}): {} {
        let p = new Proxy({}, IXPropertyProxy.ValueChangedHandler);
        p._id = id;
        p._propName = propName;
        p._container = container;

        Object.keys(container).forEach(k => {
            p[k] = container[k];
        });

        return p;
    }

    static ValueChangedHandler = {
        get: function (obj, prop, receiver) {
            // return true for this special property, so we know that we're dealing with a ProxyProperty object.
            if (prop == "_isProxy") {
                return true;
            }

            let val = obj[prop];

            return val;
        },

        set: function (obj, prop, val, receiver) {
            if (prop != "_id" && prop != "_container") {
                console.log('setting ' + prop + ' for ' + receiver._id + ' with value ' + val);
                let el = document.getElementById(receiver._id);

                if (el) {
                    console.log("Implement!");
                }
            } else {
                obj[prop] = val;
            }

            // Return true to accept change.  Note that we can implement a "BeforeChange" event call on the container if we want to add logic to accept the change.
            return true;
        }
    };
}

