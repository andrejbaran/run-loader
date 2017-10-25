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

function optionsSchema() {
    return joi.object({
        context: joi.func(),
        args: joi.array().items(
            joi.lazy(() => argOptionObjectSchema())
        ),
        export: joi.boolean().default(false),
        stringify: joi.boolean().default(false)
    });
}

function argOptionObjectSchema() {
    return joi.alternatives().try(
        joi.string().allow(""),
        joi.number(),
        joi.boolean(),
        joi.any().valid(null),
        joi.array().items(joi.lazy(() => argOptionObjectSchema())),
        joi.object().pattern(/./, joi.lazy(() => argOptionObjectSchema()))
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
