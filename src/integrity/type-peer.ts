import { ts } from 'ts-morph';
import { InterpretationError } from '../core/errors.ts';
/** The named type-only exception refuses runtime edges, including escaped names. */
export function assertNoTypePeerRuntimeEdge(source: string, file: string): void {
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  function refuse() {
    throw new InterpretationError('dependency_mismatch', 'Non-executed TypeScript peer has a runtime edge');
  }
  function specifier(value: any) {
    if (!value || !ts.isStringLiteralLike(value)) refuse();
    if (value.text === 'typescript' || value.text.startsWith('typescript/')) refuse();
  }
  function visit(node: any): void {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier)
      specifier(node.moduleSpecifier);
    if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === 'require') ||
        (ts.isPropertyAccessExpression(node.expression) && node.expression.getText(tree) === 'import.meta.resolve'))
    )
      specifier(node.arguments[0]);
    ts.forEachChild(node, visit);
  }
  visit(tree);
}
