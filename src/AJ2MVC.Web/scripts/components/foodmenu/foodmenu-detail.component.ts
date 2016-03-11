import { Component, ApplicationRef, ChangeDetectorRef, ChangeDetectionStrategy, provide, Output, EventEmitter } from 'angular2/core';
import { FORM_DIRECTIVES, FormBuilder, Validators, ControlGroup, AbstractControl, NgFormModel } from 'angular2/common';
import { RouteParams, Router, Location } from 'angular2/router';
import { TestLogger } from './../../services/logger';
import { FoodMenu } from './../../models/foodmenu';
import { Restaurant } from './../../models/restaurant';
import { DatePickerComponent } from './../../controls/datepicker.control';
import { AutocompleteComponent } from './../../controls/autocomplete.control';
import { DropdownComponent } from './../../controls/dropdown.control';
import { KendoDatePickerComponent } from './../../controls/kendo-datepicker.control'
import { IEntityDataService, IEmptyConstruct, IEntityContainer, ChangesCommit, DataChanged, DataChangeType } from './../../models/interfaces';
import {Observable} from 'rxjs/Observable';

@Component({
    directives: [FORM_DIRECTIVES, AutocompleteComponent, DatePickerComponent, DropdownComponent, KendoDatePickerComponent],
    templateUrl: `./../components/foodmenu/foodmenu-detail.html`
})
export class FoodMenuDetailComponent implements IEntityContainer {
    private _id: string;
    public entity: FoodMenu = new FoodMenu();
    public entityForm: ControlGroup;
    private restaurantType: IEmptyConstruct = Restaurant;
    @Output() formSubmitted: EventEmitter<ChangesCommit> = new EventEmitter<ChangesCommit>();
    private inProgressChangeID: string = "";

    logValue(event: any) {
        this.logger.log('Form got event about new value...' + event);
    }

    constructor(private logger: TestLogger,
        routeParams: RouteParams,
        private router: Router,
        private entityService: IEntityDataService,
        private fb: FormBuilder,
        private changeDetector: ChangeDetectorRef,
        private location: Location)
    {
        this._id = routeParams.get("id");

        this.entityService.dataObserver.subscribe((updatedFoodMenus: DataChanged) => {
            this.entity = updatedFoodMenus.data.find(menu => menu.ID === this._id && (menu instanceof FoodMenu)) as FoodMenu;
            if (!this.entity) this.entity = new FoodMenu();
            else {
                this.logger.log("Change execution result acknowledged: " + updatedFoodMenus.ID);
            }
            if (this.inProgressChangeID == updatedFoodMenus.ID) this.inProgressChangeID = "";
        });
        this.entityService.fetchEntity(FoodMenu, this._id).then((_fm: FoodMenu) => {
            this.entity = _fm;
        });

        this.entityForm = fb.group({
            Name: ["", Validators.compose(this.entity.getValidators()["Name"].map(x => x.Validator))],
            ActiveFromDate: ["", Validators.required],
            ActiveUntilDate: ["", Validators.required],
            RestaurantID: ["", Validators.required]
        });
        this.entityService.registerNewChangesStream(this.formSubmitted);
        var that = this;
        this.formSubmitted.subscribe((x: ChangesCommit) => {
            that.inProgressChangeID = x.ID;
        });

        logger.log("FoodMenu detail initiated!");
    }

    onSubmit() {
        var myChangeID: string = "FoodMenu_Detail_Form_" + (Math.random() * 1000013);
        this.formSubmitted.next({
            ID: myChangeID,
            DataType: FoodMenu,
            ChnageType: this.entity.ID ? DataChangeType.Update : DataChangeType.Insert,
            data: [this.entity]
        });
    }
}