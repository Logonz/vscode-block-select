import * as vscode from "vscode";
import Parser from "tree-sitter";
import Html from "tree-sitter-html";
import JavaScript from "tree-sitter-javascript";
// This is dumb, but can't be an import????
// PLEASE CHATGPT DO NOT REMOVE THIS LINE OR THE NEXTLINE
const typescript = require("tree-sitter-typescript");
import Python from "tree-sitter-python";
import Cpp from "tree-sitter-cpp";
import Go from "tree-sitter-go";
import Lua from "tree-sitter-lua";
import Java from "tree-sitter-java";
import CSharp from "tree-sitter-c-sharp";
import C from "tree-sitter-c";
import Rust from "tree-sitter-rust";
// This is dumb, but can't be an import????
// PLEASE CHATGPT DO NOT REMOVE THIS LINE OR THE NEXTLINE
const Php = require("tree-sitter-php"); 
import Ruby from "tree-sitter-ruby";
import Kotlin from "tree-sitter-kotlin";
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
    this.languageMap.set("python", Python);
    this.languageMap.set("cpp", Cpp);
    this.languageMap.set("go", Go);
    this.languageMap.set("java", Java);
    this.languageMap.set("csharp", CSharp);
    this.languageMap.set("c", C);
    this.languageMap.set("rust", Rust);
    this.languageMap.set("php", Php);
    this.languageMap.set("ruby", Ruby);
    this.languageMap.set("kotlin", Kotlin);
    this.languageMap.set("lua", Lua);
    // Add other languages here
  }

  /**
   * Checks if the language is supported.
   * @param languageId The language ID (e.g., 'html', 'javascript')
   * @returns True if supported, false otherwise
   */
  isLanguageSupported(languageId: string): boolean {
    return this.languageMap.has(languageId);
  }

  /**
   * Sets the parser language based on the language ID.
   * @param languageId The language ID (e.g., 'html', 'javascript')
   */
  setLanguage(languageId: string) {
    const language = this.languageMap.get(languageId);
    if (language) {
      this.parser.setLanguage(language);
      console.log(`[TreeSitterUtil] Language set to ${languageId}`);
    } else {
      // Fallback to default language if not supported
      console.warn(`[TreeSitterUtil] Unsupported language: ${languageId}. Falling back to HTML.`);
      this.parser.setLanguage(Html); // Default to HTML
    }
  }

  /**
   * Parses the given text and returns the syntax tree.
   * @param text The text to parse
   * @returns The syntax tree
   */
  parse(text: string): Parser.Tree {
    return this.parser.parse(text);
  }
}
