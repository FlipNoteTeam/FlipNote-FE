import type { StudySettingsFormField } from "@/features/setting-study-mode/schemas/form.schema";

declare module "@tanstack/react-router" {
  interface HistoryState {
    groupId?: number;
    cardsetId?: number;
    settings?: StudySettingsFormField;
  }
}
