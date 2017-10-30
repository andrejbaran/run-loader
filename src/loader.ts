import { Script } from "vm";
import * as joi from "joi";
import { loader } from "webpack";
import { OptionObject } from "loader-utils";

import { parse } from "acorn";

import { loadModule } from "./webpackUtils";
import {
    runScriptInVm,
    createVmScript,
    ScriptSandbox,
    ModuleExports
} from "./vmUtils";
import {
    extractImportsFromProgram
} from "./estreeUtils";

/**
 * Returns a map of dependency modules and their import definitions
 * found in the contents.
 **/
export function extractImports(moduleContent: string): Imports {
    const ast = parse(
        moduleContent,
        { sourceType: "module" }
    );

    return new Set<string>(extractImportsFromProgram(ast));
}

/**
 * Asynchronously load module's dependencies with `loader.loadModule`
 **/
export async function loadModuleDependencies(
    imports: Imports,
    context: loader.LoaderContext
) {
    const loader = Promise.all(
        [...imports].map<Promise<[string, ModuleExports]>>(
            (module) => {
                return Promise.all([
                    Promise.resolve(module),
                    loadModule({ module, context })
                ]);
            }
        )
    );

    const exports = await loader;
    return new Map(exports);
}

export function prepareScript(moduleContent: string): Script {
    return createVmScript(moduleContent);
}

export function prepareScriptSandBox(): ScriptSandbox {
    return {
        module: { exports: {}},
        exports: {}
    };
}

export function runScript(
    script: Script,
    sandbox: ScriptSandbox,
): Function {
    return <Function>runScriptInVm({ script, sandbox });
}

export function validateOptions(opts: RunLoaderOptions) {
    return joi.attempt(opts, optionsSchema());
}

export function stringify(ctx: any): string {
    return JSON.stringify(
        ctx,
        (key, val) => {
            if (key.endsWith("_fnArgs")) {
                return undefined;
            }
            if (typeof val == "object" && key !== "") {
                return JSON.parse(stringify(val));
            }
            if (!(val instanceof Function)) {
                return val;
            }

            const fnArgs = ctx[key + "_fnArgs"]
                ? ctx[key + "_fnArgs"]
                    .map((a: any) => JSON.stringify(a))
                    .join(", ")
                : undefined;

            const fn = <Function>val;

            return fnArgs
                ? `__FN__:(${fn.toString()}).bind(null, ${fnArgs})`
                : `__FN__:${fn.toString()}`;
        }
    );
}

function optionsSchema() {
    return joi.object({
        mode: joi.string().valid("run", "bind").default("run"),
        context: joi.func(),
        args: joi.array().items(
            joi.lazy(() => argOptionSchema())
        ),
        export: joi.boolean().default(false)
            .when(
                "mode",
                {
                    is: "bind",
                    then: joi.boolean().valid(true).default(true)
                }
            ),
        stringify: joi.boolean().default(false)
            .when(
                "mode",
                {
                    is: "bind",
                    then: joi.boolean().valid(false).default(false)
                }
            ),
    });
}

function argOptionSchema(): joi.AlternativesSchema {
    return joi.alternatives().try(
        joi.string().allow(""),
        joi.func(),
        joi.number(),
        joi.boolean(),
        joi.any().valid(null),
        joi.array().items(joi.lazy(() => argOptionSchema())),
        joi.object().pattern(/./, joi.lazy(() => argOptionSchema()))
    );
}

///
/// Interfaces
///

export type Imports = Set<string>;
export type Exports = Map<string, ModuleExports>;

export interface RunLoaderOptions extends OptionObject {
    context?: ContextFunction;
    args?: any[];
    export?: boolean;
    stringify?: boolean;
}

export interface ContextFunction extends Function {
    (this: loader.LoaderContext): any;
}
