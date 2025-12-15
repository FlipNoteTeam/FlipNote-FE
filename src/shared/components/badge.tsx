import { cn } from "@/shared/lib/utils";
import { type DetailedHTMLProps, type HTMLAttributes } from "react";

const COLOR_VARIANTS = {
  red: {
    text: "text-red-500",
    bg: "bg-red-200/50",
    border: "border-red-500",
  },
  green: {
    text: "text-green-500",
    bg: "bg-green-200/50",
    border: "border-green-500",
  },
  blue: {
    text: "text-blue-500",
    bg: "bg-blue-200/50",
    border: "border-blue-500",
  },
  gray: {
    text: "text-gray-500",
    bg: "bg-gray-300/50",
    border: "border-gray-500/30",
  }, // default
} as const;

type Props = Omit<
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
  "dangerouslySetInnerHTML"
> & { colorVariant?: keyof typeof COLOR_VARIANTS };

const Badge = (props: Props) => {
  const { className, colorVariant = "gray", ...restProps } = props;
  const colors = COLOR_VARIANTS[colorVariant];

  return (
    <div
      className={cn(
        "rounded-xl px-2 py-1 w-fit text-xs border",
        colors.text,
        colors.bg,
        colors.border,
        className
      )}
      {...restProps}
    />
  );
};

export default Badge;
