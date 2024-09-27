# Block Select

Block Select is a powerful VS Code extension that allows you to quickly select text between matched blocks. It supports `()`, `{}`, `[]`, `""`, `''`, and ``` `` ```, and can be customized. Unfortunately, angle brackets `<>` are not supported due to RegEx being confused with math operations (e.g., `l < 1`).

## Quick Start

- Select text between blocks: Run the command `Block Select:Select` or use the shortcut `Alt+A`.
- Select text including the blocks: Run the command `Block Select:SelectInclude` or use the shortcut `Ctrl+Alt+A` (Windows) / `Cmd+Alt+A` (Mac).
- Undo selection: Press `Alt+Z` at any time to revert to the previous selection.

This plugin works with multiple cursors!

![block-select-animation](block-select.gif)

## Features

- Quick selection between matched blocks
- Support for multiple cursor selections
- Customizable bracket pairs and same-bracket characters
- Undo selection functionality

![block-select-undo-animation](block-select-undo.gif)

## Configuration

You can customize the behavior of Block Select through the following settings:

### Bracket Pairs

Define the pairs of brackets to be used for selection:

```json
"block-select.bracketPairs": [
    ["(", ")"],
    ["{", "}"],
    ["[", "]"]
]
```
#### Same Bracket Characters
Define characters that act as their own pair:
```json
"block-select.sameBracket": [
    "\"",
    "'",
    "`",
    "/"
]
```
Note: The double quote is escaped for JSON compatibility.

Keybindings
* `Alt+A`: Select text between blocks
* `Ctrl+Alt+A` (Windows) / Cmd+Alt+A (Mac): Select text including blocks
* `Alt+Z`: Undo selection


### Installation
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Block Select"
4. Click Install

#### Feedback and Contributions
If you find this extension helpful, please consider leaving a review. For issues, feature requests, or contributions, visit our GitHub repository.

Enjoy quick and efficient text selection with Block Select!


### Mentions
This is shamefully stolen from two abandoned reposisitories:\
Original code:\
[wangchunsen/vscode-bracket-select](https://github.com/wangchunsen/vscode-bracket-select)

Configuration code:\
[FuPeiJiang/vscode-bracket-select](https://github.com/FuPeiJiang/wangchunsen-vscode-bracket-select)