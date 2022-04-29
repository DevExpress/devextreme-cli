export interface HeaderProps {
    menuToggleEnabled: boolean;
    title?: string;
    toggleMenu: (e: any) => void;
}

export interface SideNavigationMenuProps {
    selectedItemChanged: (e: any) => void;
    openMenu: (e: any) => void;
    compactMode: boolean;
    onMenuReady: (e: any) => void;
}

export interface UserPanelProps {
    menuMode: 'context' | 'list';
}

export interface User {
    email: string;
    avatarUrl: string;
}

export type AuthContextType = {
    user?: User;
    signIn: (email: string, password: string) => Promise<{isOk: boolean, data?: User, message?: string}>;
    signOut: () => void;
    loading: boolean;
}

export interface SideNavToolbarProps {
    title: string;
}

export interface SingleCardProps {
    title?: string;
    description?: string;
}

export type Handle = () => void;

interface NavigationData {
    currentPath: string;
}

export type NavigationContextType = {
    setNavigationData?: ({ currentPath }: NavigationData) => void;
    navigationData: NavigationData;
}