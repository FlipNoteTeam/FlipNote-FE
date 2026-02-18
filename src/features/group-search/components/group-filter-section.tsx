import { FilterCategory } from "@/features/filter-category/filter-category";
import type { GroupCategory } from "@/shared/apis/types";

interface GroupFilterSectionProps {
  selectedCategories: GroupCategory[];
  onCategoryChange: (category: GroupCategory, checked: boolean) => void;
}

export const GroupFilterSection = ({
  selectedCategories,
  onCategoryChange,
}: GroupFilterSectionProps) => {
  return (
    <FilterCategory
      selectedCategories={selectedCategories}
      onCategoryChange={onCategoryChange}
    />
  );
};
