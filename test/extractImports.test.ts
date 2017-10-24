import {
    extractImports,
} from "../src/loader";

test("parse require()", () => {
    const code = `
var simpleReq = require("simple-module");
let letReq = require("let-module");
const constReq = require("const-module");

var separate = { me: {} };
separate.me.now = require("separate-module");

var number = 1, multiReq = require("multi-module");

var memberReq = require("member-module").member.anotherMember;
var memberReq2 = require("member-module")["member2"];
var memberReq3 = require("member-module")[member3];
    `;

    const expModules = [
        "simple-module", "let-module", "const-module",
        "separate-module", "multi-module", "member-module"
    ];

    const imports = extractImports(code);

    expect(imports.size).toBe(expModules.length);

    expect([...imports]).toEqual(
        expect.arrayContaining(expModules)
    );
});

describe("usupported require()", () => {
    test("not literal inside require()", () => {
        const code = `
var moduleName = "simple-module";
var simpleReq = require(simpleName);
`;

        const imports = extractImports.bind(null, code);

        expect(imports).toThrowError();
    });

    test("too many args inside require()", () => {
        const code = `
var moduleName = "simple-module";
var simpleReq = require(simpleName + "-extended");
`;

        const imports = extractImports.bind(null, code);

        expect(imports).toThrowError();
    });
});

// TODO: Once ES imports/exports support is in place resurect test
//
// test("parse ES module imports", () => {
//     const code = `
// import { abc } from "standard-module";
// import { def, ghi } from "standard-module";
// import default_export from "default-module";
// import * as namespace from "namespace-module";
// import { exported as module_exported } from "aliased-import-module";
//     `;

//     const expModules = [
//         "standard-module", "default-module",
//         "namespace-module", "aliased-import-module"
//     ];

//     const imports = extractImports(code);

//     expect(imports.size).toBe(expModules.length);

//     expect([...imports]).toEqual(
//         expect.arrayContaining(expModules)
//     );
// });
