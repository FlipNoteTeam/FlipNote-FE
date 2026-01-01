import * as React from "react";
import { Input } from "./input";

interface NumberInputProps extends Omit<React.ComponentProps<"input">, "type"> {
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

  return (
    <Input
      type="number"
      onKeyDown={handleKeyDown}
      min={min}
      max={max}
      {...props}
    />
  );
}

export { NumberInput };
