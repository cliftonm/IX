export class IXAssert {
    public static Equal(got: string, expected: string): void {
        let b = got == expected;

        if (!b) {
            throw `Expected ${expected}, got ${got}`;
        }
    }

    public static IsTrue(b: boolean): void {
        if (!b) {
            throw "Not true";
        }
    }
}

