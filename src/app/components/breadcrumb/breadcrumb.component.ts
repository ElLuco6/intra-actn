import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {filter} from "rxjs/operators";
import {CatalogueService} from "@services/catalogue.service";
import {UrlCheckerService} from "@services/url-checker.service";

interface BreadcrumbItem {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent implements OnInit{
  breadcrumbs: BreadcrumbItem[] = [];
  listCatDyn: any[] = [];
  showList: boolean = false;
  currentUrl: string = '';
  routeTree: any[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private catalogueService: CatalogueService,
    private urlCheckerService: UrlCheckerService
  ) {}

  ngOnInit(): void {
    this.routeTree = this.urlCheckerService.getRouteTreeFromService();
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.currentUrl = event.urlAfterRedirects;
      this.breadcrumbs = this.buildBreadcrumb(this.route.root);
    });
    this.catalogueService.generateStructure().subscribe(structure => {});
  }

  isHomePage(): boolean {
    return this.router.url === '/';
  }

  buildBreadcrumb(route: ActivatedRoute, breadcrumbs: BreadcrumbItem[] = []): BreadcrumbItem[] {
    const fullUrl = this.router.url;
    const decodedUrl = decodeURIComponent(fullUrl);
    let segments = decodedUrl.split('/').filter(segment => segment.length > 0);

    if (segments[segments.length - 1] === 'unique') {
      segments = segments.slice(0, -1);
    }

    let cumulativeUrl = '';
    segments.forEach((segment, index) => {
      cumulativeUrl += `/${segment}`;
      const isParameter = this.isParameter(segment);
      if (isParameter && breadcrumbs.length > 0) {
        const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
        lastBreadcrumb.label += ` "${segment}"`;
      } else {
        let label = segment.replace(/-/g, ' ');
        label = label.charAt(0).toUpperCase() + label.slice(1);
        if (!breadcrumbs.some(breadcrumb => breadcrumb.url === cumulativeUrl)) {
          const breadcrumbItem: BreadcrumbItem = { label, url: cumulativeUrl };
          if (index === segments.length - 1) {
            breadcrumbItem['class'] = 'active';
          }
          breadcrumbs.push(breadcrumbItem);
        }
      }
    });

    if (JSON.stringify(this.breadcrumbs) !== JSON.stringify(breadcrumbs)) {
      this.breadcrumbs = breadcrumbs;
    }

    return breadcrumbs;
  }

  isParameter(segment: string): boolean {
    return /^\d+$/.test(segment);
  }

  redirectToCategory(url: string): void {
    this.router.navigateByUrl(url);
  }

  enterItem(url: string): void {
    if (url != null) {
      this.showList = true;
      const segments = url.slice(1).split('/');

      if (segments[0] === 'catalogue') {
        this.listCatDyn = [];
        this.catalogueService.generateStructure().subscribe(structure => {
          let currentLevelStructure = structure;
          let level = 0;
          for (let i = 1; i < segments.length; i++) {
            let found = false;
            for (let [key, value] of currentLevelStructure.entries()) {
              if (key.includes(segments[i])) {
                currentLevelStructure = value;
                level++;
                found = true;
                break;
              }
            }
            if (!found) break;
          }

          if (typeof currentLevelStructure !== 'string') {
            currentLevelStructure.forEach((value, key: string[]) => {
              if(level === 0) {
                const subCategoryUrl = `/catalogue/${key[1]}`;
                this.listCatDyn.push({ id: key[0], label: key[1], url: subCategoryUrl });
              }
              if(level === 1) {
                const subCategoryUrl = `/catalogue/${segments[1]}/${key[1]}`;
                this.listCatDyn.push({ id: key[0], label: key[1], url: subCategoryUrl });
              }
              if(level === 2) {
                const subCategoryUrl = `/catalogue/${segments[1]}/${segments[2]}/${key[1]}`;
                this.listCatDyn.push({ id: key[0], label: key[1], url: subCategoryUrl });
              }
            });
          }
        });
      }
    }
  }

  leaveItem(): void {
    this.showList = false;
  }
}
