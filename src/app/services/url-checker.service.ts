import {ComponentFactoryResolver, Injectable} from '@angular/core';
import {Route, Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UrlCheckerService {
  private routeTree: any[] = [];

  constructor(private router: Router) {
    this.routeTree = this.getRouteTree();
  }

  getRouteTree(): any[] {
    const routeTree = [];
    this.buildRouteTree(this.router.config, routeTree);
    return routeTree;
  }

  private buildRouteTree(routes: Route[], parentTree: any[]): void {
    routes.forEach(route => {
      const routeNode = {
        path: route.path,
        children: []
      };
      parentTree.push(routeNode);
      if (route.children) {
        this.buildRouteTree(route.children, routeNode.children);
      } else if (route.loadChildren) {
        // Handle lazy-loaded routes
        const loadChildren = route.loadChildren as () => Promise<any>;
        loadChildren().then((module) => {
          const moduleRoutes = module.default?.routes || module.routes;
          if (moduleRoutes) {
            this.buildRouteTree(moduleRoutes, routeNode.children);
          }
        });
      }
    });
  }

  getRouteTreeFromService(): any[] {
    return this.routeTree;
  }
}
