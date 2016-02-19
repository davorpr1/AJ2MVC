﻿import { Component, OnInit, DynamicComponentLoader, ElementRef, ComponentRef, Inject, forwardRef } from 'angular2/core';
import { FORM_DIRECTIVES, FormBuilder, Validators, ControlGroup, AbstractControl, Control } from 'angular2/common';
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
export class RestaurantDetailCustomWebsiteControlComponent implements IOverrideDetailComponent {
    public customStaticRefID: string = "RestaurantCustomizationComponent_";
    public static ID: number = 0;
    private parent: IEntityContainer = { entity: new Restaurant() };
    public customizedForm: ControlGroup;

    getInstanceID(): string { return this.customStaticRefID; }

    constructor(private logger: TestLogger,
        private elementRef: ElementRef,
        private fb: FormBuilder,
        @Inject(forwardRef(() => RestaurantDetailComponent)) parentComponent: RestaurantDetailComponent
    ) {
        this.customStaticRefID += ++RestaurantDetailCustomWebsiteControlComponent.ID;
        this.parent = parentComponent;
        this.customizedForm = fb.group({ WebSite: ["", Validators.compose(this.parent.entity.getValidators()["WebSite"])] });
        parentComponent.restaurantForm.addControl('WebSite', this.customizedForm.controls["WebSite"]);
        logger.log("Restaurant customization initiated!");
    }
    static PlaceHolder: string = "formStart";
}