// src/languages/htmlHandler.ts
import { BaseLanguageHandler, ReturnNode } from "./baseLanguageHandler";
import Parser from "tree-sitter";
import * as vscode from "vscode";

export class HtmlHandler extends BaseLanguageHandler {
  isBracketedNode(node: Parser.SyntaxNode): boolean {
    // const blockTypes = ["element", "self_closing_element", "text", "tag", "script", "style", "comment", "doctype", "attribute", "attribute_name", "attribute_value"];
    const blockTypes = [
      // Structural Constructs
      "document",
      "element",
      "self_closing_tag",
      "start_tag",
      "end_tag",
      "erroneous_end_tag",
      "erroneous_end_tag_name",
      "script_element",
      "style_element",
      "doctype",

      // Content Constructs
      "text",
      "raw_text",
      "comment",
      "entity",

      // Attribute Constructs
      "attribute",
      "attribute_name",
      "attribute_value",
      "quoted_attribute_value",
    ];
    return blockTypes.includes(node.type);
  }

  // getLanguageId(): string {
  //   return "html";
  // }

  /**
   * Selects the entire block represented by the node.
   * @param node The Html block node
   * @returns The start and end indices of the block
   */
  selectNode(
    node: Parser.SyntaxNode,
    selection: vscode.Selection
  ): ReturnNode | null {
    // TODO: HTML Handler is FUBAR, it worked way back before...
    // while (node) {
    //   console.log("SELECT NODE TYPE", node.type);
    //   if (this.isBracketedNode(node)) {
    //     return { start: node.startIndex, end: node.endIndex, type: node.type };
    //   }
    //   node = node.parent;
    // }
    // return null;
    if (this.isBracketedNode(node)) {
      return { returnNode: node, start: node.startIndex, end: node.endIndex, type: node.type, openingBracketLength: 1, closingBracketLength: 1 };
    }
    return null;
  }
}
