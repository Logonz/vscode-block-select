// selectionHistory.ts
import * as vscode from "vscode";

let selectionHistory: Array<vscode.Selection[]> = [];

// Clear history when the active text editor changes
vscode.window.onDidChangeActiveTextEditor(() => {
  selectionHistory = [];
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
export function changeSelections(selections: readonly vscode.Selection[]) {
  console.log("Entering changeSelections function");
  console.log("New selections:", JSON.stringify(selections));

  let editor = vscode.window.activeTextEditor;
  if (editor && selectionHistory.length > 0) {
    console.log("Current selection history length:", selectionHistory.length);

    let lastSelections = selectionHistory[selectionHistory.length - 1];
    console.log("Last selections:", JSON.stringify(lastSelections));

    if (lastSelections.length !== selections.length || lastSelections.findIndex((s, i) => selectionLength(editor, s) > selectionLength(editor, selections[i])) >= 0) {
      console.log("Clearing selection history");
      selectionHistory = [];
    }
  }

  if (editor) {
    let originSelections = editor.selections;
    console.log("Original selections:", JSON.stringify(originSelections));

    selectionHistory.push([...originSelections]);
    console.log("Updated selection history length:", selectionHistory.length);
    console.log("Updated selection history:", JSON.stringify(selectionHistory));

    editor.selections = [...selections];
    console.log("New editor selections set");
  }

  console.log("Exiting changeSelections function");
}

export function unDoSelect() {
  let editor = vscode.window.activeTextEditor;
  let lastSelections = selectionHistory.pop();
  if (lastSelections && editor) {
    editor.selections = lastSelections;
  }
}
