import * as vscode from "vscode";
import { SelectionService } from "../services/selectionService";

export function executeSelect(includeBrackets: boolean = false) {
  const selectionService = new SelectionService();
  selectionService.expandSelection(includeBrackets);
}
