import { Component, View, Input, provide, OnInit, AfterViewInit, NgZone, ApplicationRef, ElementRef, ComponentRef, Injector, DynamicComponentLoader, EventEmitter } from 'angular2/core';
import { RouteParams } from 'angular2/router';
import { TestLogger } from './../../services/logger';
import { FoodMenu } from './../../models/foodmenu';
import { IDataStructure, IEmptyConstruct } from './../../models/interfaces';
import { OverrideableDetailComponent } from './../../components/overrideable.component';
import { GridComponent } from './../../controls/grid.control';
import { AppMenuItem, FieldFilter } from './../../models/interfaces';

@Component({
    directives: [GridComponent],
    selector: 'foodmenu-list',
    template: `<div #DEFAULTANCHOR></div>
            <base-grid [entityType]="dataEntity" [filters]="filters"></base-grid>`
})
@AppMenuItem({
    Name: "Food menus",
    Link: "./FoodMenuCenter/FoodMenuList",
    Tooltip: "Food menu list"
})
export class FoodMenuListComponent extends OverrideableDetailComponent {
    public dataEntity: IEmptyConstruct = FoodMenu;
    private _restaurantID: string = "";
    @Input() set restaurantID(newID: string) {
        this._restaurantID = newID;
        this.setRestaurantFilter();
    }

    public filters: Array<FieldFilter> = new Array<FieldFilter>();
    public filterChanged: EventEmitter<Array<FieldFilter>> = new EventEmitter<Array<FieldFilter>>();
    private setRestaurantFilter() {
        if (this._restaurantID && this._restaurantID.length > 0) {
            this.filters = new Array<FieldFilter>({ Field: "RestaurantID", Operator: "equal", Term: this._restaurantID });
            this.filterChanged.next(this.filters);
        }
    }

    constructor(private logger: TestLogger,
        routeParams: RouteParams,
        public dynamicComponentLoader: DynamicComponentLoader,
        public injector: Injector,
        public elementRef: ElementRef
    ) {
        super(logger, dynamicComponentLoader, injector, elementRef);
        var restID: string = routeParams.get("restaurantid");
        if (restID && restID.length > 0) this.restaurantID = restID; 

        // prepared before base-grid component is initialized
        this.setRestaurantFilter();

        logger.log("FoodMenu list component initiated!");
    }
}