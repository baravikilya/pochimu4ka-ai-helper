import React, { useState } from 'react';
import { User, LogOut, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ProfileIconProps {
  isLoggedIn: boolean;
  username?: string;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenHistory: () => void;
  onLogout: () => void;
}

const ProfileIcon: React.FC<ProfileIconProps> = ({
  isLoggedIn,
  username,
  onOpenLogin,
  onOpenRegister,
  onOpenHistory,
  onLogout,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!isLoggedIn) {
    return (
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-10 h-10 bg-card border border-border shadow-sm hover:shadow-md transition-all"
          >
            <User className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={onOpenLogin}>
            Вход
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onOpenRegister}>
            Регистрация
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full w-10 h-10 p-0"
        >
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-primary text-primary-foreground font-medium">
              {username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onOpenHistory}>
          <History className="mr-2 h-4 w-4" />
          История запросов
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileIcon;