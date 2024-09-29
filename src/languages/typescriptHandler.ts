// src/languages/typescriptHandler.ts
import { BaseLanguageHandler } from "./baseLanguageHandler";
import Parser from "tree-sitter";
import * as vscode from "vscode";

export class TypescriptHandler extends BaseLanguageHandler {
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
    //   "if_statement",
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

      // Class and interface constructs
      "class_declaration",
      "class_body",
      "interface_declaration",
      "type_alias_declaration",

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

      "statement_block",

      // Module and namespace constructs
      "namespace_declaration",
      "module_declaration",

      // Class members and properties
      "method_definition",
      "property_signature",
      "constructor_declaration",

      // Decorators and annotations
      "decorator",

      // Enum constructs
      "enum_declaration",

      // Other relevant constructs
      "import_statement",
      "export_statement",
      "block",
      "try_catch_statement",
      "conditional_expression",

      "arguments",
    ];
    return blockTypes.includes(node.type);
  }

  // getLanguageId(): string {
  //   return "typescript";
  // }

  /**
   * Selects the entire block represented by the node.
   * @param node The Typescript block node
   * @returns The start and end indices of the block
   */
  selectNode(
    node: Parser.SyntaxNode,
    selection: vscode.Selection
  ): { start: number; end: number; type: string; openingBracketLength: number; closingBracketLength: number } | null {
    while (node) {
      console.log("SELECT NODE TYPE", node.type);
      console.log("Start Index:", node.startIndex);
      console.log("End Index:", node.endIndex);
      const editor = vscode.window.activeTextEditor;
      const selectionStartIndex = editor.document.offsetAt(selection.start);
      const selectionEndIndex = editor.document.offsetAt(selection.end);
      console.log("Selection Start:", selectionStartIndex);
      console.log("Selection End:", selectionEndIndex);

      if (this.isBracketedNode(node) && ((node.startIndex <= selectionStartIndex && selectionEndIndex <= node.endIndex) || selection === undefined)) {
              return { start: node.startIndex, end: node.endIndex, type: node.type, openingBracketLength: 1, closingBracketLength: 1 };
            }
      node = node.parent;
    }
    return null;
  }
}
