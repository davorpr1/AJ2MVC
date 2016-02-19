import { Component, OnInit, DynamicComponentLoader, ElementRef, ComponentRef, Inject, forwardRef } from 'angular2/core';
import { FORM_DIRECTIVES } from 'angular2/common';
import { TestLogger } from './../components/logger';
import { IEntityContainer, IOverrideDetailComponent, OverrideDetailComponent } from './../models/interfaces';
import { RestaurantDetailComponent } from './../components/restaurant-detail.component';

@Component({
    directives: [FORM_DIRECTIVES],
    template: ``
})
@OverrideDetailComponent({
    hostComponent: RestaurantDetailComponent,
    targetPlaceHolder: "DEFAULTANCHOR"
})
export class RestaurantDetailNameLabelOverrideComponent extends IOverrideDetailComponent {
    constructor(private logger: TestLogger,
        private elementRef: ElementRef,
        @Inject(forwardRef(() => RestaurantDetailComponent)) parentComponent: RestaurantDetailComponent
    ) {
        super();
        // jQuery(jQuery((parentComponent as RestaurantDetailComponent).elementRef.nativeElement).find("[ngcontrol='Name']")).parent().attr("hidden", "hidden");
        jQuery(jQuery((parentComponent as RestaurantDetailComponent).elementRef.nativeElement).find("label[for='Name']")).text(
            jQuery(jQuery((parentComponent as RestaurantDetailComponent).elementRef.nativeElement).find("label[for='Name']")).text() + ' - Super'
        );
        logger.log("Restaurant customization 2 initiated!");
    }
}