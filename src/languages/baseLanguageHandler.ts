import Parser from "tree-sitter";
import { TreeSitterUtil } from "../utils/treeSitterUtil";
import * as vscode from "vscode";

export abstract class BaseLanguageHandler {
  protected parserUtil: TreeSitterUtil;

  constructor(parserUtil: TreeSitterUtil) {
    this.parserUtil = parserUtil;
  }

  abstract isBracketedNode(node: Parser.SyntaxNode): boolean;

  abstract getLanguageId(): string;

  /**
   * Implement language-specific selection logic
   */
  abstract selectNode(node: Parser.SyntaxNode): { start: number; end: number } | null;
}
