// src/languages/typescriptHandler.ts
import { BaseLanguageHandler, ReturnNode } from "./baseLanguageHandler";
import Parser from "tree-sitter";
import * as vscode from "vscode";
import { Selection } from "../selectionHistory";

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
    let blockTypes = [
      // Existing types
      "jsx_element",
      "jsx_self_closing_element",
      "jsx_fragment",
      "object", // I think is the type "word" object
      "object_type", // TypeScript object types (e.g., { key: value })
      "array", // I think is the type "word" array
      "array_type", // TypeScript array types (e.g., string[])
      "template_string",
      "string",
      "string_fragment",
      "regex",
      "if_statement",

      // Literal types
      "number",
      "boolean",
      "null",
      "undefined",
      "true",
      "false",

      // Function constructs
      "function_declaration", // Function declarations (e.g., function myFunction() {})
      "function_expression", // Function expressions (e.g., function() {})
      "arrow_function",
      "generator_function",
      "generator_function_declaration",

      // Class and interface constructs
      "class_declaration",
      "class_body",
      "interface_declaration",
      "interface_body",

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
      "property_identifier",
      "constructor_declaration",

      // Decorators and annotations
      "decorator",

      // Enum constructs
      "enum_declaration",
      "enum_body",

      // Other relevant constructs
      "import_statement",
      "export_statement",
      "block",
      "try_catch_statement",

      // Expressions
      "parenthesized_expression", // Parenthesized expressions (e.g., (a + b))
      "ternary_expression", // Ternary expressions (e.g., a ? b : c)
      "binary_expression", // Binary expressions (e.g., a + b)
      "unary_expression", // Unary expressions (e.g., !a)
      "prefix_expression", // Prefix expressions (e.g., ++a)
      "postfix_expression", // Postfix expressions (e.g., a++)
      "call_expression", // Function calls (e.g., myFunction())
      "new_expression", // New expressions (e.g., new MyClass())
      "member_expression", // Member expressions (e.g., obj.prop)
      "subscript_expression", // Subscript expressions (e.g., arr[index])
      "assignment_expression", // Assignment expressions (e.g., a = b)
      "update_expression", // Update expressions (e.g., a++)
      "sequence_expression", // Sequence expressions (e.g., a, b)
      "spread_element", // Spread elements (e.g., ...arr)
      "yield_expression", // Yield expressions (e.g., yield value)
      "await_expression", // Await expressions (e.g., await promise)
      "import_expression", // Import expressions (e.g., import('module'))
      "export_expression", // Export expressions (e.g., export { a, b })
      "non_null_expression", // Non-null expressions (e.g., value!)
      "type_assertion", // Type assertions (e.g., <string>value)
      "type_cast", // Type casts (e.g., value as string)

      "arguments",
      "parameters",
      "required_parameter",
      "formal_parameters",

      "identifier", // e.g Variable names
      "nested_type_identifier", // e.g. Type names
      "type_identifier", // e.g. Type names
      "predefined_type", // e.g. Types that are built-in
      "union_type", // e.g. Type unions (e.g. string | number)
      "intersection_type", // e.g. Type intersections (e.g. A & B)
      "type_parameter", // e.g. Type parameters (e.g. T)
      "type_parameters", // e.g. Type parameters (e.g. <T>)
      "type_arguments", // e.g. Type arguments (e.g. <T>)
      "type_alias_declaration", // e.g. Type aliases (e.g. type MyType = string)
      // "type_annotation", // e.g. Type annotations (e.g. const x: number) // This should not be used as it will select too small of a block
      "type_predicate", // e.g. Type predicates (e.g. x is string)
      "type_query", // e.g. Type queries (e.g. typeof x)
      "index_type_query", // e.g. Index type queries (e.g. keyof T)
    ];
    blockTypes = [
      ".",
      "{",
      "}",
      "${",
      "[",
      "]",
      "(",
      ")",
      "<",
      ">",
      "=",
      "+",
      "-",
      "*",
      "/",
      "%",
      "!",
      "~",
      "?",
      ":",
      "&",
      "|",
      "^",
      "<<",
      ">>",
      ">>>",
      "++",
      "--",
      "&&",
      "||",
      "==",
      "!=",
      "===",
      "!==",
      "<",
      ">",
      "<=",
      ">=",
      "in",
      "instanceof",
      "+=",
      "-=",
      "*=",
      "/=",
      "%=",
      "<<=",
      ">>=",
      ">>>=",
      "&=",
      "|=",
      "^=",
      "=>",
      ",",
      ";",
      '"',
      "'",
      "`",
      "/>",
      "</",
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
  selectNode(node: Parser.SyntaxNode, selection: Selection): ReturnNode | null {
    console.log("[bracket-select] -----------------------");
    console.log(`[bracket-select] Root type: ${node.type}`);

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      console.error("[bracket-select] No active editor found.");
      return null;
    }

    const document = editor.document;
    // Put back the opening and closing brackets lengtht that was removed last select
    // It will be 0 most of the time except for when the selection is inside a block
    const open = selection.node ? selection.node.openingBracketLength : 0;
    const close = selection.node ? selection.node.closingBracketLength : 0;
    let selectionStartIndex = document.offsetAt(selection.start) - open;
    let selectionEndIndex = document.offsetAt(selection.end) + close;

    console.log("[bracket-select] Initial Selection Start:", selectionStartIndex, open);
    console.log("[bracket-select] Initial Selection End:", selectionEndIndex, close);

    /**
     * Function to attempt expanding the selection by including adjacent siblings.
     */
    const expandSelectionWithSiblings = (
      currentNode: Parser.SyntaxNode,
      currentStart: number,
      currentEnd: number
    ): { newStart: number; newEnd: number; node: Parser.SyntaxNode } | null => {
      let expandedStart = currentStart;
      let expandedEnd = currentEnd;
      let foundExpansion = false;
      let expansionNode: Parser.SyntaxNode | null = null;

      // Attempt to include previous siblings if no expansion found yet
      let sibling = currentNode.previousSibling;
      while (sibling) {
        console.log(`[bracket-select] Checking previous sibling: ${sibling.type}`);
        if (sibling.endIndex < currentStart || sibling.startIndex > currentEnd || this.isBracketedNode(sibling)) {
          // Sibling is outside the current selection range; skip
          sibling = sibling.previousSibling;
          continue;
        }

        // Expand the selection to include this sibling
        const newStart = Math.min(expandedStart, sibling.startIndex);
        const newEnd = Math.max(expandedEnd, sibling.endIndex);

        if (newStart < expandedStart || newEnd > expandedEnd) {
          console.log(`[bracket-select] Expanding selection to include previous sibling: ${sibling.type}`);
          expandedStart = newStart;
          expandedEnd = newEnd;
          foundExpansion = true;
          expansionNode = sibling;
          break; // Include one sibling at a time
        }

        sibling = sibling.previousSibling;
      }

      // Attempt to include next siblings
      sibling = currentNode.nextSibling;
      while (sibling) {
        console.log(`[bracket-select] Checking next sibling: ${sibling.type}`);
        if (sibling.endIndex < currentStart || sibling.startIndex > currentEnd || this.isBracketedNode(sibling)) {
          // Sibling is outside the current selection range; skip
          sibling = sibling.nextSibling;
          continue;
        }

        // Expand the selection to include this sibling
        const newStart = Math.min(expandedStart, sibling.startIndex);
        const newEnd = Math.max(expandedEnd, sibling.endIndex);

        if (newStart < expandedStart || newEnd > expandedEnd) {
          console.log(`[bracket-select] Expanding selection to include next sibling: ${sibling.type}`);
          expandedStart = newStart;
          expandedEnd = newEnd;
          foundExpansion = true;
          expansionNode = sibling;
          break; // Include one sibling at a time
        }

        sibling = sibling.nextSibling;
      }

      if (foundExpansion && expansionNode) {
        return { newStart: expandedStart, newEnd: expandedEnd, node: expansionNode };
      }

      return null;
    };

    /**
     * Main loop to iteratively expand the selection.
     */
    let expanded = true;
    let returnNode = node;
    let currentStart = selectionStartIndex;
    let currentEnd = selectionEndIndex;

    while (expanded) {
      console.log("[bracket-select] Attempting to find the smallest containing node.");
      if (node.type === "program") {
        console.log("[bracket-select] Program node reached. Exiting loop.");
        break;
      }

      if (node && !this.isBracketedNode(node)) {
        console.log("[bracket-select] Smallest Containing Node:", node.type);
        console.log("[bracket-select] Node Start Index:", node.startIndex);
        console.log("[bracket-select] Node End Index:", node.endIndex);

        // Update the selection to the smallest containing node
        const newStart = Math.min(currentStart, node.startIndex);
        const newEnd = Math.max(currentEnd, node.endIndex);

        if (newStart < currentStart || newEnd > currentEnd) {
          console.log("[bracket-select] Expanding selection to the smallest containing node.");
          currentStart = newStart;
          currentEnd = newEnd;
          returnNode = node;
          break; // Exit the loop if the selection is expanded
        } else {
          console.log("[bracket-select] Selection cannot be expanded further with the smallest containing node.");
        }
      }

      // Attempt to expand the selection with adjacent siblings
      const expansion = expandSelectionWithSiblings(node, currentStart, currentEnd);
      if (expansion) {
        console.log("[bracket-select] Selection expanded with sibling node:", expansion.node.type);
        currentStart = expansion.newStart;
        currentEnd = expansion.newEnd;
        returnNode = expansion.node;
        node = expansion.node;
        break; // Exit the loop if the selection is expanded
      } else {
        console.log("[bracket-select] No further expansion with siblings possible.");
        if (this.isBracketedNode(node)) {
          console.log("[bracket-select] Expanding into the parent node.");
          node = node.parent;
        } else {
          expanded = false; // Exit the loop if no further expansion is possible
        }
      }
    }

    // Placeholder for opening and closing brackets.
    // Currently set to empty strings, but structured for future extension.
    let openingBracket = "";
    let closingBracket = "";

    const bracketList: { open: string; close: string }[] = [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: "<", close: "/>" },
      { open: "<", close: ">" },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
      { open: "`", close: "`" },

      // Add more mappings as needed
    ];
    const newText = document.getText(new vscode.Range(editor.document.positionAt(currentStart), editor.document.positionAt(currentEnd)));
    console.log("Current text:", newText);
    for (const bracket of bracketList) {
      if (newText.startsWith(bracket.open) && newText.endsWith(bracket.close)) {
        openingBracket = bracket.open;
        closingBracket = bracket.close;
        break;
      }
    }

    // Calculate the lengths of the brackets.
    const openingLength = openingBracket.length;
    const closingLength = closingBracket.length;

    console.log(`[bracket-select] Final Node Type: ${node.type} ReturnNode: ${returnNode.type}`);
    console.log("[bracket-select] Final Selection Start:", currentStart);
    console.log("[bracket-select] Final Selection End:", currentEnd);
    console.log("[bracket-select] Opening Bracket:", openingBracket, "Closing Bracket:", closingBracket);

    return {
      returnNode: returnNode,
      start: currentStart,
      end: currentEnd,
      type: returnNode.type,
      openingBracketLength: openingLength,
      closingBracketLength: closingLength,
    };
  }
}
