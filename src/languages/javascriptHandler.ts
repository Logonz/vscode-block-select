import { BaseLanguageHandler } from "./baseLanguageHandler";
import Parser from "tree-sitter";

export class JavaScriptHandler extends BaseLanguageHandler {
  isBracketedNode(node: Parser.SyntaxNode): boolean {
    return node.type === "jsx_element" || node.type === "jsx_self_closing_element" || node.type === "string";
  }

  getLanguageId(): string {
    return "javascript";
  }

  selectNode(node: Parser.SyntaxNode): { start: number; end: number } | null {
    if (this.isBracketedNode(node)) {
      return { start: node.startIndex, end: node.endIndex };
    }
    return null;
  }
}
