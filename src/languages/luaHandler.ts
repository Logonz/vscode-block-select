// src/languages/luaHandler.ts
import { BaseLanguageHandler } from "./baseLanguageHandler";
import Parser from "tree-sitter";
import * as vscode from "vscode";

export class LuaHandler extends BaseLanguageHandler {
  isBracketedNode(node: Parser.SyntaxNode): boolean {
    const blockTypes = [
      "if_statement",
      "function_definition",
      "for_statement",
      "while_statement",
      "repeat_statement",
      "do_statement",
      "else_clause",
      "elseif_clause",
    ];
    return blockTypes.includes(node.type);
  }

  getLanguageId(): string {
    return "lua";
  }

  /**
   * Selects the entire block represented by the node.
   * @param node The Lua block node
   * @returns The start and end indices of the block
   */
  selectNode(node: Parser.SyntaxNode): { start: number; end: number } | null {
    if (this.isBracketedNode(node)) {
      return { start: node.startIndex, end: node.endIndex };
    }
    return null;
  }
}
