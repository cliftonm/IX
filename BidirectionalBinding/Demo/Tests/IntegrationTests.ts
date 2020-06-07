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

class TestResults {
    // Initialize fields so they get proxied when the proxy is created.

    // This is the OL element for each test.
    tests: IXTemplate[] = [];

    // This is the DIV element that is a container for the specific test DOM.
    testDom: string = "";           
}

export class IntegrationTests {
    public run() {
        // Defines:
        // The test function
        // The "class" (i.e. container) for binding, events, etc.
        // The HTML needed to perform the test.
        let tests = [
            { testFnc: IntegrationTests.InputElementSetOnInitializationTest, obj: { inputTest: "Test" }, dom: "<input id='inputTest'/>" },
            { testFnc: IntegrationTests.InputElementSetOnAssignmentTest, obj: { inputTest: "" }, dom: "<input id='inputTest'/>" },
            { testFnc: IntegrationTests.InputSetsPropertyTest, obj: { inputTest: "" }, dom: "<input id='inputTest'/>" }
        ];

        let testForm = IX.CreateProxy(new TestResults());

        tests.forEach(test => {
            // Get just the name of the test function.
            let testName = IX.LeftOf(test.testFnc.toString(), "(");

            // The ID will start with a lowercase letter
            let id = IX.LowerCaseFirstChar(testName);

            // Push that to the test results ordered list.
            testForm.tests.push(IXTemplate.Create({ value: testName, id: id }));

            // Create an object with the id and proxy it.
            // This is a great example of not actually needing to create a class, which is really
            // just a dictionary.
            let obj = {};

            // The classList here allows us to set the element's class to indicate success/failure of the test.
            obj[id] = { classList: new IXClassList() };     
            let testProxy = IX.CreateProxy(obj);

            // Create the DOM needed for the test.
            this.CreateTestDom(testForm, test.dom);

            // Run the test.
            test.testFnc(testProxy, test.obj, id);

            // Remove the DOM needed for the test.
            this.RemoveTestDom(testForm);
        });
    }

    CreateTestDom(testForm: TestResults, testDom: string): void {
        testForm.testDom = testDom;
    }

    RemoveTestDom(testForm: TestResults, ): void {
        testForm.testDom = "";
    }

    static InputElementSetOnInitializationTest(proxy, obj, id): void {
        IX.CreateProxy(obj);
        // We don't use a proxy here, as that would defeat the purpose of the test.
        Assert.Equal((document.getElementById("inputTest") as HTMLInputElement).value, "Test", proxy[id].classList);
    }

    static InputElementSetOnAssignmentTest(proxy, obj, id): void {
        let test = IX.CreateProxy(obj);
        test.inputTest = "Test";
        // We don't use a proxy here, as that would defeat the purpose of the test.
        Assert.Equal((document.getElementById("inputTest") as HTMLInputElement).value, "Test", proxy[id].classList);
    }

    static InputSetsPropertyTest(proxy, obj, id): void {
        let test = IX.CreateProxy(obj);
        // We don't use a proxy here, as that would defeat the purpose of the test.
        let el = (document.getElementById("inputTest") as HTMLInputElement);
        el.value = "Test";
        el.dispatchEvent(new Event('change'));      // Sigh.
        Assert.Equal(test.inputTest, "Test", proxy[id].classList);
    }
}
