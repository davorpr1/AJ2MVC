import { Component, OnInit } from 'angular2/core';
import { FORM_DIRECTIVES, FormBuilder, Validators, ControlGroup, AbstractControl } from 'angular2/common';
import { Http, HTTP_PROVIDERS, Response, Request, RequestOptions, RequestMethod, Headers, BrowserXhr } from 'angular2/http';
import { RouteConfig, ROUTER_DIRECTIVES, RouteParams, Router } from 'angular2/router';
import { TestLogger } from './../components/logger';
import { Restaurant } from './../models/restaurant';
import { RestaurantsService } from './../services/restaurants.service';

@Component({
    directives: [FORM_DIRECTIVES],
    template: `<h3>Restaurant details</h3>
            <br />
            <p>{{restaurant.Name}}</p>
            <form [ngFormModel]="restaurantForm" (ngSubmit)="onSubmit()">
              <div class="form-group">
                <label for="Name">Name</label>
                <input ngControl="Name" type="text" [(ngModel)]="restaurant.Name">
                <div *ngIf="nameControl.hasError('required') && !nameControl.pristine" class="ui error message">Name is required</div>
              </div>
              <div class="form-group">
                <label for="Address">Address</label>
                <input ngControl="Address" type="text" [(ngModel)]="restaurant.Address">
                <div *ngIf="addressControl.hasError('required') && !addressControl.pristine" class="ui error message">Address is required</div>
                <div *ngIf="addressControl.hasError('noComma') && !addressControl.pristine" class="ui error message">Address has to contain comma</div>
              </div>

            <div *ngIf="!restaurantForm.valid && restaurantForm.dirty"  
                    class="alert alert-danger">Restaurant data is not valid</div>

              <button type="submit" class="btn btn-default" [disabled]="!restaurantForm.valid">Submit</button>
            </form>
        `
})
export class RestaurantDetailComponent implements OnInit {
    private _id: string;
    private restaurant: Restaurant = new Restaurant();
    private restaurantForm: ControlGroup;
    private nameControl: AbstractControl;
    private addressControl: AbstractControl;

    constructor(private logger: TestLogger,
        routeParams: RouteParams,
        private router: Router,
        private http: Http,
        private restaurantService: RestaurantsService,
        private fb: FormBuilder    )
    {
        this.restaurantService.initializeDataStructure(new Restaurant());

        this._id = routeParams.get("id");

        this.restaurantService.data$.subscribe(updatedRestaurants => {
            this.restaurant = updatedRestaurants.find(rest => rest.ID === this._id);
            if (!this.restaurant) this.restaurant = new Restaurant();
        });
        this.restaurantService.fetchEntity(this._id).then((_rest: Restaurant) => {
            this.restaurant = _rest;
        });

        this.restaurantForm = fb.group({
            Name: ["", Validators.compose(this.restaurant.getValidators()["Name"])],
            Address: ["", Validators.compose(this.restaurant.getValidators()["Address"])]
        });
        this.nameControl = this.restaurantForm.controls['Name'];
        this.addressControl = this.restaurantForm.controls['Address'];

        logger.log("Restaurant detail initiated!");
    }

    onSubmit() {
        this.restaurantService.updateEntity(this.restaurant);
        this.router.navigate(['RestaurantList']);
    }

    ngOnInit() {
        // Something cheerful...
    }
}