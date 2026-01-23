export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
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
        url: '/patient/dashboard',
        icon: 'fa fa-home'
      },

      {
        id: 'rendezvous',
        title: 'Mes Rendez-vous',
        type: 'item',
        url: '/patient/my-rendez-vous',
        icon: 'fa fa-calendar-check'
      },

      {
        id: 'dossier-medical',
        title: 'Dossier Médical',
        type: 'item',
        url: '/patient/my-dossier-medical',
        icon: 'fa fa-folder-open'
      }

    ]
  },

  {
    id: 'medical_management',
    title: 'Suivi Médical',
    type: 'group',
    icon: 'icon-group',
    children: [

      {
        id: 'factures',
        title: 'Factures & Paiements',
        type: 'item',
        url: '/patient/factures',
        icon: 'fa fa-receipt'
      },

      {
        id: 'reclamations',
        title: 'Réclamations',
        type: 'item',
        url: '/patient/reclamations',
        icon: 'fa fa-exclamation-circle'
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
        url: '/patient/profile',
        icon: 'fa fa-user-cog'
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
