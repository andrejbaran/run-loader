import * as esquery from "esquery";
import * as ESTree from "estree";

export function extractImportsFromProgram(ast: ESTree.Program) {
    const imports = <Import[]>esquery(
        ast,
        "CallExpression[callee.name='require']"
    );

    return imports.map(imp => {
        switch(imp.type) {
        case "CallExpression":
            return extractCJSImportedModule(imp);
        // TODO: Handle ES imports at some point
        //    
        // case "ImportDeclaration":
        //     return extractES2015ImportedModule(imp);
        default:
            throw new Error(`Unknown import type: ${imp.type}`);
        }
    });
}

///
/// Helpers
///

function extractCJSImportedModule(
    node: ESTree.SimpleCallExpression
): string {
    if (node.arguments[0].type !== "Literal") {
        throw new Error(
            `Unsupported call to require: Argument has to be a literal.`
            + `Got: ${node.arguments[0].type}`
        );
    }

    return <string>(<ESTree.Literal>node.arguments[0]).value;
}

// TODO: Handle ES imports at some point
//
// function extractES2015ImportedModule(node: ESTree.ImportDeclaration) {
//     return <string>node.source.value;
// }

///
/// Interfaces
///

export type Import = ESTree.CallExpression | ESTree.ImportDeclaration;
