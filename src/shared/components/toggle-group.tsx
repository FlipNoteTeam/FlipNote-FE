import { cn } from "@/shared/lib/utils";
import {
  ButtonCheckbox,
  ButtonCheckboxGroupField,
} from "./button-checkbox";

type ToggleOption = {
  value: string;
  label: string;
};

type ToggleGroupProps = {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: (value: string) => void;
  options: ToggleOption[];
  name?: string;
  disabled?: boolean;
  className?: string;
};

export const ToggleGroup = ({
  value,
  onChange,
  onBlur,
  options,
  name,
  disabled = false,
  className,
}: ToggleGroupProps) => {
  return (
    <ButtonCheckboxGroupField
      name={name}
      value={value}
      onChange={onChange as (value: string | string[] | number) => void}
      onBlur={onBlur as (value: string | string[] | number) => void}
      multiple={false}
      disabled={disabled}
      className={cn("rounded-full bg-blue-200/70 opacity-80 p-1", className)}
    >
      {options.map((option) => (
        <ButtonCheckbox
          key={option.value}
          value={option.value}
          className={cn(
            "grow p-2 rounded-full text-center font-semibold border-0 hover:bg-blue-300 hover:text-white transition-all",
            {
              "bg-blue-600 text-white": value === option.value,
              "bg-transparent text-blue-900/30": value !== option.value,
            }
          )}
        >
          {option.label}
        </ButtonCheckbox>
      ))}
    </ButtonCheckboxGroupField>
  );
};
