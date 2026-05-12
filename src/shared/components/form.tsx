import type { ReactNode } from "react";
import { Label } from "./label";
import * as React from "react";
import { cn } from "@/shared/lib/utils";

type FormTitleProps = {
  children: ReactNode;
};
export const FormTitle = ({ children }: FormTitleProps) => {
  return <h1 className="mb-4 mx-0 font-bold text-xl">{children}</h1>;
};

export const RequiredAsterisk = () => <span className="text-red-600">*</span>;

type RequiredLabelProps = React.ComponentProps<typeof Label>;
export const RequiredLabel = ({ ...props }: RequiredLabelProps) => {
  return (
    <div className={cn("flex items-center gap-1", props.className)}>
      <Label {...props} />
      <RequiredAsterisk />
    </div>
  );
};

type DescriptionProps = { children: ReactNode; className?: string };
export const Description = ({ children, className }: DescriptionProps) => {
  return (
    <p className={cn("text-xs text-gray-500 mb-2 mx-auto", className)}>
      {children}
    </p>
  );
};

type ErrorMessageProps = { children?: ReactNode; className?: string };
export const ErrorMessage = ({ children, className }: ErrorMessageProps) => {
  if (!children) return null;
  return (
    <p className={cn("text-xs text-red-500 mt-2 mx-auto", className)}>
      {children}
    </p>
  );
};
