import { Component, ComponentRef, forwardRef, Inject } from 'angular2/core';
import { TestLogger } from './../services/logger';
import { OverrideDetailComponent } from './../models/interfaces';
import { RestaurantDetailComponent } from './../components/restaurant/restaurant-detail.component';
import { SuperTextboxWrapComponent } from './../controls/super-textbox.wrap-control';

@Component({ template: `` })
@OverrideDetailComponent({
    hostComponent: RestaurantDetailComponent
})
export class RestaurantDetailNameLabelOverrideComponent {

    constructor(private logger: TestLogger,
        @Inject(forwardRef(() => RestaurantDetailComponent)) parentComponent: RestaurantDetailComponent
    ) {
        parentComponent.controls.filter(x => x.propertyName == 'Name').map(x => x.controlComponent = SuperTextboxWrapComponent);
        logger.log("Restaurant customization 2 initiated!");
    }
}