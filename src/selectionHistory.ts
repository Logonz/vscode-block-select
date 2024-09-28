// selectionHistory.ts
import * as vscode from 'vscode';

let selectionHistory: Array<vscode.Selection[]> = []
vscode.window.onDidChangeActiveTextEditor(() => { selectionHistory = [] })

function selectionLength(editor: vscode.TextEditor, selection: vscode.Selection): Number {
    return editor.document.offsetAt(selection.end) - editor.document.offsetAt(selection.start);
}

export function changeSelections(selections: readonly vscode.Selection[]) {
    console.log('Entering changeSelections function');
    console.log('New selections:', JSON.stringify(selections));

    let editor = vscode.window.activeTextEditor
    if (editor && selectionHistory.length > 0) {
        console.log('Current selection history length:', selectionHistory.length);
        
        let lastSelections = selectionHistory[selectionHistory.length - 1]
        console.log('Last selections:', JSON.stringify(lastSelections));

        if (lastSelections.length !== selections.length ||
            lastSelections.findIndex((s, i) => selectionLength(editor, s) > selectionLength(editor, selections[i])) >= 0
        ) {
            console.log('Clearing selection history');
            selectionHistory = []
        }
    }

    if (editor) {
        let originSelections = editor.selections
        console.log('Original selections:', JSON.stringify(originSelections));

        selectionHistory.push([...originSelections])
        console.log('Updated selection history length:', selectionHistory.length);

        editor.selections = [...selections]
        console.log('New editor selections set');
    }

    console.log('Exiting changeSelections function');
}


export function unDoSelect() {
    let editor = vscode.window.activeTextEditor;
    let lastSelections = selectionHistory.pop()
    if (lastSelections) {
        editor.selections = lastSelections;
    }
}
