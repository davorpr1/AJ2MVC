import { Component, View, Input, provide, ViewChild, OnInit, NgZone, ApplicationRef, ElementRef, ComponentRef, Injector, DynamicComponentLoader, EventEmitter } from 'angular2/core';
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
    template: `<div #DEFAULTANCHOR></div>RestaurantID: {{_restaurantID}}
            <base-grid [entityType]="dataEntity" #foodmenu_grid ></base-grid>`
})
@AppMenuItem({
    Name: "Food menus",
    Link: "./FoodMenuCenter/FoodMenuList",
    Tooltip: "Food menu list"
})
export class FoodMenuListComponent extends OverrideableDetailComponent implements OnInit {
    public dataEntity: IEmptyConstruct = FoodMenu;
    private _restaurantID: string = "";
    @Input() set restaurantID(newID: string) {
        this._restaurantID = newID;
        if (this._restaurantID) {
            this.setFilters([{ Field: "RestaurantID", Operator: "equal", Term: this._restaurantID }]);
        }
    }
    @ViewChild('foodmenu_grid') grid: GridComponent;

    public filters: Array<FieldFilter> = null;
    public filterChanged: EventEmitter<Array<FieldFilter>> = new EventEmitter<Array<FieldFilter>>();
    public setFilters(newFilters: Array<FieldFilter>) {
        this.filters = newFilters;
        if (this.grid)
            this.grid.setFilters(newFilters);
        this.filterChanged.next(this.filters);
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

        logger.log("FoodMenu list component initiated!");
    }

    ngOnInit() {
        super.ngOnInit();
        this.logger.log("FoodMenu list component ngAfterViewInit!");
        // just to propagate filters declared before view initialization
        this.restaurantID = this._restaurantID;
    }
}