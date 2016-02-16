import { Component, View, provide } from 'angular2/core';
import { RouteConfig, ROUTER_DIRECTIVES, Router } from 'angular2/router';
import { TestLogger } from './../components/logger';
import { FoodMenuListComponent } from './../components/foodmenu-list.component';
import { FoodMenuDetailComponent } from './../components/foodmenu-detail.component';

@Component({
    directives: [ROUTER_DIRECTIVES],
    template: `<h3>This is place where food menus administration is held</h3>
        <br />
        <button (click)="navigateToList()">List view</button>
        <p>Some kind of food menus dashboard is expected here...</p>
        <router-outlet></router-outlet>
        `
})
@RouteConfig([
        { path: 'list/', name: 'FoodMenuList', component: FoodMenuListComponent, useAsDefault: true },
        { path: 'detail/:id', name: 'FoodOrder_FoodMenu_DetailComponent', component: FoodMenuDetailComponent }
])
export class FoodMenusComponent {

    navigateToList() {
        this.router.navigate(['FoodMenuList']);
    }

    constructor(logger: TestLogger, private router: Router) {
        logger.log("Food menu center initiated!");
    }
}