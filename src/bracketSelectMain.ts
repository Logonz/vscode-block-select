// bracketSelectMain.ts
"use strict";

import * as vscode from "vscode";
import { bracketUtil } from "./bracketUtil";
import * as history from "./selectionHistory";
import Parser from "tree-sitter";
import { TreeSitterUtil } from "./treeSitterUtil"; // Import the Tree-sitter utility

const treeSitterUtil = new TreeSitterUtil();

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
          throw new Error("Unmatched bracket pair");
        }
      }
    } else if (bracketUtil.isOpenBracket(char)) {
      bracketStack.push(char);
    }
  }
  // Reached the end without finding a match
  return null;
}

function showInfo(msg: string): void {
  vscode.window.showInformationMessage(msg);
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

function isMatch(r1: SearchResult, r2: SearchResult) {
  return r1 != null && r2 != null && bracketUtil.isMatch(r1.bracket, r2.bracket);
}

function expandSelection(includeBrack: boolean) {
  const editor = vscode.window.activeTextEditor;
  let originSelections = editor.selections;

  let selections = originSelections.flatMap((originSelection) => {
    const newSelect = selectText(includeBrack, originSelection);
    if (Array.isArray(newSelect)) {
      return newSelect.map(toVscodeSelection);
    }
    return newSelect ? toVscodeSelection(newSelect) : originSelection;
  });

  let haveChange = selections.findIndex((s, i) => !s.isEqual(originSelections[i])) >= 0;
  if (haveChange) {
    history.changeSelections(selections);
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

  if(!treeSitterUtil.isLanguageSupported(languageId)) {
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
      // There is a selection, find the parent node
      const selectedStart = editor.document.offsetAt(vscodeSelection.start);
      const selectedEnd = editor.document.offsetAt(vscodeSelection.end);

      // Find the node that fully encompasses the current selection
      const encompassingNode = tree.rootNode.descendantForIndex(selectedStart);
      if (encompassingNode && encompassingNode.startIndex <= selectedStart && encompassingNode.endIndex >= selectedEnd) {
        console.log(`Selected node: ${encompassingNode.type} (${encompassingNode.startIndex}, ${encompassingNode.endIndex})`);

        const parentNode = encompassingNode.parent;
        if (parentNode && parentNode.type !== encompassingNode.type) {
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

//Main extension point
export function activate(context: vscode.ExtensionContext) {
  console.log("Extension 'block-select' is now active!");
  // Initial load
  console.log("Refreshing config...");
  bracketUtil.refreshConfig();
  console.log("Config refreshed");

  // Listen for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      console.log("Configuration changed");
      if (event.affectsConfiguration("block-select.bracketPairs") || event.affectsConfiguration("block-select.sameBracket")) {
        console.log("Refreshing config due to relevant changes");
        bracketUtil.refreshConfig();
      }
    })
  );

  // Register commands
  console.log("Registering commands...");
  context.subscriptions.push(
    vscode.commands.registerCommand("block-select.select", function () {
      console.log("Executing block-select.select command");
      expandSelection(false);
    }),
    vscode.commands.registerCommand("block-select.undo-select", function () {
      console.log("Executing block-select.undo-select command");
      history.unDoSelect();
    }),
    vscode.commands.registerCommand("block-select.select-include", function () {
      console.log("Executing block-select.select-include command");
      expandSelection(true);
    })
  );
  console.log("Commands registered");

  // Listen for language changes to update Tree-sitter's parser language
  vscode.window.onDidChangeActiveTextEditor((editor) => {
    console.log("Active text editor changed");
    if (editor) {
      const languageId = editor.document.languageId;
      console.log(`Setting Tree-sitter language to: ${languageId}`);
      treeSitterUtil.setLanguage(languageId);
    }
  });

  // Initialize Tree-sitter for the current active editor
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const languageId = editor.document.languageId;
    console.log(`Initializing Tree-sitter with language: ${languageId}`);
    treeSitterUtil.setLanguage(languageId);
  } else {
    console.log("No active text editor on activation");
  }

  console.log("Extension activation completed");
}

// this method is called when your extension is deactivated
export function deactivate() {}
