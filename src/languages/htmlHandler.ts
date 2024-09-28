import { BaseLanguageHandler } from "./baseLanguageHandler";
import Parser from "tree-sitter";

export class HtmlHandler extends BaseLanguageHandler {
  isBracketedNode(node: Parser.SyntaxNode): boolean {
    return node.type === "element" || node.type === "self_closing_element" || node.type === "text";
  }

  getLanguageId(): string {
    return "html";
  }

  selectNode(node: Parser.SyntaxNode): { start: number; end: number } | null {
    if (this.isBracketedNode(node)) {
      return { start: node.startIndex, end: node.endIndex };
    }
    return null;
  }
}
