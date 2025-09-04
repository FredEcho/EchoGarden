import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const { categories } = useCategories();

  const getCategoryHoverClass = (categoryName: string) => {
    // Map categories to their hover color classes
    const hoverClasses: { [key: string]: string } = {
      'Mental Health Support': 'hover:bg-pink-500 hover:text-white',
      'Study Help': 'hover:bg-green-500 hover:text-white',
      'Career Advice': 'hover:bg-red-500 hover:text-white',
      'Life Skills': 'hover:bg-orange-500 hover:text-white',
      'Creative Feedback': 'hover:bg-purple-500 hover:text-white',
      'Tech Support': 'hover:bg-blue-500 hover:text-white',
    };
    return hoverClasses[categoryName] || 'hover:bg-gray-500 hover:text-white';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Filter Echoes by Category</h3>
      <div className="flex flex-wrap gap-2">
                  <Button
            variant={selectedCategory === "" ? "default" : "outline"}
            onClick={() => onCategoryChange("")}
            className={`mb-2 button-pop ${
              selectedCategory === "" 
                ? "btn-secondary" 
                : "btn-outline"
            }`}
            data-testid="filter-all"
          >
            All Categories
          </Button>
        
        {categories.map((category: any) => {
          const hoverClass = getCategoryHoverClass(category.name);
          const isSelected = selectedCategory === category.id;
          
          return (
            <Button
              key={category.id}
              variant={isSelected ? "default" : "outline"}
              onClick={() => onCategoryChange(category.id)}
              className={`mb-2 button-pop ${
                isSelected 
                  ? "btn-secondary" 
                  : `btn-outline ${hoverClass}`
              }`}
              data-testid={`filter-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {category.name}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
