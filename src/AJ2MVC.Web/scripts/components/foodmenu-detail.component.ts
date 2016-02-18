import { Component, ApplicationRef, ChangeDetectorRef, ChangeDetectionStrategy } from 'angular2/core';
import { FORM_DIRECTIVES, FormBuilder, Validators, ControlGroup, AbstractControl } from 'angular2/common';
import { RouteParams, Router } from 'angular2/router';
import { TestLogger } from './../components/logger';
import { FoodMenu } from './../models/foodmenu';
import { Restaurant } from './../models/restaurant';
import { DatePickerComponent } from './../controls/datepicker.control';
import { AutocompleteComponent } from './../controls/autocomplete.control';
import { IEntityDataService, IEmptyConstruct } from './../models/interfaces';

@Component({
    directives: [FORM_DIRECTIVES, AutocompleteComponent, DatePickerComponent],
    template: `<h3>Food menu details</h3>
            <br />
            <p>{{foodMenu.Name}}</p>
            <form [ngFormModel]="foodMenuForm" (ngSubmit)="onSubmit()">
              <div class="form-group">
                <label for="Name">Name</label>
                <input ngControl="Name" type="text" [(ngModel)]="foodMenu.Name">
                <div *ngIf="foodMenuForm.controls['Name'].hasError('required') && !foodMenuForm.controls['Name'].pristine" class="ui error message">Menu name is required</div>
              </div>

              <div class="form-group">
                <label for="ActiveFromDate">Active from</label>
                <datepick ngControl="ActiveFromDate" [(ngModel)]="foodMenu.ActiveFromDate" [maxDate]="foodMenu.ActiveUntilDate"></datepick>
                <div *ngIf="foodMenuForm.controls['ActiveFromDate'].hasError('required') && !foodMenuForm.controls['ActiveFromDate'].pristine" class="ui error message">Date from which menu is active is required</div>
              </div>

              <div class="form-group">
                <label for="ActiveUntilDate">Active until</label>
                <datepick ngControl="ActiveUntilDate" [(ngModel)]="foodMenu.ActiveUntilDate" [minDate]="foodMenu.ActiveFromDate"></datepick>
                <div *ngIf="foodMenuForm.controls['ActiveUntilDate'].hasError('required') && !foodMenuForm.controls['ActiveUntilDate'].pristine" class="ui error message">Date until which menu is active is required</div>
              </div>

              <div class="form-group">
                <label for="Restaurant">Restaurant</label>
                <autocomplete ngControl="RestaurantID" [(ngModel)]="foodMenu.RestaurantID" (onSelected)="logValue($event)" [dataSource]="entityService" [entityType]="restaurantType"></autocomplete>
                <div *ngIf="foodMenuForm.controls['RestaurantID'].hasError('required') && !foodMenuForm.controls['RestaurantID'].pristine" class="ui error message">Restaurant is required</div>
              </div>

            <div *ngIf="!foodMenuForm.valid && foodMenuForm.dirty"  
                    class="alert alert-danger">Food menu data is not valid</div>

              <button type="submit" class="btn btn-default" [disabled]="!foodMenuForm.valid">Submit</button>
            </form>
        `
})
export class FoodMenuDetailComponent {
    private _id: string;
    private foodMenu: FoodMenu = new FoodMenu();
    private foodMenuForm: ControlGroup;
    private restaurantType: IEmptyConstruct = Restaurant;

    logValue(event: any) {
        this.logger.log('Form get event about new value...' + event);
    }

    constructor(private logger: TestLogger,
        routeParams: RouteParams,
        private router: Router,
        private entityService: IEntityDataService,
        private fb: FormBuilder,
        private changeDetector: ChangeDetectorRef)
    {
        this._id = routeParams.get("id");

        this.entityService.data$.subscribe(updatedFoodMenus => {
            this.foodMenu = updatedFoodMenus.find(menu => menu.ID === this._id && (menu instanceof FoodMenu)) as FoodMenu;
            if (!this.foodMenu) this.foodMenu = new FoodMenu();
        });
        this.entityService.fetchEntity(FoodMenu, this._id).then((_fm: FoodMenu) => {
            this.foodMenu = _fm;
        });

        this.foodMenuForm = fb.group({
            Name: ["", Validators.compose(this.foodMenu.getValidators()["Name"])],
            ActiveFromDate: ["", Validators.required],
            ActiveUntilDate: ["", Validators.required],
            RestaurantID: ["", Validators.required]
        });

        logger.log("FoodMenu detail initiated!");
    }

    onSubmit() {
        this.entityService.updateEntity(FoodMenu, this.foodMenu);
        this.router.navigate(['FoodMenuList']);
    }
}