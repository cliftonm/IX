import { IntegrationTests } from "./IntegrationTests"

require(['IntegrationTests'],
    (main: any) => {
        var appTests = new IntegrationTests();
        appTests.run();
    }
);
