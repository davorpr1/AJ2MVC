import { Component, OnInit, DynamicComponentLoader, ElementRef, ComponentRef } from 'angular2/core';
import { FORM_DIRECTIVES, FormBuilder, Validators, ControlGroup, AbstractControl, Control } from 'angular2/common';
import { Http, HTTP_PROVIDERS, Response, Request, RequestOptions, RequestMethod, Headers, BrowserXhr } from 'angular2/http';
import { RouteConfig, ROUTER_DIRECTIVES, RouteParams, Router } from 'angular2/router';
import { TestLogger } from './../components/logger';
import { Restaurant } from './../models/restaurant';
import { IEntityContainer, IOverrideDetailComponent } from './../models/interfaces';
import { RestaurantDetailComponent } from './../components/restaurant-detail.component';

@Component({
    directives: [FORM_DIRECTIVES],
    template: `<div [ngFormModel]="customizedForm">
                <div class="form-group">
                <label for="WebSite">Web site</label>
                <input ngControl="WebSite" type="text" [(ngModel)]="parent.entity.WebSite">
                <div *ngIf="customizedForm.controls['WebSite'].hasError('required') && !customizedForm.controls['WebSite'].pristine" class="ui error message">Web site is required</div>
                <div *ngIf="customizedForm.controls['WebSite'].hasError('notValidURL') && !customizedForm.controls['WebSite'].pristine" class="ui error message">Web site in not valid URL</div>
              </div></div>`
})
export class RestaurantCustomizationComponent implements IOverrideDetailComponent {
    public customStaticRefID: string = "RestaurantCustomizationComponent_";
    public static ID: number = 0;
    private parent: IEntityContainer = { entity: new Restaurant() };
    public customizedForm: ControlGroup;

    constructor(private logger: TestLogger,
        private elementRef: ElementRef,
        private fb: FormBuilder 
    ) {
        this.customStaticRefID += ++RestaurantCustomizationComponent.ID;
        this.customizedForm = fb.group({ WebSite: [""] });
        logger.log("Restaurant customization initiated!");
    }
    getPlaceHolder(): string { return "formStart"; }

    public setContainerForm(parentComponent: RestaurantDetailComponent) {
        this.parent = parentComponent;
        this.customizedForm.controls["WebSite"].validator = Validators.compose(this.parent.entity.getValidators()["WebSite"]);
        parentComponent.restaurantForm.addControl('WebSite', this.customizedForm.controls["WebSite"]);
    }
}