import { Component, OnInit, DynamicComponentLoader, ElementRef, ComponentRef, Inject, forwardRef } from 'angular2/core';
import { FORM_DIRECTIVES } from 'angular2/common';
import { TestLogger } from './../services/logger';
import { FoodMenu } from './../models/foodmenu';
import { IDataStructure, IEmptyConstruct } from './../models/interfaces';
import { IEntityContainer, IOverrideDetailComponent, OverrideDetailComponent, FieldFilter } from './../models/interfaces';
import { FoodMenuListComponent } from './../components/foodmenu/foodmenu-list.component';
import { EntityListControl } from './../controls/entity-list.control';

@Component({
    directives: [FORM_DIRECTIVES, EntityListControl],
    template: `<entity-list [entityType]="dataEntity" [filters]="filters" [editLink]="editLink"></entity-list>`
})
@OverrideDetailComponent({
    hostComponent: FoodMenuListComponent
})
export class FoodMenuListEntityListOverrideComponent implements IOverrideDetailComponent {
    private dataEntity: IEmptyConstruct = FoodMenu;
    private filters: Array<FieldFilter> = new Array<FieldFilter>();
    private editLink: string = "/FoodMenuCenter/FoodOrder_FoodMenu_DetailComponent";

    constructor(private logger: TestLogger,
        private elementRef: ElementRef,
        @Inject(forwardRef(() => FoodMenuListComponent)) parentComponent: FoodMenuListComponent
    ) {
        this.dataEntity = parentComponent.dataEntity;
        (parentComponent.elementRef_ODC.nativeElement as HTMLElement).querySelectorAll("base-grid").item(0).setAttribute('hidden', 'hidden');
        this.filters = parentComponent.filters;
        parentComponent.filterChanged.subscribe((newFilters: FieldFilter[]) => {
            this.filters = newFilters;
            logger.log("FoodMenu list customization - Got new filters: " + this.filters.length);
        });
        logger.log("FoodMenu list customization - List representation replaced!");
    }
    getInstanceID(): string { return "NotDefined"; }
}