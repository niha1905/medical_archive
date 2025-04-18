import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  FolderOpen, 
  QrCode, 
  UserRound, 
  Stethoscope,
  Home,
  Tag
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Category } from '@shared/schema';

const Sidebar = () => {
  const [location] = useLocation();
  const { user } = useAuth();
  
  // Skip query if user is not authenticated or not a patient
  const shouldFetchCategories = user?.role === 'patient';
  
  // Fetch categories from the API
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: [`/api/users/${user?.id}/categories`],
    enabled: shouldFetchCategories,
  });

  const isActive = (path: string) => location === path;

  return (
    <aside className="bg-white shadow lg:w-64 flex-shrink-0">
      <nav className="p-4">
        <ul>
          <li className="mb-1">
            <Link href="/">
              <div className={`flex items-center px-4 py-3 rounded-lg cursor-pointer ${
                isActive('/') 
                  ? 'bg-primary bg-opacity-10 text-primary font-medium' 
                  : 'text-slate-700 hover:bg-slate-100'
              }`}>
                <Home className="mr-3 w-5" />
                <span>Dashboard</span>
              </div>
            </Link>
          </li>
          
          {/* Patient specific navigation items */}
          {user?.role === 'patient' && (
            <>
              <li className="mb-1">
                <Link href="/documents">
                  <div className={`flex items-center px-4 py-3 rounded-lg cursor-pointer ${
                    isActive('/documents') 
                      ? 'bg-primary bg-opacity-10 text-primary font-medium' 
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}>
                    <FolderOpen className="mr-3 w-5" />
                    <span>My Documents</span>
                  </div>
                </Link>
              </li>
              <li className="mb-1">
                <Link href="/qr-code">
                  <div className={`flex items-center px-4 py-3 rounded-lg cursor-pointer ${
                    isActive('/qr-code') 
                      ? 'bg-primary bg-opacity-10 text-primary font-medium' 
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}>
                    <QrCode className="mr-3 w-5" />
                    <span>My QR Code</span>
                  </div>
                </Link>
              </li>
            </>
          )}
          
          {/* Doctor specific navigation items */}
          {user?.role === 'doctor' && (
            <li className="mb-1">
              <Link href="/doctor">
                <div className={`flex items-center px-4 py-3 rounded-lg cursor-pointer ${
                  isActive('/doctor') || location.startsWith('/doctor/') 
                    ? 'bg-primary bg-opacity-10 text-primary font-medium' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}>
                  <Stethoscope className="mr-3 w-5" />
                  <span>Scan Patient QR</span>
                </div>
              </Link>
            </li>
          )}
        </ul>
        
        {/* Only show categories for patients */}
        {user?.role === 'patient' && (
          <>
            <div className="border-t border-slate-200 my-4"></div>
            
            <div className="px-4 py-2">
              <h3 className="text-xs uppercase text-slate-500 font-semibold tracking-wider mb-2">Categories</h3>
              <ul>
                {isLoading ? (
                  <li className="text-sm text-slate-400 py-2">Loading categories...</li>
                ) : categories && categories.length > 0 ? (
                  categories.map((category) => (
                    <li key={category.id} className="mb-1">
                      <Link href={`/documents?category=${category.id}`}>
                        <div className="flex items-center px-3 py-2 rounded text-sm text-slate-700 hover:bg-slate-100 cursor-pointer">
                          <Tag className="mr-2 h-3 w-3 text-slate-400" />
                          <span>{category.name}</span>
                          <span className="ml-auto text-xs bg-slate-200 rounded-full px-2 py-0.5">{category.count || 0}</span>
                        </div>
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-slate-400 py-2">No categories found</li>
                )}
              </ul>
            </div>
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
