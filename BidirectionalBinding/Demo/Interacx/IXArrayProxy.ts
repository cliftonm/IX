export class IXArrayProxy {
    static Create(id: string, container: any): any {
        let p = new Proxy(container[id], IXArrayProxy.ArrayChangeHandler);
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
            // we're looking for this pattern:
            // "setting 0 for someList with value Learn Javascript"
            console.log('setting ' + prop + ' for ' + receiver._id + ' with value ' + val);

            if (!isNaN(prop)) {
                let el = document.getElementById(receiver._id);

                switch (el.nodeName) {
                    case "OL":
                        let li = document.createElement("li") as HTMLLIElement;
                        li.innerText = val;
                        (el as HTMLOListElement).append(li);
                        break;
                }
            }

            // Return true to accept change.  Note that we can implement a "BeforeChange" event call on the container if we want to add logic to accept the change.
            obj[prop] = val;

            return true;
        }
    };
}

