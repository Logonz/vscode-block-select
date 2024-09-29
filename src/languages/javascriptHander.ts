// src/languages/javascriptHandler.ts
import { BaseLanguageHandler } from "./baseLanguageHandler";
import Parser from "tree-sitter";
import * as vscode from "vscode";

export class JavascriptHandler extends BaseLanguageHandler {
  isBracketedNode(node: Parser.SyntaxNode): boolean {
    // const blockTypes = [
    //   "jsx_element",
    //   "jsx_self_closing_element",
    //   "string",
    //   "parenthesized_expression",
    //   "object",
    //   "array",
    //   "template_string",
    //   "string_fragment",
    //   "regex",
    // ];
    const blockTypes = [
      // Existing types
      "jsx_element",
      "jsx_self_closing_element",
      "string",
      "parenthesized_expression",
      "object",
      "array",
      "template_string",
      "string_fragment",
      "regex",
      "if_statement",

      // Function constructs
      "function_declaration",
      "function_expression",
      "arrow_function",
      "generator_function",
      "async_function",

      // Class and object constructs
      "class_declaration",
      "class_body",
      "method_definition",
      "constructor",
      "object_method",
      "property_identifier",
      "class_property",
      "static_class_property",
      "computed_property_name",

      // Control flow constructs
      "for_statement",
      "for_in_statement",
      "for_of_statement",
      "while_statement",
      "do_statement",
      "switch_statement",
      "case_clause",
      "default_clause",
      "try_statement",
      "catch_clause",
      "finally_clause",

      "statement_block",

      // Module and import/export constructs
      "import_statement",
      "export_statement",
      "export_default_statement",
      "export_named_declaration",
      "export_all_declaration",

      // Asynchronous constructs
      "await_expression",
      "async_arrow_function",

      // Error handling constructs
      "throw_statement",

      // Other relevant constructs
      "block",
      "conditional_expression",
      "generator_function_declaration",
      "async_function_declaration",
    ];
    return blockTypes.includes(node.type);
  }

  // getLanguageId(): string {
  //   return "javascript";
  // }

  /**
   * Selects the entire block represented by the node.
   * @param node The Javascript block node
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
