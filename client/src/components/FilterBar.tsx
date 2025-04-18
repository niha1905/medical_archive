import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DOCUMENT_CATEGORIES, DocumentFilter } from "@shared/schema";
import { FilterIcon, SearchIcon } from "lucide-react";

interface FilterBarProps {
  filters: DocumentFilter;
  onFilterChange: (filters: DocumentFilter) => void;
}

const FilterBar = ({ filters, onFilterChange }: FilterBarProps) => {
  const handleCategoryChange = (value: string) => {
    onFilterChange({
      ...filters,
      category: value,
    });
  };

  const handleDateFilterChange = (value: string) => {
    onFilterChange({
      ...filters,
      date: value,
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      search: e.target.value,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div className="flex items-center space-x-2">
          <FilterIcon className="h-4 w-4 text-slate-500" />
          <h2 className="text-sm font-medium">Filter Documents</h2>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={filters.category} onValueChange={handleCategoryChange}>
            <SelectTrigger className="pl-3 pr-8 py-2 text-sm border border-slate-300 rounded-md bg-white shadow-sm w-[160px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {DOCUMENT_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filters.date} onValueChange={handleDateFilterChange}>
            <SelectTrigger className="pl-3 pr-8 py-2 text-sm border border-slate-300 rounded-md bg-white shadow-sm w-[160px]">
              <SelectValue placeholder="All Dates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Dates</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="last_3_months">Last 3 Months</SelectItem>
              <SelectItem value="last_6_months">Last 6 Months</SelectItem>
              <SelectItem value="last_year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="relative flex-grow md:max-w-xs">
            <Input
              value={filters.search}
              onChange={handleSearchChange}
              className="pl-10 pr-3 py-2 w-full text-sm border border-slate-300 rounded-md bg-white shadow-sm"
              placeholder="Search documents..."
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
