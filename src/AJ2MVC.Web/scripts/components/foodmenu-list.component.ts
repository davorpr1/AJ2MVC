import { Component, View, provide, OnInit, AfterViewInit, NgZone, ApplicationRef } from 'angular2/core';
import { TestLogger } from './../components/logger';
import { FoodMenu } from './../models/foodmenu';
import { Restaurant } from './../models/restaurant';
import { IDataStructure, IEmptyConstruct } from './../models/interfaces';
import { EntityListComponent } from './../components/entity-list.component';

@Component({
    directives: [EntityListComponent],
    template: `<entity-list [entityType]="dataEntity"></entity-list>`
})
export class FoodMenuListComponent {
    private dataEntity: IEmptyConstruct = FoodMenu;
    constructor(private logger: TestLogger) {
        logger.log("FoodMenu list component initiated!");
    }
}