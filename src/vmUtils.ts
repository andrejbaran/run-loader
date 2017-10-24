import * as vm  from "vm";

export const defaultModuleOptions: Readonly<VmOptions> = {
    vmScriptOptions: {
        displayErrors: true
    },
    vmRunOptions: {
        displayErrors: true
    }
};

/**
 * Runs a script in VM and returns module's exports
 **/
export function runScriptInVm(options: RunScriptOptions) {
    const { script, sandbox, vmRunOptions} = options;

    // node harakiri with exports ...
    sandbox.module.exports = sandbox.exports;

    script.runInNewContext(sandbox, vmRunOptions);

    return sandbox.module.exports;
}

/**
 * Runs a module (code) in VM and returns module's exports
 **/
export function runModuleInVm(options: RunModuleOptions) {
    const { code, sandbox, vmScriptOptions, vmRunOptions} = options;

    // node harakiri with exports ...
    sandbox.module.exports = sandbox.exports;

    const script = createVmScript(code, vmScriptOptions);
    script.runInNewContext(sandbox, vmRunOptions);

    return sandbox.module.exports;
}

export function createVmScript(
    code: string,
    scriptOptions: vm.ScriptOptions = defaultModuleOptions.vmScriptOptions
) {
    return new vm.Script(code, scriptOptions);
}

///
/// Interfaces
///

export interface RunModuleOptions extends RunOptions {
    code: string;
}

export interface RunScriptOptions extends RunOptions {
    script: vm.Script;
}

export interface RunOptions extends Partial<VmOptions> {
    sandbox: ScriptSandbox;
}

export interface VmOptions {
    vmScriptOptions: vm.ScriptOptions;
    vmRunOptions: vm.RunningScriptOptions;
}

export interface ScriptSandbox {
    module: {
        exports: ModuleExports;
    };
    exports: ModuleExports;
    [k: string]: any;
}

export interface ModuleExports {
    [k: string]: any;
}
