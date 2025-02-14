export interface ErrorBoundaryProps {
    error: unknown;
  }
  
  export interface LinkDescriptor {
    rel: string;
    href: string;
    crossOrigin?: string;
  }
  
  export type LinksFunction = () => LinkDescriptor[];
  
  export interface Route {
    path: string;
    component: React.ComponentType;
    exact?: boolean;
  }
  