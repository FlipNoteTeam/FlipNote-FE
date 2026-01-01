import * as React from "react";
import { Input } from "./input";

interface NumberInputProps
  extends Omit<React.ComponentProps<"input">, "type" | "min" | "max"> {
  min?: number;
  max?: number;
  allowNegative?: boolean;
  allowDecimal?: boolean;
}

function NumberInput({
  min = 1,
  max,
  allowNegative = false,
  allowDecimal = false,
  ...props
}: NumberInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 음수 기호 입력 방지
    if (!allowNegative && e.key === "-") {
      e.preventDefault();
    }

    // 소수점 입력 방지
    if (!allowDecimal && (e.key === "." || e.key === ",")) {
      e.preventDefault();
    }

    // e, E (지수 표기) 입력 방지
    if (e.key === "e" || e.key === "E") {
      e.preventDefault();
    }
  };

  const validateValue = (value: string) => {
    if (!allowNegative && value.includes("-")) {
      return false;
    }
    if (!allowDecimal && (value.includes(".") || value.includes(","))) {
      return false;
    }
    if (value.includes("e") || value.includes("E")) {
      return false;
    }
    return true;
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData("text");
    if (!validateValue(pastedText)) {
      e.preventDefault();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!validateValue(e.target.value)) {
      e.preventDefault();
      return;
    }
    props.onChange?.(e);
  };

  return (
    <Input
      type="number"
      min={min}
      max={max}
      {...props}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onChange={handleChange}
    />
  );
}

export { NumberInput };
