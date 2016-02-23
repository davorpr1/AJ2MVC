import { Component, View, provide, OnInit, AfterViewInit, NgZone, ApplicationRef, DynamicComponentLoader, Injector, ElementRef } from 'angular2/core';
import { TestLogger } from './../components/logger';
import { Restaurant } from './../models/restaurant';
import { IDataStructure, IEmptyConstruct } from './../models/interfaces';
import { OverrideableDetailComponent } from './../components/overrideable.component';
import { GridComponent } from './../controls/grid.control';

@Component({
    directives: [GridComponent],
    template: `<div #DEFAULTANCHOR></div>
            <base-grid [entityType]="dataEntity"></base-grid>`
})
export class RestaurantListComponent extends OverrideableDetailComponent {
    public dataEntity: IEmptyConstruct = Restaurant;
    constructor(private logger: TestLogger,
        public dynamicComponentLoader: DynamicComponentLoader,
        public injector: Injector,
        public elementRef: ElementRef
    ) {
        super(logger, dynamicComponentLoader, injector, elementRef);
        logger.log("Restaurant list component initiated!");
    }
}