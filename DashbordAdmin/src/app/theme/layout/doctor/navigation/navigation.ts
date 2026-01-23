export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;         // FontAwesome class
  hidden?: boolean;
  url?: string;
  classes?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  badge?: {
    title?: string;
    type?: string;
  };
  children?: NavigationItem[];
}

export const NavigationItems: NavigationItem[] = [

{
    id: 'navigation',
    title: 'Navigation',
    type: 'group',
    icon: 'icon-group',
    children: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        type: 'item',
        url: '/doctor/dashboard',
        icon: 'fa fa-lock'
      },
      {
        id: 'my-patients',
        title: 'Mes Patients',
        type: 'item',
        url: '/doctor/my-patients',
        icon: 'fa fa-user'
      },
      {
        id: 'my-consultations',
        title: 'Consultations',
        type: 'item',
        url: '/doctor/my-consultations',
        icon: 'fa fa-tint'
      },
      {
        id: 'calendar',
        title: 'Calendrier',
        type: 'item',
        url: '/doctor/calendar',
        icon: 'fa fa-calendar'
      }
    ]
  },
  {
    id: 'user_actions',
    title: 'Mon Compte',
    type: 'group',
    icon: 'icon-group',
    children: [
      {
        id: 'profile',
        title: 'Paramètres',
        type: 'item',
        url: '/doctor/profile',
        icon: 'fa fa-cog'
      },
      {
        id: 'logout',
        title: 'Déconnexion',
        type: 'item',
        url: '#',
        icon: 'fa fa-sign-out-alt'
      }
    ]
  }
];
