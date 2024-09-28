// bracketSelectMain.ts
'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { bracketUtil } from './bracketUtil';
import * as history from './selectionHistory';
import Parser from 'tree-sitter';
import { TreeSitterUtil } from './treeSitterUtil'; // Import the Tree-sitter utility

const treeSitterUtil = new TreeSitterUtil();

class SearchResult {
    bracket: string;
    offset: number;

    constructor(bracket: string, offset: number) {
        this.bracket = bracket;
        this.offset = offset;
    }
}

function findBackward(text: string, index: number): SearchResult {
  console.log('findBackward called with index:', index);
    const bracketStack: string[] = [];
    for (let i = index; i >= 0; i--) {
        let char = text.charAt(i);
        // if it's a quote, we can not infer it is a open or close one
        //so just return, this is for the case current selection is inside a string;
        if (bracketUtil.isSameBracket(char) && bracketStack.length == 0) {
            return new SearchResult(char, i);
        }
        if (bracketUtil.isOpenBracket(char)) {
            if (bracketStack.length == 0) {
                return new SearchResult(char, i);
            } else {
                let top = bracketStack.pop();
                if (!bracketUtil.isMatch(char, top)) {
                  console.log('Mismatched brackets:', char, top);
                  // throw 'Unmatched bracket pair';
                }
            }
        } else if (bracketUtil.isCloseBracket(char)) {
            bracketStack.push(char);
        }
    }
    //we are geting to the edge
    return null;
}

function findForward(text: string, index: number): SearchResult {
  console.log('findForward called with index:', index);
    const bracketStack: string[] = [];
    for (let i = index; i < text.length; i++) {
        let char = text.charAt(i);
        if (bracketUtil.isSameBracket(char) && bracketStack.length == 0) {
            return new SearchResult(char, i);
        }
        if (bracketUtil.isCloseBracket(char)) {
            if (bracketStack.length == 0) {
                return new SearchResult(char, i);
            } else {
                let top = bracketStack.pop();
                if (!bracketUtil.isMatch(top, char)) {
                    throw 'Unmatched bracket pair'
                }
            }
        } else if (bracketUtil.isOpenBracket(char)) {
            bracketStack.push(char);
        }
    }
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
        backwardStarter: selectionStart - 1, //coverage vscode selection index to text index
        forwardStarter: selectionEnd,
        text: editor.document.getText()
    };
}

function toVscodeSelection({ start, end }: { start: number, end: number }): vscode.Selection {
    const editor = vscode.window.activeTextEditor;
    return new vscode.Selection(
        editor.document.positionAt(start + 1), //convert text index to vs selection index
        editor.document.positionAt(end)
    );
}

function isMatch(r1: SearchResult, r2: SearchResult) {
    return r1 != null && r2 != null && bracketUtil.isMatch(r1.bracket, r2.bracket);
}

function expandSelection(includeBrack: boolean) {
    const editor = vscode.window.activeTextEditor;
    let originSelections = editor.selections;

    let selections = originSelections.map((originSelection) => {
        const newSelect = selectText(includeBrack, originSelection)
        return newSelect ? toVscodeSelection(newSelect) : originSelection
    })

    let haveChange = selections.findIndex((s, i) => !s.isEqual(originSelections[i])) >= 0
    if (haveChange) {
        history.changeSelections(selections);
    }
}

function selectText(includeBrack: boolean, selection: vscode.Selection): { start: number, end: number } | void {
    const searchContext = getSearchContext(selection);
    let { text, backwardStarter, forwardStarter } = searchContext;
    if (backwardStarter < 0 || forwardStarter >= text.length) {
        return;
    }

    let selectionStart: number, selectionEnd: number;
    var backwardResult = findBackward(searchContext.text, searchContext.backwardStarter);
    var forwardResult = findForward(searchContext.text, searchContext.forwardStarter);

    while (forwardResult != null
        && !isMatch(backwardResult, forwardResult)
        && bracketUtil.isSameBracket(forwardResult.bracket)) {
        forwardResult = findForward(searchContext.text, forwardResult.offset + 1);
    }
    while (backwardResult != null
        && !isMatch(backwardResult, forwardResult)
        && bracketUtil.isSameBracket(backwardResult.bracket)) {
        backwardResult = findBackward(searchContext.text, backwardResult.offset - 1);
    }

    // Attempt Tree-sitter based tag block selection
    const tagBlock = selectTagBlock(selection);
    if (tagBlock) {
      return {
            start: tagBlock.start - 1,
            end: tagBlock.end
        }
    }

    if (!isMatch(backwardResult, forwardResult)) {

        // showInfo('No matched bracket pairs found');
        console.log('No matched bracket pairs found');
        return;
    }

    // Calculate selection boundaries based on bracket lengths
    if (backwardStarter === backwardResult.offset && forwardResult.offset === forwardStarter) {
        selectionStart = backwardStarter - 1;
        selectionEnd = forwardStarter + 1;
    } else {
        if (includeBrack) {
            selectionStart = backwardResult.offset - 1;
            selectionEnd = forwardResult.offset + 1;
        } else {
            selectionStart = backwardResult.offset;
            selectionEnd = forwardResult.offset;
        }
    }
    return {
        start: selectionStart,
        end: selectionEnd,
    };
}

/**
 * Selects the entire tag block (e.g., <test>hej</test>) using Tree-sitter.
 * @param selection The current VS Code selection
 * @returns An object containing the start and end indices of the tag block, or undefined if not found
 */
function selectTagBlock(selection: vscode.Selection): { start: number, end: number } | undefined {
    console.log('Entering selectTagBlock function');
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        console.log('No active editor found');
        return undefined;
    }

    const languageId = editor.document.languageId;
    console.log('Language ID:', languageId);
    treeSitterUtil.setLanguage(languageId);

    const text = editor.document.getText();
    const tree = treeSitterUtil.parse(text);
    console.log('Tree parsed successfully');

    const cursorPosition = selection.active;
    const offset = editor.document.offsetAt(cursorPosition);
    console.log('Cursor position:', cursorPosition, 'Offset:', offset);
    const node = tree.rootNode.descendantForIndex(offset);
    console.log('Initial node:', node.type);

    // Traverse up to find the enclosing element node
    let current = node;
    while (current) {
        console.log('Traversing node:', current.type);
        if (isElementNode(current, languageId)) {
            console.log('Element node found:', current.type);
            break;
        }
        current = current.parent;
    }

    if (current && isElementNode(current, languageId)) {
        const startOffset = current.startIndex;
        const endOffset = current.endIndex;
        console.log('Element node range:', startOffset, '-', endOffset);
        return { start: startOffset, end: endOffset };
    }

    console.log('No suitable element node found');
    return undefined;
}
/**
 * Determines if a Tree-sitter node is an element (tag) node.
 * Adjust this function based on the grammar's node types.
 * @param node The Tree-sitter node
 * @param languageId The language ID
 * @returns True if it's an element node, false otherwise
 */
function isElementNode(node: Parser.SyntaxNode, languageId: string): boolean {
    // Adjust node types based on the language grammar
    switch (languageId) {
        case 'html':
          return node.type === 'element' || node.type === 'self_closing_element';
        case 'typescript':
          // TODO: Check what the tags in like Vue and React might be called
          return false
        case 'javascript':
          // For JavaScript, you might not have HTML-like tags
          // Adjust accordingly or return false
          // TODO: Check what the tags in like Vue and React might be called
          return false;
        // Add cases for other languages as needed
        default:
          return false;
    }
}

//Main extension point
export function activate(context: vscode.ExtensionContext) {
    // Initial load
    bracketUtil.refreshConfig();

    // Listen to configuration changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration('block-select.bracketPairs') || event.affectsConfiguration('block-select.sameBracket')) {
                bracketUtil.refreshConfig();
            }
        })
    );

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('block-select.select', function () {
            expandSelection(false);
        }),
        vscode.commands.registerCommand('block-select.undo-select', history.unDoSelect),
        vscode.commands.registerCommand('block-select.select-include', function () {
            expandSelection(true);
        })
    );

    // Listen for language changes to update Tree-sitter's parser language
    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            const languageId = editor.document.languageId;
            treeSitterUtil.setLanguage(languageId);
        }
    });

    // Initialize Tree-sitter for the current active editor
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const languageId = editor.document.languageId;
        treeSitterUtil.setLanguage(languageId);
    }
}

// this method is called when your extension is deactivated
export function deactivate() {
}
