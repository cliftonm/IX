import { IX } from "../Interacx/IX"
import { IXBinder } from "../Interacx/IXBinder"
import { IXClassList } from "../Interacx/IXClassList"
import { IXEvent } from "../Interacx/IXEvent"
import { IXTemplate } from "../Interacx/IXTemplate"

class Assert {
    public static Equal(got: string, expected: string, classList: IXClassList): void {
        let b = got == expected;
        let passFail = b ? "pass" : "fail";
        classList.Add(passFail);
    }
}

class TestForm {
    tests: IXTemplate[] = [];
}

class InputInitializedTest {
    lbl1 = { classList: new IXClassList() }
    inputTest1 = "Test";
}

class InputAssignmentTest {
    lbl2 = { classList: new IXClassList() }
    inputTest2 = "";
}

class InputSetsPropertyTest {
    lbl3 = { classList: new IXClassList() }
    inputTest3 = "";
}

export class IntegrationTests {
    public run() {
        let tests = [
            IntegrationTests.InputElementSetOnInitializationTest,
            IntegrationTests.InputElementSetOnAssignmentTest,
            IntegrationTests.InputSetsPropertyTest,
        ];

        let testForm = IX.CreateProxy(new TestForm());
                tests.forEach(test => {
            let testName = IX.LeftOf(test.toString(), "(");
            let id = IX.LowerCaseFirstChar(testName);
            testForm.tests.push(IXTemplate.Create({ value: testName, id: id }));
            console.log(testName);

            // Create an object with the id and proxy it.
            let obj = {};
            obj[id] = { classList: new IXClassList() };
            let objProxy = IX.CreateProxy(obj);

            test(objProxy, id);
        });
    }

    static InputElementSetOnInitializationTest(proxy, id): void {
        IX.CreateProxy(new InputInitializedTest());
        Assert.Equal((document.getElementById("inputTest1") as HTMLInputElement).value, "Test", proxy[id].classList);
    }

    static InputElementSetOnAssignmentTest(proxy, id): void {
        let test = IX.CreateProxy(new InputAssignmentTest());
        test.inputTest2 = "Test";
        Assert.Equal((document.getElementById("inputTest2") as HTMLInputElement).value, "Test", proxy[id].classList);
    }

    static InputSetsPropertyTest(proxy, id): void {
        let test = IX.CreateProxy(new InputSetsPropertyTest());
        let el = (document.getElementById("inputTest3") as HTMLInputElement);
        el.value = "Test";
        el.dispatchEvent(new Event('change'));      // Sigh.
        Assert.Equal(test.inputTest3, "Test", proxy[id].classList);
    }
}
