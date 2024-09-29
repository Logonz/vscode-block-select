// src/languages/phpHandler.ts
import { BaseLanguageHandler } from "./baseLanguageHandler";
import Parser from "tree-sitter";
import * as vscode from "vscode";

export class PhpHandler extends BaseLanguageHandler {
  isBracketedNode(node: Parser.SyntaxNode): boolean {
    // const blockTypes = ["element", "self_closing_element", "text", "tag"];
    const blockTypes = [
      // Existing types (aligned with PHP)
      "element",
      "self_closing_element",
      "text",
      "tag",

      // Class and Object Constructs
      "class_declaration",
      "class_body",
      "interface_declaration",
      "trait_declaration",
      "method_declaration",
      "property_declaration",
      "constructor_declaration",
      "destructor_declaration",
      "anonymous_class_creation_expression",

      // Function Constructs
      "function_definition",
      "anonymous_function_creation_expression",
      "arrow_function",

      // Control Flow Constructs
      "if_statement",
      "else_clause",
      "elseif_clause",
      "for_statement",
      "foreach_statement",
      "while_statement",
      "do_statement",
      "switch_statement",
      "case_statement",
      "default_clause",
      "try_statement",
      "catch_clause",
      "finally_clause",

      // Namespace and Use Constructs
      "namespace_definition",
      "use_declaration",
      "group_use_declaration",

      // Variable and Property Constructs
      "variable_name",
      "property_name",
      "static_property_access_expression",
      "property_access_expression",

      // Other Relevant Constructs
      "include_expression",
      "include_once_expression",
      "global_statement",
      "echo_statement",
      "print_expression",
      "return_statement",
      "throw_statement",
      "block",
      "inline_html",
      "declare_statement",
      "goto_statement",
      "label",
      "break_statement",
      "continue_statement",

      // Exception and Error Handling Constructs
      "error_control_expression",
      "instanceof_expression",
    ];
    return blockTypes.includes(node.type);
  }

  // getLanguageId(): string {
  //   return "php";
  // }

  /**
   * Selects the entire block represented by the node.
   * @param node The Php block node
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
