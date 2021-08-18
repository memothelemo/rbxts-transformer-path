import ts from "typescript";
import { TransformContext } from "../../context";
import { TransformerError } from "../../error";
import { isSignatureFromTransformer } from "../../helpers/isSignatureFromTransformer";
import { CALL_MACROS } from "../macros/call";

export function transformCallExpression(context: TransformContext, node: ts.CallExpression) {
	const signature = context.typeChecker.getResolvedSignature(node);
	if (!signature) {
		return node;
	}

	const caseVariable = isSignatureFromTransformer(context, signature);
	const isFromTransformer = caseVariable[0];

	if (!isFromTransformer) {
		return node;
	}

	const declaration = caseVariable[1]!;
	const functionName = declaration.name && declaration.name.getText();

	if (!functionName) {
		return node;
	}

	// call macros begins
	const macro = CALL_MACROS[functionName];
	if (!macro) {
		throw new TransformerError(`Unsupported call function: '${functionName}!'`);
	}

	return macro(context, node);
}
