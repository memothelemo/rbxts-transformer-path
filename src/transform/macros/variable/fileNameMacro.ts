import { f } from "@transform/factory";
import { State } from "@transform/state";
import ts from "typescript";
import { VariableAccessExpression, VariableMacroDefinition } from "../types";
import MacroIntrinsics from "../intrinsics";

export const FileNameMacro: VariableMacroDefinition = {
    getSymbols(state: State): ts.Symbol[] {
        const module = state.symbolProvider.module;
        return [module.expect("$FILE_NAME")];
    },

    transform(state: State, node: VariableAccessExpression): ts.Expression {
        const fileName = state.getSourceFileOfNode(node).fileName;
        const relativePath = MacroIntrinsics.fixPath(state.project.relativeFromDir(fileName));
        return f.string(relativePath);
    },
};
