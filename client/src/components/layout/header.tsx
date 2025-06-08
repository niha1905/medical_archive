import React from 'react';
import { 
  File, 
  LogOut, 
  User, 
  Settings, 
  Bell, 
  HelpCircle, 
  FileText,
  ChevronDown,
  Menu
} from 'lucide-react';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { User as UserType } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface HeaderProps {
  user: UserType;
}

const Header = ({ user }: HeaderProps) => {
  const { logoutMutation } = useAuth();
  const { isMobile } = useMobile();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Get user initials for avatar
  const getUserInitials = () => {
    return user.displayName.split(' ').map(name => name[0]).join('');
  };
  
  // Get role-specific color
  const getRoleColor = () => {
    return user.role === 'doctor' ? 'bg-blue-600' : 'bg-indigo-600';
  };
  
  return (
    <header className="bg-white shadow-md border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        {/* Logo - only show on mobile as it's in the sidebar for desktop */}
        {isMobile && (
          <div className="flex items-center ml-10">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-1.5 rounded-lg mr-2">
                  <FileText className="h-4 w-4" />
                </div>
                <h1 className="text-lg font-bold text-slate-800">MediRec</h1>
              </div>
            </Link>
          </div>
        )}
        
        {/* Spacer for desktop */}
        {!isMobile && <div></div>}
        
        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-slate-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[300px] overflow-y-auto">
                {[1, 2, 3].map((item) => (
                  <DropdownMenuItem key={item} className="cursor-pointer py-3 px-4">
                    <div className="flex gap-3">
                      <div className={cn("w-2 h-2 rounded-full mt-1.5", getRoleColor())}></div>
                      <div>
                        <p className="text-sm font-medium">New document uploaded</p>
                        <p className="text-xs text-slate-500">A new medical report was added to your records</p>
                        <p className="text-xs text-slate-400 mt-1">2 hours ago</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer justify-center text-blue-600 font-medium">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Help */}
          <Button variant="ghost" size="icon">
            <HelpCircle className="h-5 w-5 text-slate-600" />
          </Button>
          
          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative rounded-full flex items-center gap-2 pl-2 pr-3">
                <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                  <AvatarFallback className={cn("text-white", getRoleColor())}>
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                {!isMobile && (
                  <>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium text-slate-800 leading-tight">{user.displayName.split(' ')[0]}</span>
                      <Badge variant={user.role === 'doctor' ? 'default' : 'secondary'} className="capitalize text-xs py-0 px-1.5">
                        {user.role}
                      </Badge>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="flex flex-col space-y-1 p-3 bg-slate-50 rounded-t-md border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                    <AvatarFallback className={cn("text-white", getRoleColor())}>
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{user.displayName}</p>
                    <p className="text-xs text-slate-500">{user.email || user.username}</p>
                  </div>
                </div>
              </div>
              
              <DropdownMenuGroup className="p-1">
                <DropdownMenuItem className="cursor-pointer py-2">
                  <User className="mr-2 h-4 w-4 text-slate-500" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer py-2">
                  <Settings className="mr-2 h-4 w-4 text-slate-500" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator />
              
              <div className="p-1">
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 py-2" 
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {logoutMutation.isPending ? "Logging out..." : "Log out"}
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
