import { cn } from "@/shared/lib/utils";
import * as React from "react";

type ButtonCheckboxProps = {
  children: React.ReactNode;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
  value?: string;
};

export const ButtonCheckbox = ({
  checked = false,
  onChange,
  children,
  className,
  disabled = false,
  value,
}: ButtonCheckboxProps) => {
  const id = React.useId();

  return (
    <div>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => {
          onChange?.(e.target.checked);
        }}
        disabled={disabled}
        value={value}
        className="sr-only peer"
      />
      <label
        htmlFor={id}
        className={cn(
          "inline-flex items-center px-4 py-2 rounded-md border text-sm font-medium transition-colors cursor-pointer",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
          checked
            ? "bg-linear-60 from-indigo-600 to-indigo-800 text-white border-indigo-800"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        {children}
      </label>
    </div>
  );
};
type ButtonCheckboxGroupProps = {
  children: React.ReactNode;
  name?: string;
  value?: string | string[];
  multiple?: boolean;
  className?: string;
  disabled?: boolean;
  onBlur?: (value: string | string[] | number) => void;
  onChange?: (value: string | string[] | number) => void;
};

export const ButtonCheckboxGroupField = ({
  value = [],
  onChange,
  onBlur,
  multiple = false,
  children,
  className,
  disabled = false,
  ...props
}: ButtonCheckboxGroupProps) => {
  const handleChange = (itemValue: string, checked: boolean) => {
    if (!onChange) return;

    let newValue;
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      newValue = checked
        ? [...currentValues, itemValue]
        : currentValues.filter((v) => v !== itemValue);
    } else {
      newValue = checked ? itemValue : "";
    }

    onChange?.(newValue);
    onBlur?.(newValue);
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)} {...props}>
      {React.Children.map(children, (child) => {
        if (
          React.isValidElement<ButtonCheckboxProps>(child) &&
          child.type === ButtonCheckbox
        ) {
          const itemValue = child.props.value || "";
          const isChecked = multiple
            ? Array.isArray(value) && value.includes(itemValue)
            : value === itemValue;

          return React.cloneElement(child, {
            ...child.props,
            checked: isChecked,
            onChange: (checked: boolean) => handleChange(itemValue, checked),
            disabled: disabled || child.props.disabled,
          });
        }
        return child;
      })}
    </div>
  );
};
