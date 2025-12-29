import { GROUP_CATEGORY_MAP } from "@/domain/group/types";
import type { GroupCategory } from "@/shared/apis/types";
import {
  ButtonCheckbox,
  ButtonCheckboxGroupField,
} from "@/shared/components/button-checkbox";

type FilterCategoryProps = {
  selectedCategories: GroupCategory[];
  onCategoryChange: (category: GroupCategory, checked: boolean) => void;
};

export const FilterCategory = ({
  selectedCategories,
  onCategoryChange,
}: FilterCategoryProps) => {
  const handleCategoryChange = (value: string | string[] | number) => {
    if (Array.isArray(value)) {
      // value는 현재 선택된 모든 카테고리 배열
      const newCategories = value as GroupCategory[];
      // 이전 선택과 비교하여 변경된 카테고리 찾기
      const added = newCategories.find(
        (category) => !selectedCategories.includes(category)
      );
      const removed = selectedCategories.find(
        (category) => !newCategories.includes(category)
      );

      if (added) {
        onCategoryChange(added, true);
      } else if (removed) {
        onCategoryChange(removed, false);
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700">카테고리</span>
      <div className="flex flex-wrap gap-4">
        <ButtonCheckboxGroupField
          value={selectedCategories}
          onChange={handleCategoryChange}
          multiple={true}
        >
          {Object.entries(GROUP_CATEGORY_MAP).map(([value, name]) => (
            <ButtonCheckbox
              key={value}
              value={value}
              className="py-1 px-3 text-sm"
            >
              {name}
            </ButtonCheckbox>
          ))}
        </ButtonCheckboxGroupField>
      </div>
    </div>
  );
};
