import { Component, View, provide, OnInit, AfterViewInit, NgZone, ApplicationRef, ElementRef, ComponentRef, Injector } from 'angular2/core';
import { TestLogger } from './../components/logger';
import { FoodMenu } from './../models/foodmenu';
import { Restaurant } from './../models/restaurant';
import { IDataStructure, IEmptyConstruct } from './../models/interfaces';
import { GridComponent } from './../controls/grid.control';

@Component({
    directives: [GridComponent],
    template: `<base-grid [entityType]="dataEntity"></base-grid>`
})
export class FoodMenuListComponent {
    private dataEntity: IEmptyConstruct = FoodMenu;
    constructor(private logger: TestLogger) {
        logger.log("FoodMenu list component initiated!");
    }
}