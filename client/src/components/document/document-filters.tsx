import React, { useState, useEffect } from 'react';
import { 
  Search,
  ChevronDown
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || '');
  const [sortOrder, setSortOrder] = useState('newest');

  // Fetch categories from the API
  const { data: categories } = useQuery({
    queryKey: ['/api/users/1/categories'],
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
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <Input
              type="text"
              className="pl-10 pr-4 py-2 w-full"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Category filter */}
          <Select 
            value={selectedCategory} 
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories && categories.map((category: any) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date filter */}
          <Select 
            value={sortOrder} 
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Newest First" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default DocumentFilters;