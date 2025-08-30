import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const getCategoryColor = (categoryName: string) => {
    const colors: { [key: string]: string } = {
      'Mental Health Support': 'green',
      'Study Help': 'blue',
      'Career Advice': 'purple',
      'Life Skills': 'orange',
      'Creative Feedback': 'pink',
      'Tech Support': 'indigo',
    };
    return colors[categoryName] || 'gray';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Filter by Category</h3>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === "" ? "default" : "outline"}
          onClick={() => onCategoryChange("")}
          className="mb-2"
          data-testid="filter-all"
        >
          All Categories
        </Button>
        
        {categories.map((category: any) => {
          const color = getCategoryColor(category.name);
          const isSelected = selectedCategory === category.id;
          
          return (
            <Button
              key={category.id}
              variant={isSelected ? "default" : "outline"}
              onClick={() => onCategoryChange(category.id)}
              className={`mb-2 ${isSelected ? `bg-${color}-500 hover:bg-${color}-600` : ''}`}
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
