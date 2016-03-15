import { Component, ApplicationRef, ChangeDetectorRef, ChangeDetectionStrategy, provide, Output, EventEmitter, DynamicComponentLoader, ElementRef, Injector, Injectable, OnInit, OnDestroy } from 'angular2/core';
import { FORM_DIRECTIVES, FormBuilder, Validators, ControlGroup, AbstractControl, NgFormModel } from 'angular2/common';
import { RouteParams, Router, Location } from 'angular2/router';
import { TestLogger } from './../../services/logger';
import { FoodMenu } from './../../models/foodmenu';
import { Restaurant } from './../../models/restaurant';
import { DatePickerComponent } from './../../controls/datepicker.control';
import { AutocompleteComponent } from './../../controls/autocomplete.control';
import { DropdownComponent } from './../../controls/dropdown.control';
import { KendoDatePickerComponent } from './../../controls/kendo-datepicker.control'
import { IEntityDataService, IEmptyConstruct, IEntityContainer, ChangesCommit, DataChanged, DataChangeType, OverrideDataDefinition } from './../../models/interfaces';
import {Observable} from 'rxjs/Observable';
import { OverrideableDetailComponent } from './../../components/overrideable.component';

@Component({
    directives: [FORM_DIRECTIVES, AutocompleteComponent, DatePickerComponent, DropdownComponent, KendoDatePickerComponent],
    templateUrl: `./../components/foodmenu/foodmenu-detail.html`
})
@Injectable()
export class FoodMenuDetailComponent extends OverrideableDetailComponent implements IEntityContainer, OnInit, OnDestroy {
    private _id: string;
    public entity: FoodMenu = new FoodMenu();
    public entityForm: ControlGroup;
    private restaurantType: IEmptyConstruct = Restaurant;
    @Output() formSubmitted: EventEmitter<ChangesCommit> = new EventEmitter<ChangesCommit>();
    private inProgressChangeID: string = null;

    logValue(event: any) {
        this.logger.log('Form got event about new value...' + event);
    }

    constructor(private logger: TestLogger,
        routeParams: RouteParams,
        private router: Router,
        private entityService: IEntityDataService,
        public dynamicComponentLoader: DynamicComponentLoader,
        public injector: Injector,
        public elementRef: ElementRef,
        private fb: FormBuilder,
        private changeDetector: ChangeDetectorRef,
        private location: Location)
    {
        super(logger, dynamicComponentLoader, injector, elementRef);
        this._id = routeParams.get("id");

        this.entityService.dataObserver.subscribe((updatedFoodMenus: DataChanged) => {
            this.entity = updatedFoodMenus.data.find(menu => menu.ID === this._id && (menu instanceof FoodMenu)) as FoodMenu;
            if (!this.entity) this.entity = new FoodMenu();
            else {
                this.logger.log("Change execution result acknowledged: " + updatedFoodMenus.ID);
            }
            if (this.inProgressChangeID && this.inProgressChangeID == updatedFoodMenus.ID) {
                this.inProgressChangeID = null;
                this.busy = false;
                this.location.back();
            }
        });
        this.busy = true;
        this.entityService.fetchEntity(FoodMenu, this._id).then((_fm: FoodMenu) => {
            this.entity = _fm;
            this.busy = false;
        });

        this.entityForm = fb.group({
            Name: ["", Validators.compose(this.entity.getValidators()["Name"].map(x => x.Validator))],
            ActiveFromDate: ["", Validators.required],
            ActiveUntilDate: ["", Validators.required],
            RestaurantID: ["", Validators.required]
        });

        
        logger.log("FoodMenu detail initiated!");
    }

    ngOnInit() {
        super.ngOnInit();
        var that = this;
        this.entityService.registerNewChangesStream(that.formSubmitted);
    }

    ngOnDestroy() {
        this.formSubmitted.complete();
    }

    onSubmit() {
        var myChangeID: string = "FoodMenu_Detail_Form_" + (Math.random() * 1000013);
        this.inProgressChangeID = myChangeID;
        this.busy = true;
        this.formSubmitted.next({
            ID: myChangeID,
            DataType: FoodMenu,
            ChnageType: this.entity.ID ? DataChangeType.Update : DataChangeType.Insert,
            data: [this.entity]
        });
    }
}