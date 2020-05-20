// To host this with IIS, the IIS Hosting bundle must be installed:
// https://dotnet.microsoft.com/download/dotnet-core/thank-you/runtime-aspnetcore-2.1.3-windows-hosting-bundle-installer
// Read more: https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/?view=aspnetcore-3.1
// Also, the latest version of TypeScript must be installed: https://marketplace.visualstudio.com/items?itemName=TypeScriptTeam.typescript-351
// And modules in the web.config must be set to: modules="AspNetCoreModule"
// And the appropriate IIS APPPOOL must be added to the ServiceAccess users.

import { IXEvent } from "./Interacx/IXEvent"
import { IX } from "Interacx/IX"

class InputForm {
    // If we don't initialize the properties, we can't check if they are in the instance with container.hasOwnProperty("x");
    // Ideally, it's preferable to initialize the property to a value so that we're not wiring up change listeners to elements in which we're not interested for this container.
    // If we don't do this, the container gets a whole bunch of other properties we may not want when those elements change.
    firstName: string = "";
    lastName: string = "";
    x: number;
    y: number;

    list: string[] = [];

    onFirstNameChanged: IXEvent = new IXEvent();
    onLastNameChanged: IXEvent = new IXEvent();
}

class OutputForm {
    outFirstName: string;
    outLastName: string;
    sum: number;
}

export class AppMain {
    public AlertChangedValue(obj, oldVal, newVal) {
        alert(`was: ${oldVal} new: ${newVal} - ${obj.firstName}`);
    }

    public run() {
        let ix = new IX();
        let inputForm = ix.WireUpElements(new InputForm(), document.getElementById("inputForm"));
        let outputForm = ix.WireUpElements(new OutputForm(), document.getElementById("outputForm"));

        inputForm.onFirstNameChanged.Add((_, __, newVal) => outputForm.outFirstName = newVal);
        inputForm.onLastNameChanged.Add((_, __, newVal) => outputForm.outLastName = newVal);
        inputForm.firstName = "Marc";
        inputForm.lastName = "Clifton";

        inputForm.list.push("abc");
        inputForm.list.push("def");
        inputForm.list[1] = "DEF";
        inputForm.list.pop();

        // Observables is dead:
        // https://www.bitovi.com/blog/long-live-es6-proxies
        // https://esdiscuss.org/topic/an-update-on-object-observe
    }

}
