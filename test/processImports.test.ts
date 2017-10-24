import {
    extractImports,
    loadModuleDependencies,
    runScript,
    prepareScript,
    prepareScriptSandBox
} from "../src/loader";

test("process imports", async () => {
    let code = `
var test = require('test-module'), val = require('val-module').length;
var abc = {};
abc.def = require("nested-var-module");

module.exports = () => { return test + ";" + val + ";" + abc.def; };`;

    const imports = extractImports(code);

    const script = prepareScript(code);
    const sandbox = prepareScriptSandBox();

    const webpackLoaderContext = {
        loadModule: jest.fn(
            (module: string, callback: Function) => {
                callback(null, `module.exports = "${module}";`);
            }
        )
    }

    const exports = await loadModuleDependencies(imports, <any>webpackLoaderContext);

    sandbox.require = (module: string) => {
        return exports.get(module);
    }
    
    const fn = runScript(script, sandbox);

    expect(webpackLoaderContext.loadModule).toHaveBeenCalledWith("test-module", expect.any(Function));
    expect(webpackLoaderContext.loadModule).toHaveBeenCalledWith("val-module", expect.any(Function));
    expect(webpackLoaderContext.loadModule).toHaveBeenCalledWith("nested-var-module", expect.any(Function));
    expect(webpackLoaderContext.loadModule).toHaveBeenCalledTimes(3);

    expect(fn.apply(fn)).toBe("test-module;10;nested-var-module");
});
