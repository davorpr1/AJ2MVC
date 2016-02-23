import { Component, OnInit, DynamicComponentLoader, ElementRef, ComponentRef, Inject, forwardRef } from 'angular2/core';
import { FORM_DIRECTIVES } from 'angular2/common';
import { TestLogger } from './../components/logger';
import { Restaurant } from './../models/restaurant';
import { IDataStructure, IEmptyConstruct } from './../models/interfaces';
import { IEntityContainer, IOverrideDetailComponent, OverrideDetailComponent } from './../models/interfaces';
import { RestaurantListComponent } from './../components/restaurant-list.component';
import { EntityListComponent } from './../components/entity-list.component';

@Component({
    directives: [FORM_DIRECTIVES, EntityListComponent],
    template: `<entity-list [entityType]="dataEntity"></entity-list>`
})
@OverrideDetailComponent({
    hostComponent: RestaurantListComponent,
    targetPlaceHolder: "DEFAULTANCHOR"
})
export class RestaurantListEntityListOverrideComponent implements IOverrideDetailComponent {
    private dataEntity: IEmptyConstruct = Restaurant;
    constructor(private logger: TestLogger,
        private elementRef: ElementRef,
        @Inject(forwardRef(() => RestaurantListComponent)) parentComponent: RestaurantListComponent
    ) {
        this.dataEntity = parentComponent.dataEntity;
        (parentComponent.elementRef_ODC.nativeElement as HTMLElement).querySelectorAll("base-grid").item(0).setAttribute('hidden', 'hidden');
        logger.log("Restaurant list customization - List representation replaced!");
    }
    getInstanceID(): string { return "NotDefined"; }
}