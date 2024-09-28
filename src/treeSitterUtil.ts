// treeSitterUtil.ts
import * as vscode from "vscode";
import Parser from "tree-sitter";
import Html from "tree-sitter-html";
import JavaScript from "tree-sitter-javascript";
const typescript = require("tree-sitter-typescript"); // This is dumb, but can't be an import????
// Import other languages as needed

export class TreeSitterUtil {
  private parser: Parser;
  private languageMap: Map<string, any>;

  constructor() {
    this.parser = new Parser();
    this.languageMap = new Map<string, any>();

    // Register supported languages
    this.languageMap.set("html", Html);
    this.languageMap.set("javascript", JavaScript);
    this.languageMap.set("typescript", typescript.typescript);
    this.languageMap.set("tsx", typescript.tsx);
    // Add other languages here
  }

  /**
   * Sets the parser language based on the language ID.
   * @param languageId The language ID (e.g., 'html', 'javascript')
   */
  setLanguage(languageId: string) {
    const language = this.languageMap.get(languageId);
    if (language) {
      this.parser.setLanguage(language);
    } else {
      // Fallback to default language if not supported
      // You can choose to set a default language or handle unsupported languages differently
      this.parser.setLanguage(Html); // Default to HTML
    }
  }

  /**
   * Parses the given text and returns the syntax tree.
   * @param text The text to parse
   */
  parse(text: string): Parser.Tree {
    return this.parser.parse(text);
  }
}
