// To host this with IIS, the IIS Hosting bundle must be installed:
// https://dotnet.microsoft.com/download/dotnet-core/thank-you/runtime-aspnetcore-2.1.3-windows-hosting-bundle-installer
// Read more: https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/?view=aspnetcore-3.1
// Also, the latest version of TypeScript must be installed: https://marketplace.visualstudio.com/items?itemName=TypeScriptTeam.typescript-351
// And modules in the web.config must be set to: modules="AspNetCoreModule"
// And the appropriate IIS APPPOOL must be added to the ServiceAccess users.

class ProxyArray<T> {
    _id: string;
    _container: any;

    Create(): T[] {
        let p = new Proxy([] as T[], this.ArrayChangeHandler);

        return p;
    }

    ArrayChangeHandler = {
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

class MainPage {
    // If we don't initialize the properties, we can't check if they are in the instance with container.hasOwnProperty("x");
    // Ideally, it's preferable to initialize the property to a value so that we're not wiring up change listeners to elements in which we're not interested for this container.
    // If we don't do this, the container gets a whole bunch of other properties we may not want when those elements change.
    firstName: string;
    lastName: string;
    list: string[] = new ProxyArray<string>().Create();

    OnFirstNameChanged(me, oldVal, newVal): void {
        alert(`was: ${oldVal} new: ${newVal} - ${me.tenantName}`);
    }

    OnLastNameChanged(me, oldVal, newVal): void {
        alert(`was: ${oldVal} new: ${newVal} - ${me.n}`);
    }
}

export class AppMain {
    public run() {
        let mainPage = this.WireUpElements(new MainPage());
        mainPage.firstName = "Marc";
        mainPage.lastName = "Clifton";

        mainPage.list.push("abc");
        mainPage.list.push("def");
        mainPage.list[1] = "DEF";
        mainPage.list.pop();

        // Observables is dead:
        // https://www.bitovi.com/blog/long-live-es6-proxies
        // https://esdiscuss.org/topic/an-update-on-object-observe
    }

    // Return "any" or interface T if you want intellisense, not "ProxyConstructor", otherwise we get "Property [x] does not exist on ProxyConstructor" error.
    private WireUpElements<T>(container: T): T {
        // update the UI with the container.field = 'some value';
        let uiHandler = {
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

        // Set the ID for the ProxyArray, as we cannot determine the ID in the getter/setter itself because 
        // the proxy is operating on the array, not the container's property of the array.
        Object.keys(container).forEach(k => {
            let name = container[k].constructor.name;

            if (name == "Array" && container[k]._isProxy) {
                container[k]._id = k;
                container[k]._container = container;
            }
        });

        let target = new Proxy(container, uiHandler);

        // Update the container when the field in the UI changes.

        // At the moment, just scan for all the "input" elements.
        Array.from(document.querySelectorAll('*[id]')).filter(e => e.nodeName == "INPUT").forEach(e => {
            (document.getElementById(e.id) as HTMLInputElement).addEventListener("change", ev => {
                let el = ev.srcElement as HTMLInputElement;
                let oldVal = container[el.id];
                let newVal = el.value;
                let propName = el.id;
                let ucPropName = propName.charAt(0).toUpperCase() + propName.slice(1);
                let eventName = `On${ucPropName}Changed`;
                let changeHandler = container[eventName];

                // Update the container
                container[propName] = newVal;

                if (changeHandler) {
                    changeHandler(container, oldVal, newVal);
                }
            });
        });

        return target;
    }
}
