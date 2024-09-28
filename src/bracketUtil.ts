// bracketUtil.ts
"use strict";

import * as vscode from "vscode";

export namespace bracketUtil {
  export let bracketPairs: string[][] = vscode.workspace.getConfiguration("block-select").get("bracketPairs") as string[][];
  export let sameBracket: string[] = vscode.workspace.getConfiguration("block-select").get("sameBracket") as string[];

  /**
   * Refreshes the bracket pairs and same brackets from the configuration.
   */
  export function refreshConfig() {
    console.log("[bracketUtil] Refreshing configuration");
    bracketPairs = vscode.workspace.getConfiguration("block-select").get("bracketPairs") as string[][];
    sameBracket = vscode.workspace.getConfiguration("block-select").get("sameBracket") as string[];
    console.log("[bracketUtil] Updated bracketPairs:", bracketPairs);
    console.log("[bracketUtil] Updated sameBracket:", sameBracket);
  }

  /**
   * Checks if the open and close brackets match.
   * @param open The opening bracket
   * @param close The closing bracket
   * @returns True if they match, false otherwise
   */
  export function isMatch(open: string, close: string): boolean {
    if (isSameBracket(open)) {
      return open === close;
    }
    return bracketPairs.findIndex((p: string[]) => p[0] === open && p[1] === close) >= 0;
  }

  /**
   * Checks if the character is an opening bracket.
   * @param char The character to check
   * @returns True if it's an opening bracket, false otherwise
   */
  export function isOpenBracket(char: string): boolean {
    return bracketPairs.findIndex((pair: string[]) => pair[0] === char) >= 0;
  }

  /**
   * Checks if the character is a closing bracket.
   * @param char The character to check
   * @returns True if it's a closing bracket, false otherwise
   */
  export function isCloseBracket(char: string): boolean {
    return bracketPairs.findIndex((pair: string[]) => pair[1] === char) >= 0;
  }

  /**
   * Checks if the character is a same bracket (e.g., quotes).
   * @param char The character to check
   * @returns True if it's a same bracket, false otherwise
   */
  export function isSameBracket(char: string): boolean {
    return sameBracket.indexOf(char) >= 0;
  }
}
