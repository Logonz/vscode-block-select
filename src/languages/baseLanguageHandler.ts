import Parser from "tree-sitter";
import { TreeSitterUtil } from "../treeSitterUtil";
import * as vscode from "vscode";

export abstract class BaseLanguageHandler {
  protected parserUtil: TreeSitterUtil;

  constructor(parserUtil: TreeSitterUtil) {
    this.parserUtil = parserUtil;
  }

  abstract isBracketedNode(node: Parser.SyntaxNode): boolean;

  // abstract getLanguageId(): string;

  /**
   * Implement language-specific selection logic
   */
  abstract selectNode(
    node: Parser.SyntaxNode,
    selection: vscode.Selection
  ): { start: number; end: number; type: string; openingBracketLength: number; closingBracketLength: number } | null;
}
