import * as React from "react";
import { Input } from "./input";
import { formatPhoneNumber, unformatPhoneNumber } from "@/shared/lib/format-phone";

export interface PhoneInputProps
  extends Omit<React.ComponentProps<"input">, "type" | "onChange"> {
  value?: string;
  onChange?: (value: string) => void;
}

/**
 * 전화번호 자동 포맷팅 Input 컴포넌트
 * 010-xxxx-xxxx 또는 010-xxx-xxxx 형태로 자동 포맷팅
 */
const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const unformatted = unformatPhoneNumber(e.target.value);
      onChange?.(unformatted);
    };

    return (
      <Input
        {...props}
        ref={ref}
        type="tel"
        value={value ? formatPhoneNumber(value) : ""}
        onChange={handleChange}
      />
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
