// services/routeConfig.ts
export interface RouteConfig {
  path: string;
  isPublic?: boolean;
  bypassAuth?: boolean;
  showLayout?: boolean;
  allowedRoles?: ('admin' | 'schoolManager' | 'user')[];
}

export const SPECIAL_ROUTES = [
  '/thankyou',
  '/news', 
  '/pay',
  '/impressum',
  '/agb',
  '/data'
];

export const isSpecialRoute = (pathname: string): boolean => {
  return SPECIAL_ROUTES.some(route => pathname.startsWith(route));
};

export const getRouteConfig = (pathname: string): RouteConfig => {
  // Vereinfachte Version - wir brauchen keine komplexe Route-Matching für jetzt
  if (pathname.startsWith('/data')) {
    return { 
      path: pathname, 
      showLayout: true,
      allowedRoles: ['admin', 'schoolManager', 'user']
    };
  }
  
  return { 
    path: pathname, 
    showLayout: true,
    allowedRoles: ['admin', 'schoolManager', 'user']
  };
};