import { Component, OnInit, DynamicComponentLoader, ElementRef, ComponentRef } from 'angular2/core';
import { FORM_DIRECTIVES, FormBuilder, Validators, ControlGroup, AbstractControl } from 'angular2/common';
import { Http, HTTP_PROVIDERS, Response, Request, RequestOptions, RequestMethod, Headers, BrowserXhr } from 'angular2/http';
import { RouteConfig, ROUTER_DIRECTIVES, RouteParams, Router } from 'angular2/router';
import { TestLogger } from './../components/logger';
import { Restaurant } from './../models/restaurant';
import { IEntityDataService, IEntityContainer } from './../models/interfaces';

import { RestaurantCustomizationComponent } from './../components/generic-detail.component';

@Component({
    directives: [FORM_DIRECTIVES],
    template: `<h3>Restaurant details</h3>
            <br />
            <p>{{restaurant.Name}}</p>
            <form [ngFormModel]="restaurantForm" (ngSubmit)="onSubmit()">
              <div #formStart></div>
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

              <button type="submit" class="btn btn-default" [disabled]="!restaurantForm.dirty || !restaurantForm.valid">Submit</button>
            </form>
        `
})
export class RestaurantDetailComponent implements OnInit, IEntityContainer {
    private _id: string;
    public entity: Restaurant = new Restaurant();
    public restaurantForm: ControlGroup;
    private nameControl: AbstractControl;
    private addressControl: AbstractControl;

    constructor(private logger: TestLogger,
        routeParams: RouteParams,
        private router: Router,
        private http: Http,
        private entityService: IEntityDataService,
        private dynamicComponentLoader: DynamicComponentLoader,
        public elementRef: ElementRef,
        private fb: FormBuilder    )
    {
        this._id = routeParams.get("id");

        this.entityService.data$.subscribe(updatedRestaurants => {
            this.entity = updatedRestaurants.find(rest => rest.ID === this._id && rest instanceof Restaurant) as Restaurant;
            if (!this.entity) this.entity = new Restaurant();
        });
        this.entityService.fetchEntity(Restaurant, this._id).then((_rest: any) => {
            this.entity = _rest as Restaurant;
        });

        this.restaurantForm = fb.group({
            Name: ["", Validators.compose(this.entity.getValidators()["Name"])],
            Address: ["", Validators.compose(this.entity.getValidators()["Address"])]
        });
        this.nameControl = this.restaurantForm.controls['Name'];
        this.addressControl = this.restaurantForm.controls['Address'];

        logger.log("Restaurant detail initiated!");
    }

    onSubmit() {
        this.entityService.updateEntity(Restaurant, this.entity);
        this.router.navigate(['RestaurantList']);
    }

    ngOnInit() {
        var that = this;
        // TODO: load registered components to be loaded
        this.dynamicComponentLoader.loadIntoLocation(RestaurantCustomizationComponent, this.elementRef, 'formStart').then(
            (newComp: ComponentRef) => {
                that.logger.log("Custom component loaded: " + (newComp.instance as RestaurantCustomizationComponent).customStaticRefID);
                (newComp.instance as RestaurantCustomizationComponent).setContainerForm(that);
            }
        );
        // Something cheerful...
    }
}