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
   * Finds the matching bracket node for a given position.
   * @param tree The syntax tree
   * @param position The offset position in the text
   * @returns The matching bracket node or null
   */
  findMatchingBracket(tree: Parser.Tree, position: number): Parser.SyntaxNode | null {
    const node = tree.rootNode.descendantForIndex(position);
    if (!node) return null;

    // Determine if the node is an opening or closing bracket
    const currentChar = node.text;
    const brackets = ["(", ")", "{", "}", "[", "]", "<", ">"];
    if (!brackets.includes(currentChar)) return null;

    // Simple approach: use a stack to find the matching bracket
    const text = tree.rootNode.text;
    const isOpening = ["(", "{", "[", "<"].includes(currentChar);
    const stack: number[] = [];
    if (isOpening) {
      for (let i = node.startIndex; i < text.length; i++) {
        const char = text[i];
        if (["(", "{", "[", "<"].includes(char)) {
          stack.push(i);
        } else if ([")", "}", "]", ">"].includes(char)) {
          const last = stack.pop();
          if (last === node.startIndex) {
            return tree.rootNode.descendantForIndex(i);
          }
        }
      }
    } else {
      for (let i = node.startIndex; i >= 0; i--) {
        const char = text[i];
        if ([")", "}", "]", ">"].includes(char)) {
          stack.push(i);
        } else if (["(", "{", "[", "<"].includes(char)) {
          const last = stack.pop();
          if (last === node.startIndex) {
            return tree.rootNode.descendantForIndex(i);
          }
        }
      }
    }

    return null;
  }

  /**
   * Finds the innermost element node enclosing the given position.
   * @param tree The syntax tree
   * @param position The offset position in the text
   * @returns The enclosing element node or null
   */
  findEnclosingElement(tree: Parser.Tree, position: number): Parser.SyntaxNode | null {
    const node = tree.rootNode.descendantForIndex(position);
    if (!node) return null;

    // Traverse up the tree to find the smallest enclosing element node
    let current = node;
    while (current) {
      if (this.isElementNode(current, this.getLanguageId(tree))) {
        return current;
      }
      current = current.parent;
    }

    return null;
  }

  /**
   * Determines if a Tree-sitter node is an element (tag) node.
   * Adjust this function based on the grammar's node types.
   * @param node The Tree-sitter node
   * @param languageId The language ID
   * @returns True if it's an element node, false otherwise
   */
  isElementNode(node: Parser.SyntaxNode, languageId: string): boolean {
    switch (languageId) {
      case "html":
        return node.type === "element" || node.type === "self_closing_element";
      case "javascript":
      case "typescript":
      case "tsx":
        return node.type === "jsx_element" || node.type === "jsx_self_closing_element";
      case "python":
      case "cpp":
      case "go":
      case "c":
      case "rust":
        // These languages don't have tag-like syntax
        return false;
      case "java":
        // Java doesn't have element nodes like HTML
        return false;
      case "csharp":
        // C# doesn't have element nodes like HTML
        return false;
      case "php":
        return node.type === "element" || node.type === "self_closing_element";
      case "ruby":
        // Ruby doesn't have element nodes like HTML
        return false;
      case "kotlin":
        // Kotlin doesn't have element nodes like HTML
        return false;
      case "lua":
        // Lua doesn't have element nodes like HTML
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
    console.log(this.parser.getLanguage());
    return (this.parser.getLanguage().name || "html").toLowerCase();
  }
}
