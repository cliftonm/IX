// Observables is dead:
// https://www.bitovi.com/blog/long-live-es6-proxies
// https://esdiscuss.org/topic/an-update-on-object-observe

/*
 For reference because I always forget:
    interface IKeyValueDictionary {
        [key: string]: any;
}
*/

import { IX } from "Interacx/IX"
import { IXBinder } from "./Interacx/IXBinder"
import { IXEvent } from "./Interacx/IXEvent"
import { IXSelector } from "./Interacx/IXSelector"

class InputForm {
    firstName: string = "";
    lastName: string = "";

    // Late binding with UpdateProxy after first time initialization.
    x: number;
    y: number;

    // arrays must be initialized.
    // list: string[] = [];

    // Event handlers:
    onFirstNameKeyUp = new IXEvent();
    onLastNameChanged = new IXEvent();
    onXChanged = new IXEvent();
    onYChanged = new IXEvent();

    // Converters, so 1 + 2 != '12'
    onConvertX = x => Number(x);
    onConvertY = y => Number(y);

    Add = () => this.x + this.y;
}

class HoverExample {
    mySpan = {
        attr: { title: "" }
    };

    onMySpanHover = new IXEvent();
}

class VisibilityExample {
    seen = {
        attr: { visible: true }
    };

    onShowClicked = new IXEvent().Add((_, p) => p.seen.attr.visible = true);
    onHideClicked = new IXEvent().Add((_, p) => p.seen.attr.visible = false);
}

class ReverseExample {
    message = "Hello From Interacx!";
    onReverseMessageClicked = new IXEvent().Add((_, p: ReverseExample) => p.message = p.message.split('').reverse().join(''));
}

class BidirectionalExample {
    input2: string = "";
    input3: string = "";
    message2 = new IXBinder({ bindFrom: IX.nameof(() => this.input2) });
    message3 = new IXBinder({ bindFrom: "input2" })        // Seems like using a string here is reasonable.
                 .Add({ bindFrom: IX.nameof(() => this.input3), op: v=>v.split('').reverse().join('') });

    // onInput2KeyUp = new IXEvent().Add((v, p: BidirectionalExample) => p.message2 = v);
}

class ListExample {
    someList: string[] = ["Learn Javascript", "Fizbin", "Wear a mask!"];
}

class OutputForm {
    outFirstName: string;
    outLastName: string;
    sum: number;
}

//class CheckboxExample {
//    checkbox: boolean = false;
//    ckLabel: string = "Unchecked";

//    onCheckboxClicked = new IXEvent().Add((_, p: CheckboxExample) => p.ckLabel = p.checkbox ? "Checked" : "Unchecked");
//}

class CheckboxExample {
    checkbox: boolean = false;
    ckLabel = new IXBinder({ bindFrom: IX.nameof(() => this.checkbox) });
    // or:
    // ckLabel = new IXBinder({ bindFrom: "checkbox" });
}

class CheckboxListExample {
    jane: boolean = false;
    mary: boolean = false;
    grace: boolean = false;
    ckNames = IXBinder.AsArray(items => items.join(", "))
        .Add({ bindFrom: "jane", attribute: "value" })
        .Add({ bindFrom: "mary", attribute: "value" })
        .Add({ bindFrom: "grace", attribute: "value" });
}

class RadioExample {
    marc: boolean = false;
    chris: boolean = false;
    rbPicked = new IXBinder({ bindFrom: "marc", attribute: "value" })
        .Add({ bindFrom: "chris", attribute: "value" });
}

class ComboboxExample {
    selector = new IXSelector();

    //selector = new IXSelector().Add({ disabled: true, text: "Please select one" })
    //    .Add({ value: 1, text: "A" })
    //    .Add({ value: 2, text: "B" })
    //    .Add({ value: 3, text: "C" });

    selection: string = "";

    onSelectorChanged = new IXEvent().Add((_, p) => p.selection = `Selected: ${p.selector.text} with value ${p.selector.value}`);
}

class ComboboxInitializationExample {
    selector2 = new IXSelector().Add({ selected:true, disabled: true, text: "Please select one" })
        .Add({ value: 12, text: "AAA" })
        .Add({ value: 23, text: "BBB" })
        .Add({ value: 34, text: "CCC" });

    selection2: string = "";

    onSelector2Changed = new IXEvent().Add((_, p) => p.selection2 = `Selected: ${p.selector2.text} with value ${p.selector2.value}`);
}

export class AppMain {
    public AlertChangedValue(obj, oldVal, newVal) {
        alert(`was: ${oldVal} new: ${newVal} - ${obj.firstName}`);
    }

    public run() {
        let listForm = IX.CreateProxy(new ListExample());
        // listForm.someList[1] = "Learn IX!";
        // let listForm = IX.CreateProxy(new ListExample());
        let items = ["Learn Javascript", "Learn IX", "Wear a mask!"];
        listForm.someList = items;

        IX.CreateProxy(new BidirectionalExample());
        IX.CreateProxy(new ReverseExample());
        IX.CreateProxy(new CheckboxExample());

        let rbExample = IX.CreateProxy(new RadioExample());
        rbExample.chris = true;

        let ckListExample = IX.CreateProxy(new CheckboxListExample());
        ckListExample.jane = true;
        ckListExample.mary = true;

        IX.CreateProxy(new ComboboxExample());
        let cb = IX.CreateProxy(new ComboboxInitializationExample());
        cb.selector2.value = 34;
        cb.selector2.text = "AAA";

        cb.selector2.options[2] = { text: "bbb", value: 999 };
        // cb.selector2.options.pop();

        // cb.selector2.options.push({ text: "DDD", value: 45 });

        let hform = IX.CreateProxy(new HoverExample());
        hform
            .onMySpanHover
            .Add(() =>
                hform.mySpan.attr.title = `You loaded this page on ${new Date().toLocaleString()}`);

        IX.CreateProxy(new VisibilityExample());

        let inputForm = IX.CreateProxy(new InputForm());

        let form = IX.CreateNullProxy();  // No associated view model.
        form.app = "Hello Interacx!";

        // Post wire-up
        // Notice UI elements get set immediately.
        // TODO: Fire any onConvert and onChanged events!
        inputForm.x = 1;
        inputForm.y = 2;

        // This does a post-wire-up of the change event handler for x and y now that they exist.
        IX.UpdateProxy(inputForm);

        let outputForm = IX.CreateProxy(new OutputForm());

        inputForm.onFirstNameKeyUp.Add(newVal => outputForm.outFirstName = newVal);
        inputForm.onLastNameChanged.Add(newVal => outputForm.outLastName = newVal);

        inputForm.onXChanged.Add(() => outputForm.sum = inputForm.Add());
        inputForm.onYChanged.Add(() => outputForm.sum = inputForm.Add());

        inputForm.firstName = "Marc";
        inputForm.lastName = "Clifton";

        //inputForm.list.push("abc");
        //inputForm.list.push("def");
        //inputForm.list[1] = "DEF";
        //inputForm.list.pop();
    }
}
