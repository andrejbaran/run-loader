import {
    stringify,
    RunLoaderOptions,
    runScript,
    prepareScript,
    prepareScriptSandBox
} from "../src/loader";
import * as loader from "../index";
import { getOptions } from "loader-utils";

jest.mock("loader-utils", () => {
    return {
        getOptions: jest.fn<RunLoaderOptions>()
    }
});

describe("stringification", () => {
    test ("context", () => {
        const ctx = {
            f: (a: any, b: any, c: any) => { console.log(a,b,c); },
            f_fnArgs: [
                "aa",
                "bb",
                "cc"
            ],
            fn: (a: any, b: any, c: any) => { console.log(a,b,c); },
            func: function func() {console.log("meh");},
            nested: {
                f: (a: any, b: any, c: any) => { console.log(a,b,c); },
                f_fnArgs: [
                    "aaa",
                    "bbb",
                    "ccc"
                ],
            }
        };

        const stringifiedCtx = {
            f: `__FN__:((a, b, c) => {console.log(a, b, c);}).bind(null, "aa", "bb", "cc")`,
            fn:  `__FN__:(a, b, c) => {console.log(a, b, c);}`,
            func: `__FN__:function func() {console.log("meh");}`,
            nested: {
                f: `__FN__:((a, b, c) => {console.log(a, b, c);}).bind(null, "aaa", "bbb", "ccc")`
            }
        };

        expect(JSON.parse(stringify(ctx))).toEqual(
            expect.objectContaining(stringifiedCtx)
        );
    });

    test ("args", () => {
        const args = [
            1,
            "string",
            (a: any, b: any, c: any) => { console.log(a,b,c); }
        ];

        const stringifiedArgs = [
            1,
            "string",
            `__FN__:(a, b, c) => {console.log(a, b, c);}`,
        ];

        expect(JSON.parse(stringify(args))).toEqual(
            expect.arrayContaining(stringifiedArgs)
        );
    });
});

describe("pitching part", () => {
    test("mode=run; export=true", () => {
        (<any>getOptions).mockReturnValue({ export: true, context: () => "This is this" });
        const context = {};

        const sandbox = prepareScriptSandBox();
        sandbox.require = (m: string) => {
            return require(m.substr(2));
        }

        const script = prepareScript((<any>loader).pitch.call(context, "./test-module"));
        const exports = runScript(script, sandbox);

        expect(exports).toEqual(expect.objectContaining({
            a: undefined,
            b: undefined,
            c: "This is this"
        }));
    });

    test("mode=bind", () => {
        (<any>getOptions).mockReturnValue({
            mode: "bind",
            export: true,
            context: () => {
                return {
                    f: function meh(a: any) {},
                    fn: (arg: any) => {
                        return arg;
                    },
                    fn_fnArgs: ["yes!"]
                }
            },
            args: [1, () => {}]
        });
        const context = {};

        const sandbox = prepareScriptSandBox();
        sandbox.require = (m: string) => {
            return require(m.substr(2));
        }

        console.log((<any>loader).pitch.call(context, "./test-module"))

        const script = prepareScript((<any>loader).pitch.call(context, "./test-module"));
        const exports = runScript(script, sandbox);

        expect(exports).toEqual(expect.any(Function));
        expect(exports()).toEqual(expect.objectContaining({
            a: 1,
            b: expect.any(Function),
            c: expect.objectContaining({
                fn: expect.any(Function)
            })
        }));
    });
});
