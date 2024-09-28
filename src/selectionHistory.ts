// selectionHistory.ts
import * as vscode from "vscode";

let selectionHistory: Array<vscode.Selection[]> = [];

// Clear history when the active text editor changes
vscode.window.onDidChangeActiveTextEditor(() => {
  selectionHistory = [];
  console.log("[selectionHistory] Cleared selection history due to editor change.");
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
  console.log("[selectionHistory] Entering changeSelections function.");
  console.log("[selectionHistory] New selections:", JSON.stringify(selections));

  let editor = vscode.window.activeTextEditor;
  if (editor && selectionHistory.length > 0) {
    console.log("[selectionHistory] Current selection history length:", selectionHistory.length);

    let lastSelections = selectionHistory[selectionHistory.length - 1];
    console.log("[selectionHistory] Last selections:", JSON.stringify(lastSelections));

    if (lastSelections.length !== selections.length || lastSelections.findIndex((s, i) => selectionLength(editor, s) > selectionLength(editor, selections[i])) >= 0) {
      console.log("[selectionHistory] Clearing selection history due to size mismatch or longer selection.");
      selectionHistory = [];
    }
  }

  if (editor) {
    let originSelections = editor.selections;
    console.log("[selectionHistory] Pushing new selection into history:", JSON.stringify(originSelections));

    selectionHistory.push([...originSelections]);
    console.log("[selectionHistory] Updated selection history length:", selectionHistory.length);
    console.log("[selectionHistory] Updated selection history:", JSON.stringify(selectionHistory));

    editor.selections = [...selections];
    console.log("[selectionHistory] New editor selections set.");
  }

  console.log("[selectionHistory] Exiting changeSelections function.");
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
    console.warn("[selectionHistory] No selections available in the history.");
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
    console.log("[selectionHistory] Undo selection applied.");
  } else {
    console.log("[selectionHistory] No selections to undo.");
  }
}
