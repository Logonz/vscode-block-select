// src/languages/luaHandler.ts
import { BaseLanguageHandler, ReturnNode } from "./baseLanguageHandler";
import Parser from "tree-sitter";
import * as vscode from "vscode";
import { Selection } from "../selectionHistory";

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
    let blockTypes = [
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
    blockTypes = [
      ".",
      "{",
      "}",
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
  selectNode(node: Parser.SyntaxNode, selection: Selection): ReturnNode | null {
    console.log("[bracket-select] -----------------------");
    console.log(`[bracket-select] Root type: ${node.type}`);

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      console.error("[bracket-select] No active editor found.");
      return null;
    }

    const document = editor.document;
    let selectionStartIndex = document.offsetAt(selection.start);
    let selectionEndIndex = document.offsetAt(selection.end);

    console.log("[bracket-select] Initial Selection Start:", selectionStartIndex);
    console.log("[bracket-select] Initial Selection End:", selectionEndIndex);

    /**
     * Helper function to determine if a node completely encompasses the selection.
     */
    // const nodeContainsSelection = (node: Parser.SyntaxNode, helper: string): boolean => {
    //   const result = node.startIndex < selectionStartIndex || node.endIndex > selectionEndIndex;
    //   console.log(
    //     `[bracket-select] ${helper} - Node '${node.type}' contains selection: '${result}' - ${node.startIndex} < ${selectionStartIndex} || ${node.endIndex} > ${selectionEndIndex}`
    //   );
    //   return result;
    // };

    /**
     * Recursive function to find the smallest node that contains the selection.
     */
    // const findSmallestContainingNode = (currentNode: Parser.SyntaxNode): Parser.SyntaxNode | null => {
    //   console.log(`[bracket-select] Checking node: ${currentNode.type}`);

    //   if (this.isBracketedNode(currentNode)) {
    //     console.log(`[bracket-select] Node ${currentNode.type} is a bracketed node, skipping.`);
    //     return null;
    //   }

    //   // Check if current node contains the selection
    //   if (!nodeContainsSelection(currentNode, "checkCurrentNode")) {
    //     console.log(`[bracket-select] Node ${currentNode.type} does not contain the selection.`);
    //     return null;
    //   }

    //   // TODO: I removed this code because if a parent node has children we want to just select all childrens
    //   // Iterate through children to find a smaller containing node
    //   // for (const child of currentNode.children) {
    //   //   if (this.isBracketedNode(child)) {
    //   //     continue;
    //   //   }
    //   //   if (nodeContainsSelection(child, "checkChildNode")) {
    //   //     console.log(`[bracket-select] Child node ${child.type} contains selection, recursing.`);
    //   //     const found = findSmallestContainingNode(child);
    //   //     if (found) {
    //   //       return found;
    //   //     }
    //   //   }
    //   // }

    //   // If no child contains the selection, current node is the smallest containing node
    //   console.log(`[bracket-select] Current node ${currentNode.type} is the smallest containing node.`);
    //   return currentNode;
    // };

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
      // if (!foundExpansion || foundExpansion) {
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
      // }

      // Attempt to include next siblings
      // if (!foundExpansion) {
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
      // }

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
      // const smallestNode = findSmallestContainingNode(node);

      // if (!smallestNode) {
      //   console.log("[bracket-select] No containing node found. Expanding into the parent node.");
      //   node = node.parent;
      //   continue; // Skip the rest of the loop and try again with the parent node
      //   // break;
      // }

      if (node && !this.isBracketedNode(node) && node.type  !== "program") {
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
      if (node.type === "program") {
        console.log("[bracket-select] Program node reached. Exiting loop.");
        break;
      }
    }

    // Placeholder for opening and closing brackets.
    // Currently set to empty strings, but structured for future extension.
    let openingBracket = "";
    let closingBracket = "";

    // Future-proof: Define specific brackets based on node types if needed.
    // Example:
    // const bracketMap: { [key: string]: { open: string; close: string } } = {
    //   "object": { open: "{", close: "}" },
    //   "array": { open: "[", close: "]" },
    //   "arguments": { open: "(", close: ")" },
    //   "parameter": { open: "(", close: ")" },

    //   // Add more mappings as needed
    // };

    // if (bracketMap[node.type]) {
    //   openingBracket = bracketMap[node.type].open;
    //   closingBracket = bracketMap[node.type].close;
    // }

    // Validate the presence of brackets in the node's text.
    // Since brackets are currently empty, this section is effectively skipped.
    // It's structured for future use when brackets are defined.

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
      type: "expanded_selection", // You can adjust this type as needed
      openingBracketLength: openingLength,
      closingBracketLength: closingLength,
    };
  }
}
