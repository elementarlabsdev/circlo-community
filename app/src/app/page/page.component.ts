import { Component, inject, OnInit } from '@angular/core';
import { ApiService } from '@services/api.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Page } from '@model/interfaces';
import { SeoService } from '@ngstarter/components/core';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';
import {
  BreadcrumbItem,
  Breadcrumbs,
  BreadcrumbSeparator
} from '@ngstarter/components/breadcrumbs';
import { BlocksContent } from '@app/blocks-content/blocks-content';

@Component({
  standalone: true,
  imports: [
    ImageProxyPipe,
    BreadcrumbItem,
    BreadcrumbSeparator,
    Breadcrumbs,
    RouterLink,
    BlocksContent,
  ],
  templateUrl: './page.component.html',
  styleUrl: './page.component.scss'
})
export class PageComponent implements OnInit {
  private _apiService = inject(ApiService);
  private _seoService = inject(SeoService);
  private _route = inject(ActivatedRoute);
  page: Page;

  ngOnInit() {
    this._apiService
      .get(`page/${this._route.snapshot.params['slug']}`)
      .subscribe((res: any) => {
        this.page = res.page;
        this._seoService.updateTitle(this.page.metaTitle || this.page.title);
        this._seoService.updateDescription(this.page.metaDescription);
        this._seoService.updateOgImage(this.page.featuredImageUrl);
      })
    ;
  }
}
