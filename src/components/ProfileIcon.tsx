import React, { useState } from 'react';
import { User, LogOut, History, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Modal from './Modal';

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
  const [aboutOpen, setAboutOpen] = useState(false);

  const handleAbout = () => setAboutOpen(true);

  if (!isLoggedIn) {
    return (
      <>
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
              <LogIn className="mr-2 h-4 w-4" />
              Вход
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onOpenRegister}>
              <UserPlus className="mr-2 h-4 w-4" />
              Регистрация
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleAbout}>
              <User className="mr-2 h-4 w-4" />
              О разработчике
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Modal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} title="О разработчике">
          <div className="bg-secondary/50 border border-border rounded-xl p-6 space-y-4 text-base text-foreground">
            <div className="text-foreground">
              Сайт создан мастером-энтузиастом, чтобы помочь людям ищущим найти ответы на любые вопросы.
            </div>
            <div>
              <span className="font-semibold">Связаться с разработчиком:</span>
            </div>
            <div>
              <span className="font-medium">Телеграм:</span> <a href="https://t.me/true_elon" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@true_elon</a>
            </div>
            <div>
              <span className="font-medium">Почта:</span> <a href="mailto:iamtrueelonmusk@gmail.com" className="text-primary hover:underline">iamtrueelonmusk@gmail.com</a>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  return (
    <>
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
          <DropdownMenuItem onClick={handleAbout}>
            <User className="mr-2 h-4 w-4" />
            О разработчике
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Выйти
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Modal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} title="О разработчике">
        <div className="bg-secondary/50 border border-border rounded-xl p-6 space-y-4 text-base text-foreground">
          <div className="text-foreground">
            Сайт создан мастером-энтузиастом, чтобы помочь людям ищущим найти ответы на любые вопросы.
          </div>
          <div>
            <span className="font-semibold">Связаться с разработчиком:</span>
          </div>
          <div>
            <span className="font-medium">Телеграм:</span> <a href="https://t.me/true_elon" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@true_elon</a>
          </div>
          <div>
            <span className="font-medium">Почта:</span> <a href="mailto:iamtrueelonmusk@gmail.com" className="text-primary hover:underline">iamtrueelonmusk@gmail.com</a>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ProfileIcon;