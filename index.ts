import { loader } from "webpack";

import {
    extractImports,
    loadModuleDependencies,
    prepareScript,
    prepareScriptSandBox,
    runScript
} from "./src/loader";

import {
    getOptions as getLoaderOptions,
    OptionObject
} from "loader-utils";

const defaultLoaderOptions: RunLoaderOptions = {
    export: true,
    stringify: false
}

/**
 * `run-loader` is a webpack loader that mixes functionality of `apply-loader`
 * and `extract-loader`.
 * 
 * options:
 * - `context` [Function]: Function that returns context that will be exposed
 *   as `this` while running the exported function.
 *
 * - `args` [Array]: Array of arguments passed to exported function.
 *
 * - `export` [boolean]: Specifies whether the loader exports the results
 *   of exported function or returns it as is. Default is `false`.
 *   `true` is same as using `apply-loader`.
 *   `false` is same as `extract-loader`.
 *
 * - `stringify` [boolean]: Specifies whether the function result will
 *   be JSON.stringified or not. Default is `false`.
 **/
const runLoader: loader.Loader = function (content: string) {
    const opts = getOptions(this);

    this.cacheable();
    this.addDependency(this.resourcePath);

    const callback = <loader.loaderCallback>this.async();

    const imports = extractImports(content);
    const sandbox = prepareScriptSandBox();

    console.log(this.webpack);

    loadModuleDependencies(imports, this)
        .then(exports => {
            sandbox.require = (module: string) => {
                return exports.get(module);
            }

            return prepareScript(content);
        })
        .then(script => runScript(script, sandbox))
        .then(fn => {
            // Why the hell does `fn instanceof Function` not work?!
            if (!fn.apply) {
                throw new Error(
                    `Module "${this.resource}" doesn't export a function`
                );
            }

            let context;

            if (opts.context instanceof Function) {
                context = opts.context.apply(this);
            }

            let result = fn.apply(context || fn, opts.args);
            if (opts.stringify) {
                result = JSON.stringify(result);
            }

            callback(null, result);
        })
        .catch(reason => {
            callback(reason);
        });
}

/**
 * Export results of the previously exported function ala `apply-loader`
 **/
runLoader.pitch = function(remainingRequest: string) {
    const opts = getOptions(<any>this);

    if (!opts.export) {
        return;
    }

    const result = "(req['default'] || req).apply(req)";
    const exports = opts.stringify
        ? `JSON.stringify(${result});`
        : `${result};`;

    return `var req = require(${JSON.stringify("!!" + remainingRequest)});
module.exports = ${exports}`;
}

export = runLoader;

///
/// Helpers
///

function getOptions(context: loader.LoaderContext) {
    const options: RunLoaderOptions = getLoaderOptions(context) || {};
    return Object.assign({}, defaultLoaderOptions, options);
}

///
/// Interfaces
///

interface RunLoaderOptions extends OptionObject {
    context?: ContextFunction;
    args?: any[];
    export?: boolean;
    stringify?: boolean;
}

interface ContextFunction extends Function {
    (this: loader.LoaderContext): any;
}
