import React, { useState, useEffect } from 'react';
import { 
  Search,
  ChevronDown,
  Filter,
  Calendar,
  Tag,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';

interface DocumentFiltersProps {
  onSearchChange: (searchTerm: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onSortChange: (sortOrder: string) => void;
  initialCategory?: string;
}

const DocumentFilters: React.FC<DocumentFiltersProps> = ({ 
  onSearchChange,
  onCategoryChange,
  onSortChange,
  initialCategory
}) => {
  const { user } = useAuth();
  const userId = user?.id || 1; // Fallback to 1 if not logged in
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || '');
  const [sortOrder, setSortOrder] = useState('newest');

  // Fetch categories from the API
  const { data: categories } = useQuery<Array<{ id: number; name: string }>>({
    queryKey: [`/api/users/${userId}/categories`],
    enabled: !!userId, // Only run query if userId is available
  });

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearchChange(value);
  };

  // Handle category selection
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    onCategoryChange(value);
  };

  // Handle sort order change
  const handleSortChange = (value: string) => {
    setSortOrder(value);
    onSortChange(value);
  };

  // Set initial category if provided
  useEffect(() => {
    if (initialCategory && initialCategory !== selectedCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-5 mb-6 border border-blue-200">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-blue-500" />
            </div>
            <Input
              type="text"
              className="pl-10 pr-4 py-2 w-full border-blue-200 focus:border-blue-400 bg-white shadow-sm"
              placeholder="Search documents by title or notes..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Category filter */}
          <div className="relative">
            <Select 
              value={selectedCategory} 
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-full md:w-48 border-blue-200 bg-white shadow-sm pl-9">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Tag className="h-4 w-4 text-blue-500" />
                </div>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">All</Badge>
                    All Categories
                  </div>
                </SelectItem>
                {categories && categories.map((category: any, index: number) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        index % 4 === 0 ? "default" :
                        index % 4 === 1 ? "secondary" :
                        index % 4 === 2 ? "destructive" :
                        "outline"
                      }>
                        {index + 1}
                      </Badge>
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date filter */}
          <div className="relative">
            <Select 
              value={sortOrder} 
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="w-full md:w-44 border-blue-200 bg-white shadow-sm pl-9">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-blue-500" />
                </div>
                <SelectValue placeholder="Newest First" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">
                  <div className="flex items-center gap-2">
                    <SortDesc className="h-4 w-4 text-blue-500" />
                    Newest First
                  </div>
                </SelectItem>
                <SelectItem value="oldest">
                  <div className="flex items-center gap-2">
                    <SortAsc className="h-4 w-4 text-blue-500" />
                    Oldest First
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentFilters;