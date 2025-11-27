import { cn } from "@/shared/lib/utils";

type Props = { children: string; className?: string };

const TextSeperator = ({ children, className }: Props) => {
  return (
    <div className="relative w-full">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span
          className={cn("px-2 bg-background text-muted-foreground", className)}
        >
          {children}
        </span>
      </div>
    </div>
  );
};

export default TextSeperator;
