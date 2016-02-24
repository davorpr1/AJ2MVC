import { Component, View, provide } from 'angular2/core';
import { RouteConfig, ROUTER_DIRECTIVES, Router } from 'angular2/router';
import { TestLogger } from './../../services/logger';
import { RestaurantListComponent } from './../../components/restaurant/restaurant-list.component';
import { RestaurantWrapperComponent } from './../../components/restaurant/restaurant-wrapper.component';
import { AppMenuItem } from './../../models/interfaces';

@Component({
    directives: [ROUTER_DIRECTIVES],
    template: `<h3>This is place where restaurants administration is held</h3>
        <br />
        <button (click)="navigateToList()">List view</button>
        <p>Some kind of restaurants dashboard is expected here...</p>
        <router-outlet></router-outlet>
        `
})
@RouteConfig([
    { path: 'list/', name: 'RestaurantList', component: RestaurantListComponent, useAsDefault: true },
    { path: 'detail/:id', name: 'FoodOrder_Restaurant_DetailComponent', component: RestaurantWrapperComponent }
])
@AppMenuItem({
    Name: "Restaurants",
    Link: "./RestaurantCenter/RestaurantList",
    Tooltip: "List of restaurants"
})
export class RestaurantsComponent {

    navigateToList() {
        this.router.navigate(['RestaurantList']);
    }

    constructor(logger: TestLogger, private router: Router) {
        logger.log("Restaurant center initiated!");
    }
}