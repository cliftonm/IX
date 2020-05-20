// To host this with IIS, the IIS Hosting bundle must be installed:
// https://dotnet.microsoft.com/download/dotnet-core/thank-you/runtime-aspnetcore-2.1.3-windows-hosting-bundle-installer
// Read more: https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/?view=aspnetcore-3.1
// Also, the latest version of TypeScript must be installed: https://marketplace.visualstudio.com/items?itemName=TypeScriptTeam.typescript-351
// And modules in the web.config must be set to: modules="AspNetCoreModule"
// And the appropriate IIS APPPOOL must be added to the ServiceAccess users.

import { IXEvent } from "./Interacx/IXEvent"
import { IX } from "Interacx/IX"

class InputForm {
    firstName: string = "";
    lastName: string = "";

    // Late binding with UpdateProxy after first time initialization.
    x: number;
    y: number;

    // arrays must be initialized.
    list: string[] = [];

    // Event handlers:
    onFirstNameChanged = new IXEvent();
    onLastNameChanged = new IXEvent();
    onXChanged = new IXEvent();
    onYChanged = new IXEvent();

    onConvertX = x => parseInt(x);
    onConvertY = y => parseInt(y);

    public Add(): number {
        return this.x + this.y
    }
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
        let inputForm = ix.CreateProxy(new InputForm());

        // Post wire-up
        inputForm.x = 1;
        inputForm.y = 2;
        ix.UpdateProxy(inputForm);

        let outputForm = ix.CreateProxy(new OutputForm());

        inputForm.onFirstNameChanged.Add((_, __, newVal) => outputForm.outFirstName = newVal);
        inputForm.onLastNameChanged.Add((_, __, newVal) => outputForm.outLastName = newVal);

        inputForm.onXChanged.Add(() => outputForm.sum = inputForm.Add());
        inputForm.onYChanged.Add(() => outputForm.sum = inputForm.Add());

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
