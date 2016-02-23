import { Component, OnInit, DynamicComponentLoader, ElementRef, ComponentRef, Inject, forwardRef } from 'angular2/core';
import { FORM_DIRECTIVES } from 'angular2/common';
import { TestLogger } from './../components/logger';
import { IEntityContainer, IOverrideDetailComponent, OverrideDetailComponent } from './../models/interfaces';
import { RestaurantDetailComponent } from './../components/restaurant-detail.component';
import { RestaurantDetailCustomWebsiteControlComponent } from './../overrides/restaurant-detail-addedControl.component';

@Component({
    directives: [FORM_DIRECTIVES],
    template: ``
})
@OverrideDetailComponent({
    hostComponent: RestaurantDetailCustomWebsiteControlComponent
})
export class RestaurantDetailNameLabelOverrideComponent implements IOverrideDetailComponent {
    constructor(private logger: TestLogger,
        private elementRef: ElementRef,
        @Inject(forwardRef(() => RestaurantDetailCustomWebsiteControlComponent)) parentComponent: RestaurantDetailCustomWebsiteControlComponent
    ) {
        ((parentComponent.parent as RestaurantDetailComponent).elementRef.nativeElement as HTMLElement).querySelectorAll("label[for='Name'").item(0).textContent += ' - Super';

        logger.log("Restaurant customization 2 initiated!");
    }
    getInstanceID(): string { return "NotDefined"; }
}