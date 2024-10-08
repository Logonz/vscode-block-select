# CURRENTLY WIP WITH TEMPORARY LINKS ETC


# Block Select

Enhance your coding efficiency with **Block Select**, a Visual Studio Code extension that empowers you to perform multi-level selections based on bracketed structures. Whether you're dealing with parentheses, braces, square brackets, or HTML-like tags, Block Select offers precise and context-aware selection capabilities to streamline your code editing and navigation.

![Block Select Screenshot](https://user-images.githubusercontent.com/yourusername/block-select-screenshot.png)

## Features

- **Multi-Level Selection:** Expand your selection iteratively from inner content to encompassing brackets or tags.
- **Wide Bracket Support:** Handle traditional brackets `()`, `{}`, `[]`, as well as same-character brackets like quotes `"`, `'`, and backticks `` ` ``.
- **Context-Aware Parsing:** Leverage the power of Tree-sitter to understand the syntax tree of your code for accurate selections.
- **Undo Selection:** Easily revert to previous selection states with undo functionality.
- **Customizable Bracket Pairs:** Define your own bracket pairs to suit your coding style or specific language requirements.
- **Supports Multiple Languages:** Compatible with a variety of programming languages including HTML, JavaScript, TypeScript, Python, C++, and more.

## Installation

You can install **Block Select** directly from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=yourusername.block-select):

1. Open **Visual Studio Code**.
2. Navigate to the Extensions view by clicking on the Extensions icon in the Activity Bar or pressing `Ctrl+Shift+X` (`Cmd+Shift+X` on macOS).
3. Search for "**Block Select**".
4. Click **Install**.

Alternatively, install via the command line:

```bash
code --install-extension yourusername.block-select
```

## Usage

**Block Select** enhances your selection workflow through intuitive keybindings:

- **Expand Selection:**  
  Press `Alt+A` to expand your current selection to the next bracketed level. Repeating this action further expands the selection outward.

- **Undo Selection:**  
  Press `Alt+Z` to revert to the previous selection state.

- **Expand Selection with Brackets Included:**  
  Press `Ctrl+Alt+A` (Windows/Linux) or `Cmd+Alt+A` (macOS) to expand the selection and include the surrounding brackets.

### Example Workflow

1. **Initial Selection:**  
   Place your cursor inside a bracketed structure, e.g., inside `<div>Content</div>`.

2. **First Expand (`Alt+A`):**  
   Selects the inner content: `Content`.

3. **Second Expand (`Alt+A`):**  
   Selects the entire bracketed structure: `<div>Content</div>`.

4. **Undo Selection (`Alt+Z`):**  
   Reverts back to selecting `Content`.

## Configuration

Customize **Block Select** to fit your preferences through the following settings:

### Bracket Pairs

- **Setting:** `block-select.bracketPairs`
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
- **Description:** Defines the pairs of brackets recognized for selection. Modify this array to add or remove bracket pairs as needed.

### Same Brackets

- **Setting:** `block-select.sameBracket`
- **Type:** Array of Strings
- **Default:**
  ```json
  ["\"", "'", "`"]
  ```
- **Description:** Specifies characters that function as both opening and closing brackets, such as quotes. These are treated symmetrically in selection logic. 
ps. `"/"` and similar formats are supported but can create annoying behavior.

### Future Configuration Options

- **Enable Tree-Sitter Parsing:**  
  `block-select.enableTreeSitter` (Boolean)  
  *Toggle Tree-sitter-based selection on or off for performance considerations.*

## Supported Languages

**Block Select** supports a wide range of programming languages, including but not limited to:

- HTML
- JavaScript
- TypeScript
- JSX
- Python
- C++
- Go
- PHP
- Ruby
- Kotlin
- Lua
- Java
- C#
- C
- Rust

### Note on Supported Languages

All languages are technically in the project, but the list above was created to get the ball rolling. TypeScript and TSX are tested for natural reasons, as well as HTML.

## Keybindings

Customize keybindings as per your workflow preferences. The default bindings are:

| Action                       | Default Keybinding        |
|------------------------------|---------------------------|
| Expand Selection             | `Alt+A`                   |
| Undo Selection               | `Alt+Z`                   |
| Expand Selection with Brackets | `Ctrl+Alt+A` / `Cmd+Alt+A` |

To modify keybindings:

1. Open **Keyboard Shortcuts** by pressing `Ctrl+K Ctrl+S` (`Cmd+K Cmd+S` on macOS).
2. Search for "**Block Select**".
3. Click the pencil icon next to the desired action and set your preferred key combination.

## Contribution

We welcome contributions to enhance **Block Select**! Whether it's reporting bugs, suggesting features, or submitting pull requests, your input is invaluable.

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes with clear messages.
4. Submit a pull request detailing your enhancements.

## License

[MIT](LICENSE)

## Acknowledgments

**Block Select** builds upon the foundations laid by the open-source community. The initial implementation was derived from two admirable but now-abandoned repositories:

- [wangchunsen/vscode-bracket-select](https://github.com/wangchunsen/vscode-bracket-select)
- [FuPeiJiang/vscode-bracket-select](https://github.com/FuPeiJiang/wangchunsen-vscode-bracket-select)

Though much of the original code has been restructured and renamed, we extend our gratitude to the original authors for their valuable contributions over the past four years.