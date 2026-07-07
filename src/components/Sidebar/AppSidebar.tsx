import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useAlertDialog } from '@/context/AlertDialogContext';

import { Badge } from '../ui/badge';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '../ui/sidebar';

import { getNavigationLinks, getRoleDetails } from '@/utils/navigationLinks';
import { images } from '@/assets/images';

const AppSidebar = () => {
  const { user, logout } = useAuth();
  const { setOpenMobile, isMobile } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { showAlertDialog } = useAlertDialog();

  if (!user) return null;

  const role = user.global_role;
  const { label, color } = getRoleDetails(role);
  const links = getNavigationLinks(role);

  const handleLogout = () => {
    showAlertDialog({
      type: 'confirm',
      title: 'Sair da conta',
      message: 'Você tem certeza que deseja sair do sistema?',
      confirmText: 'Sim',
      cancelText: 'Não',
      onConfirm: () => {
        logout();
        navigate('/login');
      },
    });
  };

  return (
    <Sidebar side={isMobile ? 'right' : 'left'}>
      <SidebarHeader className="p-4 border-b border-sidebar-border bg-sidebar">
        <figure className="flex items-center gap-2 mb-1">
          <img
            className="w-10 h-10 p-2 rounded-lg flex items-center justify-center shrink-0 bg-indigo-600"
            src={images.white_logo}
            alt="Logo LearningLab"
          />
          <h1 className="text-xl font-bold text-indigo-700 truncate">
            LearningLab
          </h1>
        </figure>
        <div className="ml-12 -mt-4 gap-2 flex flex-col">
          <p className="text-xs text-muted-foreground">Weekly Reports</p>
          <Badge
            variant="secondary"
            className={`w-fit pointer-events-none ${color}`}
          >
            {label}
          </Badge>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map(link => {
                const isActive = location.pathname === link.to;
                return (
                  <SidebarMenuItem key={link.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={link.label}
                      onClick={() => setOpenMobile(false)}
                      className="py-6 data-[active=true]:bg-indigo-600 data-[active=true]:text-white hover:data-[active=true]:bg-indigo-700 hover:data-[active=true]:text-white"
                    >
                      <Link to={link.to} className="flex items-center gap-2">
                        <link.icon className="w-5 h-5" />
                        <span>{link.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
