import { Component, View, provide, OnInit, AfterViewInit, NgZone, ApplicationRef } from 'angular2/core';
import { Http, HTTP_PROVIDERS, Response, Request, RequestOptions, RequestMethod, Headers, BrowserXhr } from 'angular2/http';
import { RouteConfig, ROUTER_DIRECTIVES, Router } from 'angular2/router';
import { TestLogger } from './../components/logger';
import { Restaurant } from './../models/restaurant';
import { GlobalDataSharing, MenuItem } from './../components/menu';
import { RestaurantsService } from './../services/restaurants.service';

@Component({
    template: `
        <p>Resturants list</p>
        <table class="baseTable">
            <tr>
                <th>Name</th>
                <th>Address</th>
                <th>WebSite</th>
                <th>About</th>
            </tr>
            <tr *ngFor="#restaurant of restaurants" >
                <td>{{restaurant.Name}}</td>
                <td>{{restaurant.Address}}</td>
                <td>{{restaurant.WebSite}}</td>
                <td><a (click)="openDetail(restaurant)">About</a></td>
            </tr>
        </table>
        <button type="button" class="info" (click)="triggerRefreshData()">Refresh restaurants</button>
        <button type="button" class="info" (click)="newRestaurant()">New restaurant</button>
        `
})
export class RestaurantListComponent implements OnInit, AfterViewInit {
    private restaurants: Array<Restaurant> = new Array<Restaurant>();
    private _rerenderRequired: boolean = true;
    private cd: number = 1;
    constructor(private logger: TestLogger,
        gds: GlobalDataSharing,
        private http: Http,
        private router: Router,
        private restaurantService: RestaurantsService,
        private zone: NgZone,
        private applicationRef: ApplicationRef)
    {
        this.restaurantService.data$.subscribe(updatedRestaurants => this.restaurants = updatedRestaurants);
        this.restaurantService.initdataLoad();
        this.restaurants = this.restaurantService.getCurrentLibrary();
        var that = this;

        setTimeout(function () {
            that.cd++;
            // to ensure rerendering view
            that.applicationRef.tick();
        }, 100);

        logger.log("Restaurant list component initiated!");
    }

    triggerRefreshData() {
        this.restaurantService.reloadData();
    }

    newRestaurant() {
        this.openDetail(new Restaurant());
    }

    openDetail(restaurant: Restaurant) {
        this.router.navigate(['RestaurantDetail', { id: restaurant.ID }]);
    }

    ngAfterViewInit() {
        this.logger.log('Restaurant list component AfterViewInit invoked.');        
    }
    
    ngOnInit() {
        this.logger.log('Restaurant list component OnInit invoked.');
        this._rerenderRequired = false;
        // something cheerfully written here
    }

}