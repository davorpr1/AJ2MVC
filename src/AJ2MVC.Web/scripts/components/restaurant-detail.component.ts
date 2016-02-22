import { Component, OnInit, DynamicComponentLoader, ElementRef, ComponentRef, Injectable, Input, Injector, Provider } from 'angular2/core';
import { FORM_DIRECTIVES, FormBuilder, Validators, ControlGroup, AbstractControl } from 'angular2/common';
import { Http, HTTP_PROVIDERS, Response, Request, RequestOptions, RequestMethod, Headers, BrowserXhr } from 'angular2/http';
import { RouteConfig, ROUTER_DIRECTIVES, RouteParams, Router } from 'angular2/router';
import { TestLogger } from './../components/logger';
import { Restaurant } from './../models/restaurant';
import { IEntityDataService, IEntityContainer, IOverrideDetailComponent } from './../models/interfaces';
import { OverrideableDetailComponent } from './../components/overrideable.component';

import { ComponentOverridesFactory } from './../factories/component-overrides.factory';

@Component({
    directives: [FORM_DIRECTIVES],
    selector: 'restaurant-detail',
    template: `<div #DEFAULTANCHOR></div>
            <h3>Restaurant details</h3>
            <br />
            <p>{{entity.Name}}</p>
            <form [ngFormModel]="restaurantForm" (ngSubmit)="onSubmit()">
              <div #formStart></div>
              <div class="form-group">
                <label for="Name">Name</label>
                <input ngControl="Name" type="text" [(ngModel)]="entity.Name">
                <div *ngIf="nameControl.hasError('required') && !nameControl.pristine" class="ui error message">Name is required</div>
              </div>
              <div class="form-group">
                <label for="Address">Address</label>
                <input ngControl="Address" type="text" [(ngModel)]="entity.Address">
                <div *ngIf="addressControl.hasError('required') && !addressControl.pristine" class="ui error message">Address is required</div>
                <div *ngIf="addressControl.hasError('noComma') && !addressControl.pristine" class="ui error message">Address has to contain comma</div>
              </div>
            <div #formEnd></div>
            <div *ngIf="!restaurantForm.valid && restaurantForm.dirty && !restaurantForm.pending"  
                    class="alert alert-danger">Restaurant data is not valid</div>

              <button type="submit" class="btn btn-default" [disabled]="!restaurantForm.dirty || !restaurantForm.valid || restaurantForm.pending">Submit</button>
            </form>
        `
})
@Injectable()
export class RestaurantDetailComponent extends OverrideableDetailComponent implements IEntityContainer {
    @Input() private entityID: string;
    public entity: Restaurant = new Restaurant();
    public restaurantForm: ControlGroup;
    private nameControl: AbstractControl;
    private addressControl: AbstractControl;

    constructor(private logger: TestLogger,
        routeParams: RouteParams,
        private router: Router,
        private http: Http,
        private entityService: IEntityDataService,
        public dynamicComponentLoader: DynamicComponentLoader,
        public injector: Injector,
        public elementRef: ElementRef,
        private fb: FormBuilder)
    {
        super(logger, dynamicComponentLoader, injector, elementRef);
        this.entityID = routeParams.get("id");

        this.entityService.data$.subscribe(updatedRestaurants => {
            this.entity.setModelData(updatedRestaurants.find(rest => rest.ID === this.entityID && rest instanceof Restaurant) as Restaurant);
            if (!this.entity) this.entity = new Restaurant();
        });
        this.entityService.fetchEntity(Restaurant, this.entityID).then((_rest: any) => {
            this.entity.setModelData(_rest as Restaurant);
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
        // this.router.navigate(['RestaurantList']);
    }
    /*
    ngOnInit() {
        super.ngOnInit();
        this.logger.log("Restaurant detail OnInit call");
        // Something cheerful...
    }*/
}