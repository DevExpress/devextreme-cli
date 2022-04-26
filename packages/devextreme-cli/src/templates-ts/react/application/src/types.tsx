import React from 'react';

export interface IHeaderProps {
    menuToggleEnabled: boolean;
    title?: string;
    toggleMenu: (e: any) => void;
}

export interface ISideNavigationMenuProps {
    selectedItemChanged: (e: any) => void;
    openMenu: (e: any) => void;
    compactMode: boolean;
    onMenuReady: (e: any) => void;
    children: React.ReactNode;
}

export interface IUserPanelProps {
    menuMode: 'context' | 'list';
}

export interface IUser {
    email: string;
    avatarUrl: string;
}

export type IAuthContextType = {
    user?: IUser;
    signIn: (email: string, password: string) => Promise<{isOk: boolean, data?: IUser, message?: string}>;
    signOut: () => void;
    loading: boolean;
}

export interface IAuthProviderProps {
    children: React.ReactNode;
}

export interface ISideNavToolbarProps {
    title: string;
    children: React.ReactNode;
}

export interface ISingleCardProps {
    title?: string;
    description?: string;
    children: React.ReactNode;
}

export type Handle = () => void;

interface INavigationData {
    currentPath: string;
}

export type NavigationContextType = {
    setNavigationData?: ({ currentPath }: INavigationData) => void;
    navigationData: INavigationData;
}

export type NavigationProviderType = {
    children: React.ReactNode;
}