import { GROUP_CATEGORY_MAP } from "@/domain/group";
import { Checkbox } from "@/shared/components/checkbox";
import { Label } from "@/shared/components/label";
import type { GroupCategory } from "@/shared/apis/types";

interface GroupFilterSectionProps {
  selectedCategories: GroupCategory[];
  onCategoryChange: (category: string, checked: boolean) => void;
}

export const GroupFilterSection = ({
  selectedCategories,
  onCategoryChange,
}: GroupFilterSectionProps) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 mt-2">
      <h3 className="text-sm font-medium text-gray-700 mb-3">카테고리</h3>
      <div className="flex flex-wrap gap-4">
        {Object.entries(GROUP_CATEGORY_MAP).map(([key, displayValue]) => (
          <div key={key} className="flex items-center space-x-2">
            <Checkbox
              id={key}
              checked={selectedCategories.includes(key as GroupCategory)}
              onCheckedChange={(checked) =>
                onCategoryChange(displayValue, !!checked)
              }
            />
            <Label
              htmlFor={key}
              className="text-sm font-normal cursor-pointer"
            >
              {displayValue}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};