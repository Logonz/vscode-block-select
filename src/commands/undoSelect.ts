import { SelectionService } from "../services/selectionService";

export function executeUndoSelect() {
  const selectionService = new SelectionService();
  selectionService.undoSelect();
}
