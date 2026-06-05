import { useController, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import {
  studySettingsFormSchema,
  type StudySettingsFormField,
} from "../schemas/form.schema";
import { createStorage } from "@/shared/utils/storage";

export const MEMORIZE_MODE_DEFAULTS: StudySettingsFormField = {
  mode: "memorize",
  isUnlimitedRepeat: false,
  repeatCount: 3,
  navigationType: "manual",
  autoTimerSeconds: 5,
  orderType: "sequential",
};

export const getTestModeDefaults = (
  totalCardCount: number,
): StudySettingsFormField => ({
  mode: "test",
  isUnlimitedTime: false,
  testTimeMinutes: 30,
  orderType: "sequential",
  testMode: "all",
  totalCardCount: totalCardCount || 10,
  randomPickCount: undefined,
});

export const studyDefaultsKey = (cardsetId: number) =>
  `flipnote-study-defaults-${cardsetId}`;

export const getDefaultsByMode = (
  mode: "memorize" | "test",
  totalCardCount: number,
): StudySettingsFormField =>
  mode === "memorize"
    ? MEMORIZE_MODE_DEFAULTS
    : getTestModeDefaults(totalCardCount);

type UseStudySettingsFormParams = {
  cardsetId: number;
};

export const useStudySettingsForm = ({
  cardsetId,
}: UseStudySettingsFormParams) => {
  const storage = useMemo(
    () =>
      createStorage<StudySettingsFormField>(
        "local",
        studyDefaultsKey(cardsetId),
      ),
    [cardsetId],
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<StudySettingsFormField>({
    resolver: zodResolver(studySettingsFormSchema),
    defaultValues: storage.get() ?? MEMORIZE_MODE_DEFAULTS,
  });

  const { field: modeField } = useController({ name: "mode", control });
  const mode = useWatch({ control, name: "mode" });

  return {
    register,
    handleSubmit,
    control,
    reset,
    errors,
    mode,
    modeField,
    settingsStorage: storage,
  };
};
