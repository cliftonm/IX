// Observables is dead:
// https://www.bitovi.com/blog/long-live-es6-proxies
// https://esdiscuss.org/topic/an-update-on-object-observe

/*
 For reference because I always forget:
    interface IKeyValueDictionary {
        [key: string]: any;
}
*/

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

    // Converters, so 1 + 2 != '12'
    onConvertX = x => Number(x);
    onConvertY = y => Number(y);

    onShowClicked = new IXEvent();
    onHideClicked = new IXEvent();
    onMySpanHover = new IXEvent();

    public Add(): number {
        return this.x + this.y;
    }

    // mySpan = { title: () => `You loaded this page on ${new Date().toLocaleString()}` };

    mySpan = {
        attr: { title: "" }
    };

    seen = {
        attr: { visible: true }
    };
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
        let inputForm = IX.CreateProxy(new InputForm());

        let form = IX.CreateNullProxy();  // no associated view model.
        form.app = "Hello Interacx!";

        // Post wire-up
        // Notice UI elements get set immediately.
        inputForm.x = 1;
        inputForm.y = 2;

        // This does a post-wire-up of the change event handler for x and y now that they exist.
        IX.UpdateProxy(inputForm);

        let outputForm = IX.CreateProxy(new OutputForm());

        inputForm.onFirstNameChanged.Add(newVal => outputForm.outFirstName = newVal);
        inputForm.onLastNameChanged.Add(newVal => outputForm.outLastName = newVal);

        inputForm.onXChanged.Add(() => outputForm.sum = inputForm.Add());
        inputForm.onYChanged.Add(() => outputForm.sum = inputForm.Add());

        inputForm.onMySpanHover.Add(() => inputForm.mySpan.attr.title = `You loaded this page on ${new Date().toLocaleString()}`);

        inputForm.onShowClicked.Add(() => inputForm.seen.attr.visible = true);
        inputForm.onHideClicked.Add(() => inputForm.seen.attr.visible = false);

        inputForm.firstName = "Marc";
        inputForm.lastName = "Clifton";

        inputForm.list.push("abc");
        inputForm.list.push("def");
        inputForm.list[1] = "DEF";
        inputForm.list.pop();
    }
}
