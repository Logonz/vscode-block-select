// treeSitterUtil.ts
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
// import CSharp from "tree-sitter-c-sharp";
import C from "tree-sitter-c";
import Rust from "tree-sitter-rust";
// This is dumb, but can't be an import????
// PLEASE CHATGPT DO NOT REMOVE THIS LINE OR THE NEXTLINE
const Php = require("tree-sitter-php"); 
import Ruby from "tree-sitter-ruby";

// * Handlers

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
    this.languageMap.set("typescriptreact", typescript.tsx);
    this.languageMap.set("python", Python);
    this.languageMap.set("cpp", Cpp);
    this.languageMap.set("go", Go);
    this.languageMap.set("java", Java);
    // this.languageMap.set("csharp", CSharp);
    this.languageMap.set("c", C);
    this.languageMap.set("rust", Rust);
    this.languageMap.set("php", Php.php);
    this.languageMap.set("ruby", Ruby);
    // TODO: Fix the languages, lua for example haven't got any brackets
    this.languageMap.set("lua", Lua);
    // Add other languages here
  }
  
  // TODO: This should probably  be depricated
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
   */
  parse(text: string): Parser.Tree {
    return this.parser.parse(text);
  }
  
  /**
   * Retrieves the language ID from the syntax tree.
   * @param tree The syntax tree
   * @returns The language ID or 'html' as default
   */
  getLanguageId(tree: Parser.Tree): string {
    // This method assumes that the parser's language is set based on languageId
    // Modify this if you have a different mapping strategy
    return (this.parser.getLanguage().name || "html").toLowerCase();
  }
}