import { IX } from "../Interacx/IX"
import { IXAssert } from "../Interacx/IXAssert"
import { IXBinder } from "../Interacx/IXBinder"
import { IXClassList } from "../Interacx/IXClassList"
import { IXEvent } from "../Interacx/IXEvent"
import { IXTemplate } from "../Interacx/IXTemplate"

class TestResults {
    // Initialize fields so they get proxied when the proxy is created.

    // This is the OL element for each test.
    tests: IXTemplate[] = [];

    // This is the DIV element that is a container for the specific test DOM.
    testDom: string = "";           
}

// Use page: Tests/IntegrationTests.html

export class IntegrationTests {
    public run() {
        // Defines:
        // The test function
        // The "class" (i.e. container) for binding, events, etc.
        // The HTML needed to perform the test.
        let tests = [
            { testFnc: IntegrationTests.InputElementSetOnInitializationTest, obj: { inputTest: "Test" }, dom: "<input id='inputTest'/>" },
            { testFnc: IntegrationTests.InputElementSetOnAssignmentTest, obj: { inputTest: "" }, dom: "<input id='inputTest'/>" },
            { testFnc: IntegrationTests.InputSetsPropertyTest, obj: { inputTest: "" }, dom: "<input id='inputTest'/>" },
            { testFnc: IntegrationTests.ListInitializedTest, obj: { list: ["A", "B", "C"] }, dom: "<ol id='list'></ol>" },
            { testFnc: IntegrationTests.ReplaceInitializedTest, obj: { list: ["A", "B", "C"] }, dom: "<ol id='list'></ol>" },
            { testFnc: IntegrationTests.ChangeListItemTest, obj: { list: ["A", "B", "C"] }, dom: "<ol id='list'></ol>" }
        ];

        let testForm = IX.CreateProxy(new TestResults());
        let idx = 0;

        tests.forEach(test => {
            // Get just the name of the test function.
            let testName = IX.LeftOf(test.testFnc.toString(), "(");

            // The ID will start with a lowercase letter
            let id = IX.LowerCaseFirstChar(testName);

            // Push a template to OL, where the template value is simply the test name, to the test results ordered list.
            testForm.tests.push(IXTemplate.Create({ value: testName, id: id }));

            // Create an object with the id and proxy it.  This will match the id of the template we just created, so we can set its style.
            // This is a great example of not actually needing to create a class, which is really
            // just a dictionary.
            let obj = {};

            // The classList here allows us to set the test LI element style class to indicate success/failure of the test.
            obj[id] = { classList: new IXClassList() };     
            let testProxy = IX.CreateProxy(obj);

            // Create the DOM needed for the test.
            this.CreateTestDom(testForm, test.dom);

            // Run the test and indicate the result.
            this.RunTest(testForm, idx, testProxy, test, id);

            // Remove the DOM needed for the test.
            this.RemoveTestDom(testForm);

            ++idx;
        });
    }

    CreateTestDom(testForm: TestResults, testDom: string): void {
        testForm.testDom = testDom;
    }

    RemoveTestDom(testForm: TestResults, ): void {
        testForm.testDom = "";
    }

    RunTest(testForm: TestResults, idx:number, testProxy: object, test, id: string): void {
        let passFail = "pass";

        try {
            test.testFnc(test.obj, id);
        } catch (err) {
            passFail = "fail";
            let template = testForm.tests[idx];
            template.SetValue(`${template.value} => ${err}`);
        }

        testProxy[id].classList.Add(passFail);
    }

    // We don't use a proxies here to verify the test DOM state, as that would defeat the purpose of the test.

    static InputElementSetOnInitializationTest(obj): void {
        IX.CreateProxy(obj);
        IXAssert.Equal((document.getElementById("inputTest") as HTMLInputElement).value, "Test");
    }

    static InputElementSetOnAssignmentTest(obj): void {
        let test = IX.CreateProxy(obj);
        test.inputTest = "Test";
        IXAssert.Equal((document.getElementById("inputTest") as HTMLInputElement).value, "Test");
    }

    static InputSetsPropertyTest(obj): void {
        let test = IX.CreateProxy(obj);
        let el = (document.getElementById("inputTest") as HTMLInputElement);
        el.value = "Test";
        el.dispatchEvent(new Event('change'));      // Sigh.
        IXAssert.Equal(test.inputTest, "Test");
    }

    static ListInitializedTest(obj): void {
        IX.CreateProxy(obj);
        let el = (document.getElementById("list") as HTMLOListElement);
        IXAssert.Equal(el.childElementCount, 3);
        IXAssert.Equal((el.childNodes[0] as HTMLLIElement).innerText, "A");
        IXAssert.Equal((el.childNodes[1] as HTMLLIElement).innerText, "B");
        IXAssert.Equal((el.childNodes[2] as HTMLLIElement).innerText, "C");
    }

    static ReplaceInitializedTest(obj): void {
        let test = IX.CreateProxy(obj);
        test.list = ["D", "E", "F"];
        let el = (document.getElementById("list") as HTMLOListElement);
        IXAssert.Equal(el.childElementCount, 3);
        IXAssert.Equal((el.childNodes[0] as HTMLLIElement).innerText, "D");
        IXAssert.Equal((el.childNodes[1] as HTMLLIElement).innerText, "E");
        IXAssert.Equal((el.childNodes[2] as HTMLLIElement).innerText, "F");
    }

    static ChangeListItemTest(obj): void {
        let test = IX.CreateProxy(obj);
        test.list[1] = "Q";
        let el = (document.getElementById("list") as HTMLOListElement);
        IXAssert.Equal(el.childElementCount, 3);
        IXAssert.Equal((el.childNodes[0] as HTMLLIElement).innerText, "A");
        IXAssert.Equal((el.childNodes[1] as HTMLLIElement).innerText, "Q");
        IXAssert.Equal((el.childNodes[2] as HTMLLIElement).innerText, "C");
    }
}
