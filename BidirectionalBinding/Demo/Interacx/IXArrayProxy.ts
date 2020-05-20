export class IXArrayProxy {
    static Create(id: string, container: any): [] {
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

            // Prevent infinite recursion when logging.
            if (prop != "_id") {
                console.log('getting ' + prop + ' for ' + receiver._id);
            }

            return obj[prop];
        },
        set: function (obj, prop, val, receiver) {
            if (prop == "length") {
                console.log(`Current length = ${obj[prop]}`);
            }

            console.log('setting ' + prop + ' for ' + receiver._id + ' with value ' + val);

            // Return true to accept change.  Note that we can implement a "BeforeChange" event call on the container if we want to add logic to accept the change.
            obj[prop] = val;

            return true;
        }
    };
}

