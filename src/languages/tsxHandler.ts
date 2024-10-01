// src/languages/tsxHandler.ts
import { BaseLanguageHandler, ReturnNode } from "./baseLanguageHandler";
import Parser from "tree-sitter";
import * as vscode from "vscode";
import { Selection } from "../selectionHistory";

export class TsxHandler extends BaseLanguageHandler {
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

      // JSX-Specific Constructs
      "jsx_fragment",
      "jsx_expression",
      "jsx_opening_element",
      "jsx_closing_element",
      "jsx_attribute",
      "jsx_attribute_value",
      "jsx_spread_attribute",
      "jsx_text",
      "jsx_self_closing_element",
      "jsx_opening_fragment",
      "jsx_closing_fragment",
      "jsx_self_closing_fragment",
      "jsx_expression_container",

      // Function Constructs
      "function_declaration",
      "function_expression",
      "arrow_function",
      "generator_function",
      "async_function",
      "async_arrow_function",
      "generator_function_declaration",
      "async_function_declaration",

      // Class and Object Constructs
      "class_declaration",
      "class_body",
      "method_definition",
      "constructor",
      "object_method",
      "property_identifier",
      "class_property",
      "static_class_property",
      "computed_property_name",
      "decorator",

      // Control Flow Constructs
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

      // Module and Import/Export Constructs
      "import_statement",
      "export_statement",
      "export_default_statement",
      "export_named_declaration",
      "export_all_declaration",

      // Asynchronous Constructs
      "await_expression",

      // Error Handling Constructs
      "throw_statement",

      // Other Relevant Constructs
      "block",
      "conditional_expression",
    ];
    return blockTypes.includes(node.type);
  }

  // getLanguageId(): string {
  //   return "tsx";
  // }

  /**
   * Selects the entire block represented by the node.
   * @param node The Tsx block node
   * @returns The start and end indices of the block
   */
  selectNode(node: Parser.SyntaxNode, selection: Selection): ReturnNode | null {
    while (node) {
      console.log("SELECT NODE TYPE", node.type);
      if (this.isBracketedNode(node)) {
        return { returnNode: node, start: node.startIndex, end: node.endIndex, type: node.type, openingBracketLength: 1, closingBracketLength: 1 };
      }
      node = node.parent;
    }
    return null;
  }
}
