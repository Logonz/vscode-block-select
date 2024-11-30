// bracketSelectMain.ts
"use strict";

import * as vscode from "vscode";
import { bracketUtil } from "./bracketUtil";
import { expandSelection, treeSitterUtil } from "./bracketSelectMain";
import * as history from "./selectionHistory";

/**
 * Main extension activation function.
 * @param context The extension context
 */
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
    }),
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
