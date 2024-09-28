"use strict";

import * as vscode from "vscode";

export namespace bracketUtil {
  export let bracketPairs: string[][] = vscode.workspace.getConfiguration("block-select").get("bracketPairs") as string[][];
  export let sameBracket: string[] = vscode.workspace.getConfiguration("block-select").get("sameBracket") as string[];

  /**
   * Refreshes the bracket pairs and same brackets from the configuration.
   */
  export function refreshConfig() {
    console.log("Refreshing config");
    bracketPairs = vscode.workspace.getConfiguration("block-select").get("bracketPairs") as string[][];
    sameBracket = vscode.workspace.getConfiguration("block-select").get("sameBracket") as string[];
  }

  export function isMatch(open: string, close: string): Boolean {
    if (isSameBracket(open)) {
      return open === close;
    }
    return bracketPairs.findIndex((p: string[]) => p[0] === open && p[1] === close) >= 0;
  }

  export function isOpenBracket(char: string): Boolean {
    return bracketPairs.findIndex((pair: string[]) => pair[0] === char) >= 0;
  }

  export function isCloseBracket(char: string): Boolean {
    return bracketPairs.findIndex((pair: string[]) => pair[1] === char) >= 0;
  }

  export function isSameBracket(char: string): Boolean {
    return sameBracket.indexOf(char) >= 0;
  }
}
