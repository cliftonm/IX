import { IX } from "../Interacx/IX"
import { IXBinder } from "../Interacx/IXBinder"
import { IXClassList } from "../Interacx/IXClassList"
import { IXEvent } from "../Interacx/IXEvent"

class Assert {
    public static Equal(got: string, expected: string, classList: IXClassList): void {
        let b = got == expected;
        let passFail = b ? "pass" : "fail";
        classList.Add(passFail);
    }
}

class InputInitializedTest {
    lbl1 = {
        classList: new IXClassList()
    }

    inputTest1 = "Test";
}

class InputAssignmentTest {
    lbl2 = {
        classList: new IXClassList()
    }

    inputTest2 = "";
}

export class IntegrationTests {

    public run() {
        IntegrationTests.InputElementSetOnInitializationTest();
        IntegrationTests.InputElementSetOnAssignmentTest();
    }

    static InputElementSetOnInitializationTest(): void {
        let test = IX.CreateProxy(new InputInitializedTest());
        Assert.Equal((document.getElementById("inputTest1") as HTMLInputElement).value, "Test", test.lbl1.classList);
    }

    static InputElementSetOnAssignmentTest(): void {
        let test = IX.CreateProxy(new InputAssignmentTest());
        test.inputTest2 = "Test";
        Assert.Equal((document.getElementById("inputTest2") as HTMLInputElement).value, "Test", test.lbl2.classList);
    }
}
