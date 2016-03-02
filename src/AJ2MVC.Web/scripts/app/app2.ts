/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/jqueryui/jqueryui.d.ts" />

import {Component, provide, Injectable, ElementRef, AfterViewInit} from 'angular2/core';
import {FORM_PROVIDERS, NgModel} from 'angular2/common';
import { RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS, Router, HashLocationStrategy, LocationStrategy } from 'angular2/router';
import { Http, HTTP_PROVIDERS, Response, Request, RequestOptions, RequestMethod, Headers, BrowserXhr } from 'angular2/http';
import {bootstrap} from 'angular2/platform/browser';
import { TestLogger } from './../services/logger';
import { GlobalDataSharing, MenuItem, IRouteMechanism } from './../controls/menu';

import { RestaurantsComponent } from './../components/restaurant/restaurants.component';
import { FoodMenusComponent } from './../components/foodmenu/foodmenus.component';
import { LocalStorageService } from './../services/local-storage.service';
import { RhetosRestService } from './../services/rhetos-rest.service';

import { PermissionProvider } from './../services/permission-provider.service';

import { FoodMenu } from './../models/foodmenu';
import { Restaurant } from './../models/restaurant';
import { IDataStructure, IEntityDataService, OverrideComponentDescriptor, IEntityContainer } from './../models/interfaces';
import { ComponentOverridesFactory } from './../factories/component-overrides.factory';
import { RestaurantDetailCustomWebsiteControlComponent } from './../overrides/restaurant-detail-addedControl.component';
import { RestaurantDetailNameLabelOverrideComponent } from './../overrides/restaurant-detail-nameControl.component';
import { FoodMenuListEntityListOverrideComponent } from './../overrides/foodmenu-list-entityList.component';
import { MenuComponent } from './../controls/menu'

declare var jQuery: JQueryStatic;

@Component({
    selector: "admin-space",
    directives: [ROUTER_DIRECTIVES, MenuComponent],
    template: `
        <app-menu></app-menu>
        <h1>Food ordering Administration</h1>
        <div class="col-xs-9" style="border:1px;">
            <router-outlet></router-outlet>
        </div>
    `
})
@RouteConfig([
    { path: '/center/...', name: 'RestaurantCenter', component: RestaurantsComponent, useAsDefault: true },
    { path: '/menus/...', name: 'FoodMenuCenter', component: FoodMenusComponent }
])
class App2Component implements AfterViewInit {

    constructor(private m_elementRef: ElementRef,
        private logger: TestLogger,
        private http: Http,
        private permissionService: PermissionProvider
    ) {
        let x: any = RestaurantDetailNameLabelOverrideComponent; // just to trigger decorator code
        x = RestaurantDetailCustomWebsiteControlComponent; // just to trigger decorator code
        x = FoodMenuListEntityListOverrideComponent; // just to trigger decorator code
    }

    ngAfterViewInit() {
        this.logger.log("Application initialized!");
    }
    
}

@Injectable()
export class CORSBrowserXHr extends BrowserXhr {

    build(): any {
        var x: any = super.build();
        x['withCredentials'] = true;
        return x;
    }
}

bootstrap(App2Component, [
    RhetosRestService, PermissionProvider, LocalStorageService, ComponentOverridesFactory, IEntityContainer,

    provide(IEntityDataService, { useClass: RhetosRestService }),

    provide(TestLogger, { useClass: TestLogger }),
    provide(GlobalDataSharing, { useClass: GlobalDataSharing }),
    HTTP_PROVIDERS, ROUTER_PROVIDERS, FORM_PROVIDERS, NgModel,
    provide(BrowserXhr, { useClass: CORSBrowserXHr }),
    provide(LocationStrategy, { useClass: HashLocationStrategy })
]);