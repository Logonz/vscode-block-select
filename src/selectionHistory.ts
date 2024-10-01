// selectionHistory.ts
import { SyntaxNode } from "tree-sitter";
import * as vscode from "vscode";
import { ReturnNode } from "./languages/baseLanguageHandler";

let selectionHistory: Array<Selection[]> = [];

// A replacement for the editor.selections property
export let editorSelections: Array<Selection> = [];

// A replacement for the vscode.Selection class, so we can save the node with information.
export class Selection extends vscode.Selection {
  private _anchor: vscode.Position;
  private _active: vscode.Position;
  private _node: ReturnNode;

  constructor(anchor: vscode.Position, active: vscode.Position, node: ReturnNode) {
    super(anchor, active);
    this._anchor = anchor;
    this._active = active;
    this._node = node;
  }

  get customAnchor(): vscode.Position {
    return this._anchor;
  }

  get customActive(): vscode.Position {
    return this._active;
  }

  get node(): ReturnNode {
    return this._node;
  }
}

// Clear history when the active text editor changes
vscode.window.onDidChangeActiveTextEditor(() => {
  selectionHistory = [];
  console.log("[bracket-select][selectionHistory] Cleared selection history due to editor change.");
});
vscode.window.onDidChangeTextEditorSelection(() => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    console.error("[bracket-select] No active editor found.");
    return null;
  }

  const document = editor.document;
  let selectionStartIndex = document.offsetAt(editor.selection.start);
  let selectionEndIndex = document.offsetAt(editor.selection.end);
  // Reset the history if the selection is empty
  if (selectionStartIndex === selectionEndIndex) {
    selectionHistory = [];
    editorSelections = [];
    console.log("[bracket-select][selectionHistory] Cleared selection history due to empty selection.");
    return null;
  }
});

/**
 * Calculates the length of a selection.
 * @param editor The active text editor
 * @param selection The selection to calculate
 * @returns The length of the selection
 */
function selectionLength(editor: vscode.TextEditor, selection: vscode.Selection): number {
  return editor.document.offsetAt(selection.end) - editor.document.offsetAt(selection.start);
}

/**
 * Adds new selections to the history and updates the editor's selections.
 * @param selections The new selections to apply
 */
export function changeSelections(selections: readonly Selection[]) {
  console.log("[bracket-select][selectionHistory] Entering changeSelections function.");
  console.log("[bracket-select][selectionHistory] New selections:", JSON.stringify(selections));

  let editor = vscode.window.activeTextEditor;
  if (editor && selectionHistory.length > 0) {
    console.log("[bracket-select][selectionHistory] Current selection history length:", selectionHistory.length);

    let lastSelections = selectionHistory[selectionHistory.length - 1];
    console.log("[bracket-select][selectionHistory] Last selections:", JSON.stringify(lastSelections));

    if (lastSelections.length !== selections.length || lastSelections.findIndex((s, i) => selectionLength(editor, s) > selectionLength(editor, selections[i])) >= 0) {
      console.log("[bracket-select][selectionHistory] Clearing selection history due to size mismatch or longer selection.");
      selectionHistory = [];
    }
  }

  if (editor) {
    let originSelections = editorSelections;
    console.log("[bracket-select][selectionHistory] Pushing new selection into history:", JSON.stringify(originSelections));

    selectionHistory.push([...originSelections] as Selection[]);
      

    // selectionHistory.push([...originSelections]);
    console.log("[bracket-select][selectionHistory] Updated selection history length:", selectionHistory.length);
    console.log("[bracket-select][selectionHistory] Updated selection history:", JSON.stringify(selectionHistory));

    editor.selections = [...selections];
    editorSelections = [...selections];
    console.log("[bracket-select][selectionHistory] New editor selections set.");
  }

  console.log("[bracket-select][selectionHistory] Exiting changeSelections function.");
}

/**
 * Retrieves the last set of selections from the history.
 * @returns The last selections or null if history is empty
 */
export function getLastSelections(): vscode.Selection[] | null {
  // Check if the selection history exists and has selections
  if (!selectionHistory || selectionHistory.length === 0) {
    return null;
  }

  const lastSelections = selectionHistory[selectionHistory.length - 1];
  // Ensure valid selections are returned
  if (!lastSelections || lastSelections.length === 0) {
    console.warn("[bracket-select][selectionHistory] No selections available in the history.");
    return null;
  }

  return lastSelections;
}

/**
 * Removes the last set of selections from the history and applies it to the editor.
 */
export function unDoSelect() {
  let editor = vscode.window.activeTextEditor;
  let lastSelections = selectionHistory.pop();
  if (lastSelections && editor) {
    editor.selections = lastSelections;
    editorSelections = lastSelections;
    console.log("[bracket-select][selectionHistory] Undo selection applied.");
  } else {
    console.log("[bracket-select][selectionHistory] No selections to undo.");
  }
}
