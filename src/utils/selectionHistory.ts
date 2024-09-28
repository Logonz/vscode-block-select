import * as vscode from "vscode";

export class SelectionHistory {
  private history: Array<vscode.Selection[]> = [];

  constructor() {
    // Clear history when the active text editor changes
    vscode.window.onDidChangeActiveTextEditor(() => {
      this.clearHistory();
      console.log("[SelectionHistory] Cleared selection history due to editor change.");
    });
  }

  /**
   * Adds new selections to the history and updates the editor's selections.
   * @param selections The new selections to apply
   */
  addSelections(selections: readonly vscode.Selection[]) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const originSelections = editor.selections;
      this.history.push([...originSelections]);
      editor.selections = [...selections];
      console.log("[SelectionHistory] Selections updated.");
    }
  }

  /**
   * Retrieves and applies the last set of selections from the history.
   */
  undoSelect() {
    const editor = vscode.window.activeTextEditor;
    if (editor && this.history.length > 0) {
      const lastSelections = this.history.pop();
      if (lastSelections) {
        editor.selections = lastSelections;
        console.log("[SelectionHistory] Undo selection applied.");
      }
    } else {
      console.log("[SelectionHistory] No selections to undo.");
    }
  }

  /**
   * Clears the selection history.
   */
  clearHistory() {
    this.history = [];
  }
}
