import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  onSearch: (search: string, category: string) => void;
  selectedCategory: string;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ onSearch, selectedCategory, placeholder = "Search echoes, tags, or categories...", className = "" }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  // Debounce search input to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Trigger search when debounced query changes
  useEffect(() => {
    onSearch(debouncedQuery, selectedCategory);
  }, [debouncedQuery, onSearch, selectedCategory]);

  // Keyboard shortcut to expand search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (!isExpanded) {
          setIsExpanded(true);
          setTimeout(() => {
            const input = document.querySelector(`input[placeholder="${placeholder}"]`) as HTMLInputElement;
            if (input) input.focus();
          }, 100);
        }
      }
      // Escape key to collapse
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
        handleClear();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded, placeholder]);

  const handleClear = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    onSearch("", selectedCategory);
  };

  const toggleSearch = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      // Focus the input when expanding
      setTimeout(() => {
        const input = document.querySelector(`input[placeholder="${placeholder}"]`) as HTMLInputElement;
        if (input) input.focus();
      }, 100);
    } else {
      // Clear search when collapsing
      handleClear();
    }
  };

  return (
    <div className={`relative ${className}`}>
             {!isExpanded ? (
         // Collapsed state - just the search icon with tooltip
         <Button
           variant="ghost"
           onClick={toggleSearch}
           className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white p-0 flex items-center justify-center transition-all duration-200 group relative"
           title="Search (Ctrl+K)"
         >
           <Search className="h-5 w-5" />
           {/* Keyboard shortcut hint */}
           <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
             Ctrl+K
           </div>
         </Button>
       ) : (
         // Expanded state - full search input
         <div className="relative animate-in fade-in-0 zoom-in-95 duration-200 w-64">
           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
           <Input
             type="text"
             placeholder={placeholder}
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="pl-10 pr-16 bg-white/95 backdrop-blur-sm border-0 text-gray-900 placeholder:text-gray-600 focus:bg-white focus:ring-2 focus:ring-white/50 shadow-lg rounded-full"
             onBlur={() => {
               // Auto-collapse if empty after a short delay
               if (!searchQuery.trim()) {
                 setTimeout(() => {
                   if (!searchQuery.trim()) {
                     setIsExpanded(false);
                   }
                 }, 2000);
               }
             }}
           />
           <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
             {searchQuery && (
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={handleClear}
                 className="h-6 w-6 p-0 hover:bg-gray-200/50"
                 title="Clear search"
               >
                 <X className="h-3 w-3" />
               </Button>
             )}
             <Button
               variant="ghost"
               size="sm"
               onClick={toggleSearch}
               className="h-6 w-6 p-0 hover:bg-gray-200/50"
               title="Close search"
             >
               <X className="h-3 w-3" />
             </Button>
           </div>
         </div>
       )}
    </div>
  );
}
