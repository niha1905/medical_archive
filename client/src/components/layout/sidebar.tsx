import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  FolderOpen, 
  QrCode, 
  UserRound, 
  Stethoscope,
  Home,
  Tag,
  LayoutDashboard,
  FileText,
  Users,
  Calendar,
  Settings,
  ChevronRight,
  ChevronDown,
  Activity,
  ClipboardList,
  BarChart3,
  Menu,
  X
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Category } from '@shared/schema';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMobile } from '@/hooks/use-mobile';

const Sidebar = () => {
  const [location] = useLocation();
  const { user } = useAuth();
  const { isMobile } = useMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);
  
  // Skip query if user is not authenticated or not a patient
  const shouldFetchCategories = user?.role === 'patient';
  
  // Fetch categories from the API
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: [`/api/users/${user?.id}/categories`],
    enabled: shouldFetchCategories,
  });

  const isActive = (path: string) => location === path || location.startsWith(path + '/');
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  
  const toggleCategories = () => {
    setCategoriesExpanded(!categoriesExpanded);
  };
  
  // Sidebar item component for consistent styling
  const SidebarItem = ({ 
    href, 
    icon: Icon, 
    label, 
    isActive, 
    badge, 
    onClick 
  }: { 
    href: string; 
    icon: React.ElementType; 
    label: string; 
    isActive: boolean;
    badge?: string | number;
    onClick?: () => void;
  }) => (
    <li className="mb-1">
      <Link href={href}>
        <div 
          className={cn(
            "flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all",
            isActive 
              ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-medium border-l-4 border-blue-600" 
              : "text-slate-700 hover:bg-slate-100 hover:text-blue-600"
          )}
          onClick={onClick}
        >
          <Icon className={cn("mr-3 w-5 h-5", isActive ? "text-blue-600" : "text-slate-500")} />
          <span>{label}</span>
          {badge && (
            <Badge 
              variant={isActive ? "default" : "outline"} 
              className="ml-auto"
            >
              {badge}
            </Badge>
          )}
        </div>
      </Link>
    </li>
  );

  return (
    <>
      {/* Mobile toggle button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 lg:hidden"
          onClick={toggleSidebar}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      )}
      
      <aside 
        className={cn(
          "bg-white shadow-md lg:w-64 flex-shrink-0 fixed lg:sticky top-0 h-screen z-40 transition-all duration-300 ease-in-out",
          isMobile ? (isOpen ? "left-0" : "-left-full") : "left-0",
          "border-r border-slate-200"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <Link href="/">
                <div className="flex items-center cursor-pointer">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-lg mr-2">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-slate-800">MediRec</h1>
                    <p className="text-xs text-slate-500">Medical Records System</p>
                  </div>
                </div>
              </Link>
              
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Sidebar content */}
          <nav className="p-4 flex-grow overflow-y-auto">
            {/* User role badge */}
            <div className="mb-6">
              <Badge 
                variant={user?.role === 'doctor' ? 'default' : 'secondary'} 
                className="capitalize w-full justify-center py-1 text-sm"
              >
                {user?.role === 'doctor' ? 'Doctor Portal' : 'Patient Portal'}
              </Badge>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xs uppercase text-slate-500 font-semibold tracking-wider mb-3 px-4">
                Main Menu
              </h3>
              <ul>
                <SidebarItem 
                  href="/" 
                  icon={Home} 
                  label="Home" 
                  isActive={isActive('/')} 
                />
                
                {/* Patient specific navigation items */}
                {user?.role === 'patient' && (
                  <>
                    <SidebarItem 
                      href="/documents" 
                      icon={FolderOpen} 
                      label="My Documents" 
                      isActive={isActive('/documents')} 
                      badge={categories?.reduce((sum, cat) => sum + (cat.count || 0), 0) || 0}
                    />
                    <SidebarItem 
                      href="/qr-code" 
                      icon={QrCode} 
                      label="My QR Code" 
                      isActive={isActive('/qr-code')} 
                    />
                  </>
                )}
                
                {/* Doctor specific navigation items */}
                {user?.role === 'doctor' && (
                  <>
                    <SidebarItem 
                      href="/doctor-dashboard" 
                      icon={LayoutDashboard} 
                      label="Dashboard" 
                      isActive={isActive('/doctor-dashboard')} 
                    />
                    <SidebarItem 
                      href="/doctor" 
                      icon={QrCode} 
                      label="Scan Patient QR" 
                      isActive={isActive('/doctor')} 
                    />
                    {/* Additional doctor menu items (these are placeholders) */}
                    <SidebarItem 
                      href="/patients" 
                      icon={Users} 
                      label="Patients" 
                      isActive={isActive('/patients')} 
                      badge={142}
                    />
                    <SidebarItem 
                      href="/appointments" 
                      icon={Calendar} 
                      label="Appointments" 
                      isActive={isActive('/appointments')} 
                      badge={3}
                    />
                    <SidebarItem 
                      href="/reports" 
                      icon={BarChart3} 
                      label="Reports" 
                      isActive={isActive('/reports')} 
                    />
                  </>
                )}
              </ul>
            </div>
            
            {/* Only show categories for patients */}
            {user?.role === 'patient' && (
              <div className="mb-6">
                <div 
                  className="flex items-center justify-between px-4 py-2 cursor-pointer"
                  onClick={toggleCategories}
                >
                  <h3 className="text-xs uppercase text-slate-500 font-semibold tracking-wider">
                    Categories
                  </h3>
                  <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
                    {categoriesExpanded ? (
                      <ChevronDown className="h-4 w-4 text-slate-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-500" />
                    )}
                  </Button>
                </div>
                
                {categoriesExpanded && (
                  <ul className="mt-2 space-y-1">
                    {isLoading ? (
                      <li className="text-sm text-slate-400 py-2 px-4">
                        <div className="flex items-center">
                          <div className="animate-spin h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
                          Loading...
                        </div>
                      </li>
                    ) : categories && categories.length > 0 ? (
                      categories.map((category) => (
                        <li key={category.id}>
                          <Link href={`/documents?category=${category.id}`}>
                            <div className={cn(
                              "flex items-center px-4 py-2 rounded-md text-sm cursor-pointer transition-colors",
                              location.includes(`category=${category.id}`)
                                ? "bg-blue-50 text-blue-700"
                                : "text-slate-700 hover:bg-slate-100 hover:text-blue-600"
                            )}>
                              <Tag className={cn(
                                "mr-2 h-3 w-3",
                                location.includes(`category=${category.id}`) ? "text-blue-600" : "text-slate-400"
                              )} />
                              <span>{category.name}</span>
                              <Badge 
                                variant={location.includes(`category=${category.id}`) ? "default" : "outline"} 
                                className="ml-auto"
                              >
                                {category.count || 0}
                              </Badge>
                            </div>
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-slate-400 py-2 px-4">No categories found</li>
                    )}
                  </ul>
                )}
              </div>
            )}
          </nav>
          
          {/* Sidebar footer */}
          <div className="p-4 border-t border-slate-200">
            <Button 
              variant="outline" 
              className="w-full justify-start text-slate-700 hover:text-blue-600 hover:bg-blue-50"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;
