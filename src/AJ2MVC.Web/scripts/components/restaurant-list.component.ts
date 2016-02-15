import { Component, View, provide, OnInit, AfterViewInit, NgZone, ApplicationRef } from 'angular2/core';
import { TestLogger } from './../components/logger';
import { Restaurant } from './../models/restaurant';
import { EntityListComponent } from './../components/entity-list.component';

@Component({
    directives: [EntityListComponent],
    template: `<entity-list [entity]="dataEntity"></entity-list>`
})
export class RestaurantListComponent {
    private dataEntity: Restaurant = new Restaurant();
    constructor(private logger: TestLogger) {
        logger.log("Restaurant list component initiated!");
    }
}