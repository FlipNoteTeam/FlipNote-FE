import {
  CARDSET_CATEGORY_MAP,
  getCardSetCategoryKeys,
} from "@/domain/cardsets/types";
import { Checkbox } from "@/shared/components/checkbox";
import { Label } from "@/shared/components/label";
import type { CardSetCategory } from "@/domain/cardsets/types";

interface CardSetFilterSectionProps {
  selectedCategories: CardSetCategory[];
  onCategoryChange: (category: CardSetCategory, checked: boolean) => void;
}

export const CardSetFilterSection = ({
  selectedCategories,
  onCategoryChange,
}: CardSetFilterSectionProps) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 mt-2">
      <h3 className="text-sm font-medium text-gray-700 mb-3">카테고리</h3>
      <div className="flex flex-wrap gap-4">
        {getCardSetCategoryKeys().map((key) => {
          const displayValue = CARDSET_CATEGORY_MAP[key];
          return (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox
                id={key}
                checked={selectedCategories.includes(key)}
                onCheckedChange={(checked) => onCategoryChange(key, !!checked)}
              />
              <Label
                htmlFor={key}
                className="text-sm font-normal cursor-pointer"
              >
                {displayValue}
              </Label>
            </div>
          );
        })}
      </div>
    </div>
  );
};
