import { Component, OnInit, DynamicComponentLoader, ElementRef, ComponentRef, Injectable, Input, Injector, Provider, provide } from 'angular2/core';
import { FORM_DIRECTIVES, FormBuilder, Validators, ControlGroup, AbstractControl } from 'angular2/common';
import { Http, HTTP_PROVIDERS, Response, Request, RequestOptions, RequestMethod, Headers, BrowserXhr } from 'angular2/http';
import { RouteConfig, ROUTER_DIRECTIVES, RouteParams, Router } from 'angular2/router';
import { TestLogger } from './../../services/logger';
import { Restaurant } from './../../models/restaurant';
import { IEntityDataService, IEntityContainer, IOverrideDetailComponent, ControlDefinition } from './../../models/interfaces';
import { OverrideableDetailComponent } from './../../components/overrideable.component';
import { GridComponent } from './../../controls/grid.control';
import { ComponentOverridesFactory } from './../../factories/component-overrides.factory';
import { TextboxComponent } from './../../controls/textbox.control';


@Component({
    directives: [FORM_DIRECTIVES],
    providers: [ComponentRef, provide(IEntityContainer, { useClass: RestaurantDetailComponent })],
    selector: 'restaurant-detail',
    template: `<div #DEFAULTANCHOR></div>
            <h3>Restaurant details</h3>
            <br />
            <p>{{entity.Name}}</p>
            <form [ngFormModel]="entityForm" (ngSubmit)="onSubmit()">
              <div #formStart></div>
              <div #nameControl></div>
              <div #addressControl></div>
            <div #formEnd></div>
            <div *ngIf="entityForm.dirty && !entityForm.pending && !entityForm.valid"  
                    class="alert alert-danger">Restaurant data is not valid</div>

              <button type="submit" class="btn btn-default" [disabled]="!entityForm.dirty || !entityForm.valid || entityForm.pending">Submit</button>
            </form>
        `
})
@Injectable()
export class RestaurantDetailComponent extends OverrideableDetailComponent implements IEntityContainer {
    @Input() private entityID: string;
    public entity: Restaurant = new Restaurant();
    public controls: Array<ControlDefinition> = [
        { placeHolder: 'nameControl', propertyName: 'Name', controlComponent: TextboxComponent },
        { placeHolder: 'addressControl', propertyName: 'Address', controlComponent: TextboxComponent }
    ];
    public entityForm: ControlGroup;

    constructor(private logger: TestLogger,
        routeParams: RouteParams,
        private router: Router,
        private http: Http,
        private entityService: IEntityDataService,
        public dynamicComponentLoader: DynamicComponentLoader,
        public injector: Injector,
        public elementRef: ElementRef,
        private fb: FormBuilder,
        private compRef: ComponentRef)
    {
        super(logger, dynamicComponentLoader, injector, elementRef);
        this.entityID = routeParams.get("id");
        this.entityService.dataObserver.subscribe((updatedRestaurants: any[]) => {
            this.entity.setModelData(updatedRestaurants.find(rest => rest.ID === this.entityID && rest instanceof Restaurant) as Restaurant);
            if (!this.entity) this.entity = new Restaurant();
        });
        this.entityService.fetchEntity(Restaurant, this.entityID).then((_rest: any) => {
            this.entity.setModelData(_rest as Restaurant);
        });
        this.entityForm = fb.group({ });

        logger.log("Restaurant detail initiated!");
    }

    onSubmit() {
        this.entityService.updateEntity(Restaurant, this.entity);
        // this.router.navigate(['RestaurantList']);
    }
}