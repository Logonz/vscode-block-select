// src/languages/pythonHandler.ts
import { BaseLanguageHandler } from "./baseLanguageHandler";
import Parser from "tree-sitter";
import * as vscode from "vscode";

export class PythonHandler extends BaseLanguageHandler {
  isBracketedNode(node: Parser.SyntaxNode): boolean {
    const blockTypes = ["parenthesized_expression", "block", "string"];
    return blockTypes.includes(node.type);
  }

  // getLanguageId(): string {
  //   return "python";
  // }

  /**
   * Selects the entire block represented by the node.
   * @param node The Python block node
   * @returns The start and end indices of the block
   */
  selectNode(
    node: Parser.SyntaxNode,
    selection: vscode.Selection
  ): { start: number; end: number; type: string; openingBracketLength: number; closingBracketLength: number } | null {
    while (node) {
      console.log("SELECT NODE TYPE", node.type);
      if (this.isBracketedNode(node)) {
        return { start: node.startIndex, end: node.endIndex, type: node.type, openingBracketLength: 1, closingBracketLength: 1 };
      }
      node = node.parent;
    }
    return null;
  }
}
