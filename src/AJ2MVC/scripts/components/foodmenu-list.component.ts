import { Component, View, provide, ApplicationRef } from 'angular2/core';
import { FORM_DIRECTIVES } from 'angular2/common';
import { Router } from 'angular2/router';
import { TestLogger } from './../components/logger';
import { FoodMenu } from './../models/foodmenu';
import { FoodMenuService } from './../services/foodmenu.service';

@Component({
    directives: [FORM_DIRECTIVES],
    template: `
        <p>Food menus list</p>
        <table class="baseTable">
            <tr>
                <th>Name</th>
                <th>Active from</th>
                <th>Active until</th>
                <th>About</th>
            </tr>
            <tr *ngFor="#foodmenu of foodMenus" >
                <td>{{foodmenu.Name}}</td>
                <td>{{foodmenu.ActiveFromDate | date}}</td>
                <td>{{foodmenu.ActiveUntilDate | date}}</td>
                <td><a (click)="openDetail(foodmenu)">About</a></td>
            </tr>
        </table>
        <button type="button" class="info" (click)="triggerRefreshData()">Refresh food menus</button>
        <button type="button" class="info" (click)="newFoodMenu()">New food menu</button>
        `
})
export class FoodMenuListComponent {
    private foodMenus: Array<FoodMenu> = new Array<FoodMenu>();
    private cd: number = 1;
    constructor(private logger: TestLogger,
        private router: Router,
        private foodMenuService: FoodMenuService,
        private applicationRef: ApplicationRef)
    {
        this.foodMenuService.data$.subscribe(updatedFoodMenus => {
            this.foodMenus = updatedFoodMenus;
            this.applicationRef.tick();
        });
        this.foodMenuService.initdataLoad();
        this.foodMenus = this.foodMenuService.getCurrentLibrary();

        // TODO: remove this after rerendering is fixed
        var that = this;
        setTimeout(function () {
            that.cd++;
            // to ensure rerendering view
            that.applicationRef.tick();
        }, 100);

        logger.log("Food menu list component initiated!");
    }

    triggerRefreshData() {
        this.foodMenuService.reloadData();
    }

    newFoodMenu() {
        this.openDetail(new FoodMenu());
    }

    openDetail(foodMenu: FoodMenu) {
        this.router.navigate(['FoodMenuDetail', { id: foodMenu.ID }]);
    }
}