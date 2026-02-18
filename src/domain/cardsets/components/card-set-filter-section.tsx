import type { CardSetCategory } from "@/domain/cardsets/types";
import { FilterCategory } from "@/features/filter-category/filter-category";

interface CardSetFilterSectionProps {
  selectedCategories: CardSetCategory[];
  onCategoryChange: (category: CardSetCategory, checked: boolean) => void;
}

export const CardSetFilterSection = ({
  selectedCategories,
  onCategoryChange,
}: CardSetFilterSectionProps) => {
  return (
    <FilterCategory
      selectedCategories={selectedCategories}
      onCategoryChange={onCategoryChange}
    />
  );
};
