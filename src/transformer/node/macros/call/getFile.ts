import ts, { factory } from "typescript";
import { CallMacroFunction } from ".";
import { TransformerDiagnostics } from "../../../../shared/diagnostics/diagnostics";
import { DiagnosticError } from "../../../../shared/errors/diagnostic";
import { TransformContext } from "../../../context";
import { parseFileGetterCallExpression } from "../../../helpers/parseFileGetterCallExpression";
import { REQUIRED_FUNCTIONS_BY_NAME } from "../../../helpers/requiredFunctions";

// because we have waitfor implemented
// so we need to seperate those out

/**
 * Modular function that allows to transform $getFile
 * universally
 * @param waitFor Implement waitFor
 */
function transformGetFileCallMacroInner(
	context: TransformContext,
	node: ts.CallExpression,
	waitFor: boolean,
) {
	const sourceFile = context.getSourceFile(node);
	context.addRequiredFunction(
		sourceFile,
		REQUIRED_FUNCTIONS_BY_NAME.getInstanceFromPath,
	);

	if (!context.rojoProject) {
		throw new DiagnosticError(
			TransformerDiagnostics.USED_BUT_UNRESOLVED_ROJO(
				node,
				waitFor ? "$getFileWaitFor" : "$getFile",
			),
		);
	}

	const rbxPath = parseFileGetterCallExpression(context, node, true, true);
	if (typeof rbxPath === "string") {
		throw new DiagnosticError(
			TransformerDiagnostics.UNEXPECTED_ERROR(node),
		);
	}

	let typeArgument: ts.TypeNode | undefined;
	if (node.typeArguments) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		typeArgument = node.typeArguments[0];
	}

	const args = new Array<ts.Expression>(
		factory.createArrayLiteralExpression(
			rbxPath.map(v => factory.createStringLiteral(v as string)),
		),
	);

	if (waitFor) {
		args.push(factory.createTrue());

		const secondArg = node.arguments[1];
		if (secondArg) {
			args.push(secondArg);
		}
	}

	return factory.createCallExpression(
		factory.createIdentifier(
			REQUIRED_FUNCTIONS_BY_NAME.getInstanceFromPath,
		),
		typeArgument ? [typeArgument] : [],
		args,
	);
}

export const transformGetFileCallMacro: CallMacroFunction = (context, node) =>
	transformGetFileCallMacroInner(context, node, false);

export const transformGetFileWaitForCallMacro: CallMacroFunction = (
	context,
	node,
) => transformGetFileCallMacroInner(context, node, true);
