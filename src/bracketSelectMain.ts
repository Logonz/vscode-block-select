// bracketSelectMain.ts
"use strict";

import * as vscode from "vscode";
import { bracketUtil } from "./bracketUtil";
import * as history from "./selectionHistory";
import Parser from "tree-sitter";
import { TreeSitterUtil } from "./treeSitterUtil"; // Import the Tree-sitter utility

// Handlers
import { BaseLanguageHandler, ReturnNode } from "./languages/baseLanguageHandler"; // Import your language handlers
import { GoHandler } from "./languages/goHandler";
import { HtmlHandler } from "./languages/htmlHandler";
import { JavascriptHandler } from "./languages/javascriptHander";
import { LuaHandler } from "./languages/luaHandler";
import { PhpHandler } from "./languages/phpHandler";
import { PythonHandler } from "./languages/pythonHandler";
import { TsxHandler } from "./languages/tsxHandler";
import { TypescriptHandler } from "./languages/typescriptHandler";

export const treeSitterUtil = new TreeSitterUtil();

// Initialize the languageHandlers map
const languageHandlers: Map<string, BaseLanguageHandler> = new Map();

// Register your language handlers
// languageHandlers.set("html", new HtmlHandler(treeSitterUtil));
languageHandlers.set("javascript", new JavascriptHandler(treeSitterUtil));
languageHandlers.set("typescript", new TypescriptHandler(treeSitterUtil));
languageHandlers.set("typescriptreact", new TypescriptHandler(treeSitterUtil));
languageHandlers.set("python", new PythonHandler(treeSitterUtil));
languageHandlers.set("php", new PhpHandler(treeSitterUtil));
languageHandlers.set("lua", new LuaHandler(treeSitterUtil));
languageHandlers.set("go", new GoHandler(treeSitterUtil));
// Register other handlers similarly, e.g., languageHandlers.set("javascript", new JavaScriptHandler(treeSitterUtil));

class SearchResult {
  bracket: string;
  offset: number;

  constructor(bracket: string, offset: number) {
    this.bracket = bracket;
    this.offset = offset;
  }
}

/**
 * Attempts to find a matching bracket backward using the default method.
 * @param text The entire text
 * @param index The starting index to search backward from
 * @returns A SearchResult or null
 */
function findBackward(text: string, index: number): SearchResult | null {
  console.log("findBackward called with index:", index);
  const bracketStack: string[] = [];
  for (let i = index; i >= 0; i--) {
    let char = text.charAt(i);
    // Handle same brackets (e.g., quotes)
    if (bracketUtil.isSameBracket(char) && bracketStack.length === 0) {
      return new SearchResult(char, i);
    }
    if (bracketUtil.isOpenBracket(char)) {
      if (bracketStack.length === 0) {
        return new SearchResult(char, i);
      } else {
        let top = bracketStack.pop();
        if (!bracketUtil.isMatch(char, top)) {
          console.log("Mismatched brackets:", char, top);
          // Optionally, handle mismatched brackets gracefully
        }
      }
    } else if (bracketUtil.isCloseBracket(char)) {
      bracketStack.push(char);
    }
  }
  // Reached the beginning without finding a match
  return null;
}

/**
 * Attempts to find a matching bracket forward using the default method.
 * @param text The entire text
 * @param index The starting index to search forward from
 * @returns A SearchResult or null
 */
function findForward(text: string, index: number): SearchResult | null {
  console.log("findForward called with index:", index);
  const bracketStack: string[] = [];
  for (let i = index; i < text.length; i++) {
    let char = text.charAt(i);
    // Handle same brackets (e.g., quotes)
    if (bracketUtil.isSameBracket(char) && bracketStack.length === 0) {
      return new SearchResult(char, i);
    }
    if (bracketUtil.isCloseBracket(char)) {
      if (bracketStack.length === 0) {
        return new SearchResult(char, i);
      } else {
        let top = bracketStack.pop();
        if (!bracketUtil.isMatch(top, char)) {
          console.log("Mismatched brackets:", top, char);
          // This should never be enabled on a release, but it is a good debug tool - keeping it.
          // throw new Error("Unmatched bracket pair");
        }
      }
    } else if (bracketUtil.isOpenBracket(char)) {
      bracketStack.push(char);
    }
  }
  // Reached the end without finding a match
  return null;
}

function getSearchContext(selection: vscode.Selection) {
  const editor = vscode.window.activeTextEditor;
  let selectionStart = editor.document.offsetAt(selection.start);
  let selectionEnd = editor.document.offsetAt(selection.end);
  return {
    backwardStarter: selectionStart - 1, // Coverage VS Code selection index to text index
    forwardStarter: selectionEnd,
    text: editor.document.getText(),
  };
}

function toVscodeSelection({ start, end }: { start: number; end: number }): vscode.Selection {
  const editor = vscode.window.activeTextEditor;
  return new vscode.Selection(
    editor.document.positionAt(start), // No adjustment
    editor.document.positionAt(end)
  );
}

function isMatch(r1: SearchResult | null, r2: SearchResult) {
  return r1 != null && r2 != null && bracketUtil.isMatch(r1.bracket, r2.bracket);
}

let lastExpandedNode: Parser.SyntaxNode | null = null;
export function expandSelection(includeBrackets: boolean) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    console.log("Debug: No active editor found");
    return;
  }

  const languageId = editor.document.languageId;
  console.log(`Debug: Language ID: ${languageId}`);

  treeSitterUtil.setLanguage(languageId);
  const tree = treeSitterUtil.parse(editor.document.getText());
  console.log("Debug: Tree-sitter parse completed");

  const handler = languageHandlers.get(languageId);
  if (!handler || !treeSitterUtil.isLanguageSupported(languageId)) {
    console.log(`Debug: No handler found for language: ${languageId}`);
    // Fallback to existing selection logic
    handleFallbackSelection(includeBrackets, editor);
    return;
  }

  if (history.editorSelections.length === 0) {
    history.editorSelections.push(new history.Selection(editor.selections[0].anchor, editor.selections[0].active, undefined));
  }

  const newSelections: history.Selection[] = [];

  for (const selection of history.editorSelections) {
    console.log(`bracket-select: Processing selection: ${JSON.stringify(selection)}`);
    let node: Parser.SyntaxNode;
    // cast selection to a Selection
    console.log(`bracket-select: Selection: ${selection.node ? selection.node.type : 'null'}`);
    // if (lastExpandedNode == null || selection.isEmpty) {
    const cursorPosition = selection.active;
    const offset = editor.document.offsetAt(cursorPosition);
    node = tree.rootNode.descendantForIndex(offset);
    console.log(`bracket-select: Found node at offset ${offset}: ${node.type}`);
    // } else {
    //   node = lastExpandedNode;
    // }

    let targetNode = handler.selectNode(node, selection);

    console.log(`bracket-select: Handler selected node: ${targetNode ? targetNode.type : "null"}`);

    if (!targetNode && selection.isEmpty) {
      console.log("bracket-select: Falling back to bracket-based selection");
      // Fallback to bracket-based selection if Tree-sitter doesn't find a node
      targetNode = fallbackBracketSelection(includeBrackets, selection);
    }

    if (targetNode) {
      console.log(`bracket-select: Creating new selection for node: ${targetNode.type}, start: ${targetNode.start}, end: ${targetNode.end}`);
      // if (targetNode && targetNode.returnNode) {
      //   console.log(`bracket-select: Setting last node to: ${targetNode.returnNode.type}`);
      //   lastExpandedNode = targetNode.returnNode;
      // }

      // TODO: Fix this for languages like Lua where selecting does not select the full "for" but "or" because we
      // TODO: Are reducing the selection to the node. This should probably only be a feature for brackets.
      // TODO: Idea is to do it within the selectNode, we might be able to extract how big the "brackets" are

      // TODO: 2 : We have the check that the selection is not smaller than previous selection
      let newSelection: history.Selection;
      if (includeBrackets) {
        newSelection = new history.Selection(editor.document.positionAt(targetNode.start), editor.document.positionAt(targetNode.end), targetNode);
      } else {
        newSelection = new history.Selection(
          editor.document.positionAt(targetNode.start + targetNode.openingBracketLength),
          editor.document.positionAt(targetNode.end - targetNode.closingBracketLength),
          targetNode
        );
      }

      // Check if the new selection is the same as the old one
      if (newSelection.isEqual(selection)) {
        console.log("bracket-select: New selection is the same as the old one, expanding selection to include brackets");
        newSelection = new history.Selection(editor.document.positionAt(targetNode.start), editor.document.positionAt(targetNode.end), targetNode);
      }
      newSelections.push(newSelection);
    } else {
      console.log("bracket-select: No target node found, keeping original selection");
      newSelections.push(new history.Selection(selection.anchor, selection.active, undefined));
    }
  }

  if (newSelections.length > 0) {
    console.log(`bracket-select: Changing selections, count: ${newSelections.length}`);
    history.changeSelections(newSelections);
  } else {
    console.log("bracket-select: No new selections to apply");
  }
}

function selectText(includeBrack: boolean, selection: vscode.Selection): { start: number; end: number } | { start: number; end: number }[] | void {
  const searchContext = getSearchContext(selection);
  let { text, backwardStarter, forwardStarter } = searchContext;
  if (backwardStarter < 0 || forwardStarter >= text.length) {
    return;
  }

  let selectionStart: number, selectionEnd: number;

  // Attempt Tree-sitter based selection first
  const treeSitterSelections = selectWithTreeSitter(selection);
  if (treeSitterSelections && treeSitterSelections.length > 0) {
    return treeSitterSelections.map((sel) => ({
      start: sel.start,
      end: sel.end,
    }));
  }

  // Fall back to default bracket selection
  var backwardResult = findBackward(searchContext.text, searchContext.backwardStarter);
  var forwardResult = findForward(searchContext.text, searchContext.forwardStarter);

  while (forwardResult != null && !isMatch(backwardResult, forwardResult) && bracketUtil.isSameBracket(forwardResult.bracket)) {
    forwardResult = findForward(searchContext.text, forwardResult.offset + 1);
  }
  while (backwardResult != null && !isMatch(backwardResult, forwardResult) && bracketUtil.isSameBracket(backwardResult.bracket)) {
    backwardResult = findBackward(searchContext.text, backwardResult.offset - 1);
  }

  if (isMatch(backwardResult, forwardResult)) {
    // Perform standard bracket selection
    if (backwardStarter === backwardResult.offset && forwardResult.offset === forwardStarter) {
      selectionStart = backwardStarter;
      selectionEnd = forwardStarter + 1;
    } else {
      if (includeBrack) {
        selectionStart = backwardResult.offset;
        selectionEnd = forwardResult.offset + 1;
      } else {
        selectionStart = backwardResult.offset + 1;
        selectionEnd = forwardResult.offset;
      }
    }

    return {
      start: selectionStart,
      end: selectionEnd,
    };
  }

  // No selection found
  console.log("No matched bracket pairs found");
  return;
}

/**
 * Attempts to select using Tree-sitter for both regular and multi-character brackets.
 * @param selection The current VS Code selection
 * @returns An array of objects containing the start and end indices of the selection, or undefined if not found
 */
function selectWithTreeSitter(selection: vscode.Selection): { start: number; end: number }[] | undefined {
  console.log("Entering selectWithTreeSitter function");
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    console.log("No active editor found");
    return undefined;
  }

  const languageId = editor.document.languageId;
  console.log("Language ID:", languageId);

  if (!treeSitterUtil.isLanguageSupported(languageId)) {
    console.log("Language is not supported");
    return undefined;
  }

  treeSitterUtil.setLanguage(languageId);

  const text = editor.document.getText();
  const tree = treeSitterUtil.parse(text);
  console.log("Tree parsed successfully");

  const selections: { start: number; end: number }[] = [];

  editor.selections.forEach((vscodeSelection, index) => {
    const cursorPosition = vscodeSelection.active;
    const offset = editor.document.offsetAt(cursorPosition);
    console.log(`Cursor position: ${cursorPosition}, Offset: ${offset}`);
    const node = tree.rootNode.descendantForIndex(offset);
    console.log(`Initial node: ${node.type}`);

    if (vscodeSelection.isEmpty) {
      // No selection, select the smallest node
      const smallestNode = node;
      console.log(`Selecting smallest node: ${smallestNode.type} (${smallestNode.startIndex}, ${smallestNode.endIndex})`);
      selections.push({
        start: smallestNode.startIndex,
        end: smallestNode.endIndex,
      });
    } else {
      let targetNode;
      const handler = languageHandlers.get(languageId);
      if (handler) {
        // Use the language handler to select the node
        targetNode = handler.selectNode(node, undefined);
      } else {
        console.log("No handler found for language:", languageId);
      }

      // There is a selection, find the parent node
      const selectedStart = editor.document.offsetAt(vscodeSelection.start);
      const selectedEnd = editor.document.offsetAt(vscodeSelection.end);

      // Find the node that fully encompasses the current selection
      // const encompassingNode = tree.rootNode.descendantForIndex(selectedStart);
      if (!targetNode && selection.isEmpty) {
        // Fallback to bracket-based selection if Tree-sitter doesn't find a node
        targetNode = tree.rootNode.descendantForIndex(selectedStart);
      }
      if (targetNode && targetNode.startIndex <= selectedStart && targetNode.endIndex >= selectedEnd) {
        console.log(`Selected node: ${targetNode.type} (${targetNode.startIndex}, ${targetNode.endIndex})`);

        const parentNode = targetNode.parent;
        if (parentNode && parentNode.type !== targetNode.type) {
          // prevent selecting the same type
          console.log(`Selecting parent node: ${parentNode.type} (${parentNode.startIndex}, ${parentNode.endIndex})`);
          selections.push({
            start: parentNode.startIndex,
            end: parentNode.endIndex,
          });
        } else {
          console.log("No parent node found or same type, cannot select further.");
        }
      } else {
        console.log("No encompassing node found or selection outside node boundaries.");
      }
    }
  });

  if (selections.length > 0) {
    console.log("Selected nodes:", JSON.stringify(selections));
    return selections;
  }

  console.log("No Tree-sitter based selection found");
  return undefined;
}

/**
 * Handles fallback bracket-based selection when no language-specific handler is found.
 * @param includeBrackets Whether to include brackets in the selection
 * @param editor The active text editor
 */
function handleFallbackSelection(includeBrackets: boolean, editor: vscode.TextEditor) {
  let originSelections = editor.selections;

  let selections = originSelections.flatMap((originSelection) => {
    const newSelect = selectText(includeBrackets, originSelection);
    if (Array.isArray(newSelect)) {
      return newSelect.map(toVscodeSelection);
    }
    if (newSelect) {
      const vscodeSelection = toVscodeSelection(newSelect);
      return new history.Selection(vscodeSelection.anchor, vscodeSelection.active, undefined);
    } else {
      return new history.Selection(originSelection.anchor, originSelection.active, undefined);
    }
    // return newSelect ? toVscodeSelection(newSelect) : originSelection;
  });

  let haveChange = selections.findIndex((s, i) => !s.isEqual(originSelections[i])) >= 0;
  if (haveChange) {
    history.changeSelections(selections as unknown as readonly history.Selection[]);
  }
}
/**
 * Performs fallback bracket-based selection.
 * @param includeBrackets Whether to include brackets in the selection
 * @param selection The current selection
 * @returns The new selection range or undefined
 */
function fallbackBracketSelection(includeBrackets: boolean, selection: vscode.Selection): ReturnNode | undefined {
  const searchContext = getSearchContext(selection);
  let { text, backwardStarter, forwardStarter } = searchContext;
  if (backwardStarter < 0 || forwardStarter >= text.length) {
    return;
  }

  let selectionStart: number, selectionEnd: number;

  // Fall back to default bracket selection
  var backwardResult = findBackward(searchContext.text, searchContext.backwardStarter);
  var forwardResult = findForward(searchContext.text, searchContext.forwardStarter);

  while (forwardResult != null && !isMatch(backwardResult, forwardResult) && bracketUtil.isSameBracket(forwardResult.bracket)) {
    forwardResult = findForward(searchContext.text, forwardResult.offset + 1);
  }
  while (backwardResult != null && !isMatch(backwardResult, forwardResult) && bracketUtil.isSameBracket(backwardResult.bracket)) {
    backwardResult = findBackward(searchContext.text, backwardResult.offset - 1);
  }

  if (isMatch(backwardResult, forwardResult)) {
    // Perform standard bracket selection
    if (backwardStarter === backwardResult.offset && forwardResult.offset === forwardStarter) {
      selectionStart = backwardStarter;
      selectionEnd = forwardStarter + 1;
    } else {
      if (includeBrackets) {
        selectionStart = backwardResult.offset;
        selectionEnd = forwardResult.offset + 1;
      } else {
        selectionStart = backwardResult.offset + 1;
        selectionEnd = forwardResult.offset;
      }
    }

    return {
      returnNode: null,
      start: selectionStart,
      end: selectionEnd,
      type: "bracket",
      openingBracketLength: backwardResult.bracket.length,
      closingBracketLength: forwardResult.bracket.length,
    };
  }

  // No selection found
  console.log("No matched bracket pairs found");
  return;
}

