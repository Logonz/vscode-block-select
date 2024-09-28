// treeSitterUtil.ts
import * as vscode from "vscode";
import Parser from "tree-sitter";
import Html from "tree-sitter-html";
import JavaScript from "tree-sitter-javascript";
const typescript = require("tree-sitter-typescript"); // This is dumb, but can't be an import????
import Python from "tree-sitter-python";
import Cpp from "tree-sitter-cpp";
import Go from "tree-sitter-go";
import Lua from "tree-sitter-lua";
import Java from "tree-sitter-java";
import CSharp from "tree-sitter-c-sharp";
import C from "tree-sitter-c";
import Rust from "tree-sitter-rust";
const Php = require("tree-sitter-php"); // This is dumb, but can't be an import????
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
    this.languageMap.set("php", Php.php);
    this.languageMap.set("ruby", Ruby);
    this.languageMap.set("kotlin", Kotlin);
    this.languageMap.set("lua", Lua);
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
   * Finds the smallest enclosing syntax node that represents a bracketed expression.
   * @param tree The syntax tree
   * @param position The offset position in the text
   * @returns The enclosing syntax node or null
   */
  findEnclosingBracketedNode(tree: Parser.Tree, position: number): Parser.SyntaxNode | null {
    let node = tree.rootNode.descendantForIndex(position);
    while (node) {
      if (this.isBracketedNode(node, this.getLanguageId(tree))) {
        return node;
      }
      node = node.parent;
    }
    return null;
  }

  /**
   * Determines if a Tree-sitter node represents a bracketed expression.
   * Adjust this function based on the grammar's node types.
   * @param node The Tree-sitter node
   * @param languageId The language ID
   * @returns True if it's a bracketed node, false otherwise
   */
  isBracketedNode(node: Parser.SyntaxNode, languageId: string): boolean {
    switch (languageId) {
      case "html":
        return node.type === "parenthesized_expression" || node.type === "block";
      case "javascript":
      case "typescript":
      case "tsx":
        return node.type === "parenthesized_expression" || node.type === "block";
      case "python":
        return node.type === "parenthesized_expression" || node.type === "block";
      case "cpp":
      case "go":
      case "java":
      case "csharp":
      case "c":
      case "rust":
      case "php":
      case "ruby":
      case "kotlin":
      case "lua":
        // Define what constitutes a bracketed node in these languages
        // For example, in C-like languages, blocks are typically "compound_statement"
        if (languageId === "cpp" || languageId === "c" || languageId === "csharp" || languageId === "java" || languageId === "rust") {
          return node.type === "compound_statement";
        }
        if (languageId === "go" || languageId === "php" || languageId === "ruby" || languageId === "kotlin" || languageId === "lua") {
          return node.type === "block";
        }
        // Add other languages' bracketed node types as needed
        return false;
      default:
        return false;
    }
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