// src/languages/luaHandler.ts
import { BaseLanguageHandler, ReturnNode } from "./baseLanguageHandler";
import Parser from "tree-sitter";
import * as vscode from "vscode";

export class LuaHandler extends BaseLanguageHandler {
  isBracketedNode(node: Parser.SyntaxNode): boolean {
    // const blockTypes = [
    //   "if_statement",
    //   "function_definition",
    //   "for_statement",
    //   "while_statement",
    //   "repeat_statement",
    //   "do_statement",
    //   "else_clause",
    //   "elseif_clause",
    //   "string",
    // ];
    const blockTypes = [
      // Control Flow Constructs
      "if_statement",
      "elseif_clause",
      "else_clause",
      "for_generic_statement",
      "for_numeric_statement",
      "while_statement",
      "repeat_statement",
      "do_statement",
      "goto_statement",
      "break_statement",
      "label_statement",

      // Function Constructs
      "function_definition",
      "local_function_definition_statement",
      "function_definition_statement",
      "call",

      // Return and Assignment Constructs
      "return_statement",
      "variable_assignment",
      "local_variable_declaration",

      // Declarations and Blocks
      "block",
      "chunk",

      // Expressions
      "expression",
      "binary_expression",
      "unary_expression",
      "prefix_expression",
      "vararg_expression",

      // Function Calls and Arguments
      "argument_list",

      // Variables and Identifiers
      "variable",
      "variable_list",

      // Literals
      "string",
      "number",
      "nil",
      "true",
      "false",

      // Comments
      "comment",

      // Other Relevant Constructs
      // Add any other constructs that are relevant to your selection logic
    ];
    return blockTypes.includes(node.type);
  }

  // getLanguageId(): string {
  //   return "lua";
  // }

  /**
   * Selects the entire block represented by the node.
   * @param node The Lua block node
   * @returns The start and end indices of the block
   */
  selectNode(node: Parser.SyntaxNode, selection: vscode.Selection): ReturnNode | null {
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
        // Determine the type of block to identify brackets
        let openingBracket = "";
        let closingBracket = "";

        switch (node.type) {
          case "if_statement":
            openingBracket = "if";
            closingBracket = "end";
            break;
          case "elseif_clause":
            openingBracket = "elseif";
            closingBracket = "end";
            break;
          case "else_clause":
            openingBracket = "else";
            closingBracket = "end";
            break;
          case "for_generic_statement":
          case "for_numeric_statement":
            openingBracket = "for";
            closingBracket = "end";
            break;
          case "while_statement":
            openingBracket = "while";
            closingBracket = "end";
            break;
          case "repeat_statement":
            openingBracket = "repeat";
            closingBracket = "until";
            break;
          case "local_function_definition_statement":
            openingBracket = "local function";
            closingBracket = "end";
            break;
          case "function_definition":
          case "function_definition_statement":
            openingBracket = "function";
            closingBracket = "end";
            break;
          case "do_statement":
            openingBracket = "do";
            closingBracket = "end";
            break;
          case "goto_statement":
            // Goto statements do not have a closing bracket
            openingBracket = "goto";
            closingBracket = "";
            break;
          case "block":
            // Generic block, assume 'do' ... 'end' if applicable
            openingBracket = "do";
            closingBracket = "end";
            break;
          // Add more cases as needed for other Lua constructs
          default:
            // Fallback to standard brackets or ignore if not applicable
            openingBracket = "";
            closingBracket = "";
        }

        // Check that the opening and closing brackets are present in node.text
        // We should be able to find it at the start and end of the node.text
        if (!node.text.startsWith(openingBracket)) {
          console.log("Opening " + openingBracket + " bracket not found in node.text");
          console.log("node.text", node.text.slice(0, 50));
          openingBracket = "";
        }
        if (!node.text.endsWith(closingBracket)) {
          console.log("Opening " + closingBracket + " bracket not found in node.text");
          console.log("node.text", node.text.slice(0, 50));
          closingBracket = "";
        }

        const openingLength = openingBracket.length;
        const closingLength = closingBracket.length;

        return {
          returnNode: node,
          start: node.startIndex,
          end: node.endIndex,
          type: node.type,
          openingBracketLength: openingLength,
          closingBracketLength: closingLength,
        };
      }
      node = node.parent;
    }
    return null;
  }
}
