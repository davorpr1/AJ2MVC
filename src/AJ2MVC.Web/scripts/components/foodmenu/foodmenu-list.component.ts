import { Component, View, provide, OnInit, AfterViewInit, NgZone, ApplicationRef, ElementRef, ComponentRef, Injector, DynamicComponentLoader } from 'angular2/core';
import { TestLogger } from './../../services/logger';
import { FoodMenu } from './../../models/foodmenu';
import { IDataStructure, IEmptyConstruct } from './../../models/interfaces';
import { OverrideableDetailComponent } from './../../components/overrideable.component';
import { GridComponent } from './../../controls/grid.control';

@Component({
    directives: [GridComponent],
    template: `<div #DEFAULTANCHOR></div>
            <base-grid [entityType]="dataEntity"></base-grid>`
})
export class FoodMenuListComponent extends OverrideableDetailComponent {
    public dataEntity: IEmptyConstruct = FoodMenu;
    constructor(private logger: TestLogger,
        public dynamicComponentLoader: DynamicComponentLoader,
        public injector: Injector,
        public elementRef: ElementRef
    ) {
        super(logger, dynamicComponentLoader, injector, elementRef);
        logger.log("FoodMenu list component initiated!");
    }
}