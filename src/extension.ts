import * as vscode from "vscode";
import { executeSelect } from "./commands/select";
import { executeSelectInclude } from "./commands/selectInclude";
import { executeUndoSelect } from "./commands/undoSelect";
import { BracketUtil } from "./utils/bracketUtil";

export function activate(context: vscode.ExtensionContext) {
  console.log("Extension 'block-select' is now active!");

  // Refresh configuration on activation
  BracketUtil.refreshConfig();

  // Listen for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("block-select.bracketPairs") || event.affectsConfiguration("block-select.sameBracket")) {
        BracketUtil.refreshConfig();
      }
    })
  );

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand("block-select.select", () => {
      console.log("Executing block-select.select command");
      executeSelect(false);
    }),
    vscode.commands.registerCommand("block-select.undo-select", () => {
      console.log("Executing block-select.undo-select command");
      executeUndoSelect();
    }),
    vscode.commands.registerCommand("block-select.select-include", () => {
      console.log("Executing block-select.select-include command");
      executeSelectInclude();
    })
  );

  console.log("Extension activation completed");
}

export function deactivate() {}
