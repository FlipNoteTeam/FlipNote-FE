import type { ReactNode } from "react";
import { CARDSET_CATEGORY_MAP } from "@/domain/cardsets/types";
import type { GroupCategory } from "@/shared/apis";
import { Card, CardContent, CardDescription } from "@/shared/components/card";

type ThumbnailCardProps = {
  imageUrl?: string;
  title: string;
  category: GroupCategory;
  subtitle?: string;
  footer?: ReactNode;
  onClick?: () => void;
  className?: string;
};

export const ThumbnailCard = ({
  imageUrl,
  title,
  category,
  subtitle,
  footer,
  onClick,
  className,
}: ThumbnailCardProps) => {
  return (
    <Card
      className={`hover:shadow-lg transition-shadow duration-200 cursor-pointer p-0 overflow-hidden gap-2 ${className}`}
      onClick={onClick}
    >
      <div className="w-full h-40 bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${title}의 썸네일`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-40 flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
          {title}
        </h3>
        {subtitle && (
          <CardDescription className="line-clamp-2 text-xs">
            {subtitle}
          </CardDescription>
        )}
        <div className="mt-3 flex flex-col gap-2">
          <span className="text-xs bg-indigo-100 text-indigo-900 px-2.5 py-1 rounded-full self-start">
            {CARDSET_CATEGORY_MAP[category]}
          </span>
          {footer && (
            <div className="flex justify-end">
              {footer}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
