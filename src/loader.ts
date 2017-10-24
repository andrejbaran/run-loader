import { Script } from "vm";
import { loader } from "webpack";

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

///
/// Interfaces
///

export type Imports = Set<string>;
export type Exports = Map<string, ModuleExports>;
