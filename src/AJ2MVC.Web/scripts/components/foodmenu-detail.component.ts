import { Component, ApplicationRef } from 'angular2/core';
import { FORM_DIRECTIVES, FormBuilder, Validators, ControlGroup, AbstractControl } from 'angular2/common';
import { RouteParams, Router } from 'angular2/router';
import { TestLogger } from './../components/logger';
import { FoodMenu } from './../models/foodmenu';
import { Restaurant } from './../models/restaurant';
import { DatePickerComponent } from './../controls/datepicker.control';
import { AutocompleteComponent } from './../controls/autocomplete.control';
import { IEntityDataService, IEmptyConstruct } from './../models/interfaces';

@Component({
    directives: [FORM_DIRECTIVES, DatePickerComponent, AutocompleteComponent],
    template: `<h3>Food menu details</h3>
            <br />
            <p>{{foodMenu.Name}}</p>
            <form [ngFormModel]="foodMenuForm" (ngSubmit)="onSubmit()">
              <div class="form-group">
                <label for="Name">Name</label>
                <input ngControl="Name" type="text" [(ngModel)]="foodMenu.Name">
                <div *ngIf="nameControl.hasError('required') && !nameControl.pristine" class="ui error message">Name is required</div>
              </div>

              <div class="form-group">
                <label for="ActiveFromDate">Active from</label>
                <datepicker [(ngModel)]="foodMenu.ActiveFromDate" [maxDate]="foodMenu.ActiveUntilDate" (onChange)="activeFromDateChanged($event)"></datepicker>
                <div *ngIf="activeFromControl.hasError('required') && !activeFromControl.pristine" class="ui error message">Date from which this menu is available is required</div>
              </div>

              <div class="form-group">
                <label for="ActiveUntilDate">Active until</label>
                <datepicker [(ngModel)]="foodMenu.ActiveUntilDate" [minDate]="foodMenu.ActiveFromDate"></datepicker>
                <div *ngIf="activeUntilControl.hasError('required') && !activeUntilControl.pristine" class="ui error message">Date to which this menu is available is required</div>
              </div>

              <div class="form-group">
                <label for="Restaurant">Restaurant</label>
                <autocomplete [(ngModel)]="foodMenu.RestaurantID" (onSelected)="logValue($event)" [dataSource]="entityService" [entityType]="restaurantType"></autocomplete>
              </div>

            <div *ngIf="!foodMenuForm.valid && foodMenuForm.dirty"  
                    class="alert alert-danger">Food menu data is not valid</div>

              <button type="submit" class="btn btn-default" [disabled]="!foodMenuForm.valid">Submit</button>
            </form>
        `
})
export class FoodMenuDetailComponent {
    private _id: string;
    private cd: number = 1;
    private foodMenu: FoodMenu = new FoodMenu();
    private foodMenuForm: ControlGroup;
    private nameControl: AbstractControl;
    private restaurantType: IEmptyConstruct = Restaurant;
    private activeFromControl: AbstractControl;
    private activeUntilControl: AbstractControl;
     
    logValue(event: any) {
        this.logger.log('Form get event about new value...' + event);
    }

    activeFromDateChanged(event: any) {
        this.activeFromControl.value = event;
        this.activeFromControl.updateValueAndValidity();
        this.logger.log('ActiveFromDate changed (VIA events)....');
    }

    constructor(private logger: TestLogger,
        routeParams: RouteParams,
        private router: Router,
        private entityService: IEntityDataService,
        private fb: FormBuilder,
        private applicationRef: ApplicationRef    )
    {
        this._id = routeParams.get("id");

        this.entityService.data$.subscribe(updatedFoodMenus => {
            this.foodMenu = updatedFoodMenus.find(menu => menu.ID === this._id && (menu instanceof FoodMenu)) as FoodMenu;
            if (!this.foodMenu) this.foodMenu = new FoodMenu();
            this.applicationRef.tick();
        });
        this.entityService.fetchEntity(FoodMenu, this._id).then((_fm: FoodMenu) => {
            this.foodMenu = _fm;
        });

        this.foodMenuForm = fb.group({
            Name: ["", Validators.compose(this.foodMenu.getValidators()["Name"])],
            ActiveFromDate: ["", Validators.compose(this.foodMenu.getValidators()["ActiveFromDate"])],
            ActiveUntilDate: ["", Validators.compose(this.foodMenu.getValidators()["ActiveUntilDate"])]
        });
        this.nameControl = this.foodMenuForm.controls['Name'];
        this.activeFromControl = this.foodMenuForm.controls['ActiveFromDate'];
        this.activeUntilControl = this.foodMenuForm.controls['ActiveUntilDate'];
        
        // TODO: remove this after rerendering is fixed
        var that = this;
        setTimeout(function () {
            that.cd++;
            // to ensure rerendering view
            that.applicationRef.tick();
        }, 100);

        logger.log("FoodMenu detail initiated!");
    }

    onSubmit() {
        this.entityService.updateEntity(FoodMenu, this.foodMenu);
        this.router.navigate(['FoodMenuList']);
    }
}