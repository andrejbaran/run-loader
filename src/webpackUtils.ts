import { loader } from "webpack";
import { runModuleInVm, ScriptSandbox, ModuleExports } from "./vmUtils";

/**
 * Loads the source code of dependency through webpack's `loader.loadModule`.
 * Runs the source code in VM and resolves with its exports.
 * 
 * @todo: Handle ES module exports at some point.
 **/
export function loadModule(options: LoadModuleOptions) {
    const { context, module } = options;
    const p = new Promise<ModuleExports>((resolve, reject) => {
        // `loadModule` is missing in webpack's typings
        (<any>context).loadModule(
            module,
            (err: Error, code: string) => {
                if (err) {
                    return reject(err);
                }

                const depSandbox: ScriptSandbox = {
                    require: (module: string) => require(module),
                    module: { exports: {}},
                    exports: {}
                };

                const exports = runModuleInVm({
                    code,
                    sandbox: depSandbox
                });

                // Handle cjs "default" export as well as regular cjs exports
                resolve(exports["default"] || exports);
            }
        );
    });

    return p;
}

export interface LoadModuleOptions {
    module: string;
    context: loader.LoaderContext;
}
