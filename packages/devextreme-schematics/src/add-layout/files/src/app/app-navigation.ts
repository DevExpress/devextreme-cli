interface NavigationItem {
    text: string;
    icon?: string;
    path?: string;
    items?: NavigationItem[]
}

export const navigation: NavigationItem[] = [];
