# **Block Select VS Code Extension - Compressed Technical Documentation**

## **Table of Contents**
1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Modules](#modules)
4. [Key Functionalities](#key-functionalities)
5. [Current Behavior](#current-behavior)
6. [Known Issues](#known-issues)
7. [Future Work](#future-work)
8. [Development Guidelines](#development-guidelines)
9. [Appendix](#appendix)

---

## **Introduction**

**Block Select** enhances VS Code by enabling multi-level bracket-based selections (e.g., `()`, `{}`, `[]`, `<tag></tag>`, `for`, `then`) using the **Tree-sitter** parser for precise, context-aware code manipulation and navigation.

---

---

## **Key Functionalities**

- **Bracket Pair Detection**: Customizable bracket pairs, handling traditional and same-character brackets.
- **Syntax Parsing with Tree-sitter**: Context-aware parsing for accurate bracketed selections.
- **Selection Management**: History tracking for multi-level expansion and undo capabilities.
- **Command Registration and Keybindings**: Commands (`Alt+A`, `Alt+Z`, `Ctrl+Alt+A`) to control selection actions.

---

## **Current Behavior**

### **Selection Flow**
1. **Initial (`Alt+A`)**: Selects inner content (e.g., `hej`).
2. **Expand (`Alt+A`)**: Selects entire bracketed structure (e.g., `<test>hej</test>`).
3. **Undo (`Alt+Z`)**: Reverts to previous selection (`hej`).

**Supported Languages**: HTML, JS, TS, JSX, Python, C++, Go, PHP, Ruby, Kotlin, Lua, Java, C#, C, Rust.

**Bracket Types**: `()`, `{}`, `[]`, `<tag></tag>`, `"`, `'`, `` ` ``, `/`

---

## **Known Issues**

1. **Intermediate Incorrect Selections**: Minor off-by-one fixes implemented, vigilance needed across languages.
2. **Incomplete Language Support**: Some languages require additional Tree-sitter grammars or handling.
3. **Performance Concerns**: Large files may affect performance; basic caching exists.
4. **Edge Case Handling**: Unmatched or nested brackets, brackets in strings/comments need robust management.
5. **Configuration Constraints**: Assumes well-defined bracket pairs; may struggle with unconventional pairings.

---

## **Future Work**

1. **Enhanced Language Support**: More Tree-sitter grammars and language-specific handling.
2. **Performance Optimization**: Advanced caching and incremental parsing strategies.
3. **User Configuration Enhancements**: Toggle Tree-sitter usage, UI for defining bracket pairs.
4. **Robust Edge Case Handling**: Better management of unmatched/nested brackets and context exclusions.
5. **Improved Logging and Debugging**: Granular logging levels and in-extension debugging tools.
6. **Multi-Cursor Support**: Handle multiple selections seamlessly.
7. **User Feedback and Accessibility**: Visual cues, customizable keybindings.
8. **Comprehensive Testing Suite**: Automated unit and integration tests.

---

## **Development Guidelines**

1. **Code Quality**: Consistent standards, effective TypeScript usage, comprehensive error handling.
2. **Modular Design**: Clear separation of concerns with well-defined module responsibilities.
3. **Documentation**: Up-to-date module/function docs and inline comments for complex logic.
4. **Version Control**: Use Git with clear commits and feature branching.
5. **Testing**: Unit and integration tests with continuous integration for automated testing.
6. **User Feedback**: Encourage and address feedback via GitHub.
7. **Performance Monitoring**: Continuous optimization and profiling to eliminate bottlenecks.
8. **Accessibility**: Ensure keybindings are accessible and customizable.

---

## **Appendix**

### **Configuration Options**

1. **`block-select.bracketPairs`**
   - **Type:** Array of Arrays
   - **Default:**
     ```json
     [
       ["(", ")"],
       ["{", "}"],
       ["[", "]"],
       ["<", ">"]
     ]
     ```
   - **Description:** Defines recognized bracket pairs for selection.

2. **`block-select.sameBracket`**
   - **Type:** Array of Strings
   - **Default:**
     ```json
     ["\"", "'", "`", "/"]
     ```
   - **Description:** Characters acting as both opening and closing brackets.

3. **Potential Future Settings**
   - **`block-select.enableTreeSitter`**
     - **Type:** Boolean
     - **Default:** `true`
     - **Description:** Toggle Tree-sitter-based selection.

### **Logging and Debugging**

- **Descriptive Messages**: Clear logs indicating operations, selected nodes, issues.
- **Contextual Information**: Logs include language IDs, cursor positions, text ranges.
- **Conditional Logging**: Logs based on operation success/failure.

**Accessing Logs**:
1. **Open Developer Tools**: `Help` > `Toggle Developer Tools`.
2. **View Console Logs**: Select the `Console` tab.

**Enhancements**:
- Granular logging levels (debug, info, warning, error).
- Options to enable/disable verbose logging.


----------------------Code Base Context----------------------