import * as vscode from "vscode";
import { BracketUtil } from "../utils/bracketUtil";
import { SelectionHistory } from "../utils/selectionHistory";
import { TreeSitterUtil } from "../utils/treeSitterUtil";
import { BaseLanguageHandler } from "../languages/baseLanguageHandler";
import { HtmlHandler } from "../languages/htmlHandler";
import { JavaScriptHandler } from "../languages/javascriptHandler";
import { LuaHandler } from "../languages/luaHandler";
// Import other language handlers as needed

export class SelectionService {
  private treeSitterUtil: TreeSitterUtil;
  private selectionHistory: SelectionHistory;
  private languageHandlers: Map<string, BaseLanguageHandler>;

  constructor() {
    this.treeSitterUtil = new TreeSitterUtil();
    this.selectionHistory = new SelectionHistory();
    this.languageHandlers = new Map<string, BaseLanguageHandler>();

    // Initialize language handlers
    this.languageHandlers.set("html", new HtmlHandler(this.treeSitterUtil));
    this.languageHandlers.set("javascript", new JavaScriptHandler(this.treeSitterUtil));
    this.languageHandlers.set("lua", new LuaHandler(this.treeSitterUtil));
    // Add other language handlers here
  }

  /**
   * Expands the current selection based on bracket pairs or Tree-sitter parsing.
   * @param includeBrackets Whether to include the brackets in the selection
   */
  expandSelection(includeBrackets: boolean) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const languageId = editor.document.languageId;
    if (!this.treeSitterUtil.isLanguageSupported(languageId)) {
      console.log("Language not supported for Tree-sitter selection.");
      // Optionally, handle unsupported languages differently
      return;
    }

    this.treeSitterUtil.setLanguage(languageId);
    const tree = this.treeSitterUtil.parse(editor.document.getText());

    const handler = this.languageHandlers.get(languageId);
    if (!handler) {
      console.log("No handler found for language:", languageId);
      return;
    }

    const newSelections: vscode.Selection[] = [];

    for (const selection of editor.selections) {
      const cursorPosition = selection.active;
      const offset = editor.document.offsetAt(cursorPosition);
      const node = tree.rootNode.descendantForIndex(offset);

      let targetNode = handler.selectNode(node);
      if (!targetNode && selection.isEmpty) {
        // Fallback to bracket-based selection if Tree-sitter doesn't find a node
        targetNode = this.fallbackBracketSelection(editor, selection, includeBrackets);
      }

      if (targetNode) {
        newSelections.push(new vscode.Selection(editor.document.positionAt(targetNode.start), editor.document.positionAt(targetNode.end)));
      } else {
        newSelections.push(selection);
      }
    }

    if (newSelections.length > 0) {
      this.selectionHistory.addSelections(newSelections);
    }
  }

  /**
   * Performs bracket-based selection as a fallback.
   * @param editor The active text editor
   * @param selection The current selection
   * @param includeBrackets Whether to include the brackets
   * @returns The new selection range or null
   */
  private fallbackBracketSelection(editor: vscode.TextEditor, selection: vscode.Selection, includeBrackets: boolean): { start: number; end: number } | null {
    const text = editor.document.getText();
    const selectionStart = editor.document.offsetAt(selection.start);
    const selectionEnd = editor.document.offsetAt(selection.end);

    const backwardResult = this.findBackward(text, selectionStart - 1);
    const forwardResult = this.findForward(text, selectionEnd);

    if (this.isMatch(backwardResult, forwardResult)) {
      const start = includeBrackets ? backwardResult!.offset : backwardResult!.offset + 1;
      const end = includeBrackets ? forwardResult!.offset + 1 : forwardResult!.offset;
      return { start, end };
    }

    return null;
  }

  /**
   * Retrieves the last set of selections from the history.
   */
  undoSelect() {
    this.selectionHistory.undoSelect();
  }

  // Implement findBackward, findForward, isMatch similar to bracketSelectMain.ts
  private findBackward(text: string, index: number): SearchResult | null {
    const bracketStack: string[] = [];
    for (let i = index; i >= 0; i--) {
      let char = text.charAt(i);
      if (BracketUtil.isSameBracket(char) && bracketStack.length === 0) {
        return new SearchResult(char, i);
      }
      if (BracketUtil.isOpenBracket(char)) {
        if (bracketStack.length === 0) {
          return new SearchResult(char, i);
        } else {
          let top = bracketStack.pop();
          if (!BracketUtil.isMatch(char, top!)) {
            console.log("Mismatched brackets:", char, top);
          }
        }
      } else if (BracketUtil.isCloseBracket(char)) {
        bracketStack.push(char);
      }
    }
    return null;
  }

  private findForward(text: string, index: number): SearchResult | null {
    const bracketStack: string[] = [];
    for (let i = index; i < text.length; i++) {
      let char = text.charAt(i);
      if (BracketUtil.isSameBracket(char) && bracketStack.length === 0) {
        return new SearchResult(char, i);
      }
      if (BracketUtil.isCloseBracket(char)) {
        if (bracketStack.length === 0) {
          return new SearchResult(char, i);
        } else {
          let top = bracketStack.pop();
          if (!BracketUtil.isMatch(top!, char)) {
            console.log("Mismatched brackets:", top, char);
          }
        }
      } else if (BracketUtil.isOpenBracket(char)) {
        bracketStack.push(char);
      }
    }
    return null;
  }

  private isMatch(r1: SearchResult | null, r2: SearchResult | null): boolean {
    return r1 != null && r2 != null && BracketUtil.isMatch(r1.bracket, r2.bracket);
  }
}

class SearchResult {
  bracket: string;
  offset: number;

  constructor(bracket: string, offset: number) {
    this.bracket = bracket;
    this.offset = offset;
  }
}
