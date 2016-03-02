import { Component, ApplicationRef, ChangeDetectorRef, ChangeDetectionStrategy, provide } from 'angular2/core';
import { FORM_DIRECTIVES, FormBuilder, Validators, ControlGroup, AbstractControl } from 'angular2/common';
import { RouteParams, Router, Location } from 'angular2/router';
import { TestLogger } from './../../services/logger';
import { FoodMenu } from './../../models/foodmenu';
import { Restaurant } from './../../models/restaurant';
import { DatePickerComponent } from './../../controls/datepicker.control';
import { AutocompleteComponent } from './../../controls/autocomplete.control';
import { IEntityDataService, IEmptyConstruct, IEntityContainer } from './../../models/interfaces';

@Component({
    directives: [FORM_DIRECTIVES, AutocompleteComponent, DatePickerComponent],
    templateUrl: `./../components/foodmenu/foodmenu-detail.html`
})
export class FoodMenuDetailComponent implements IEntityContainer {
    private _id: string;
    public entity: FoodMenu = new FoodMenu();
    public entityForm: ControlGroup;
    private restaurantType: IEmptyConstruct = Restaurant;

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

        this.entityService.dataObserver.subscribe((updatedFoodMenus: any[]) => {
            this.entity = updatedFoodMenus.find(menu => menu.ID === this._id && (menu instanceof FoodMenu)) as FoodMenu;
            if (!this.entity) this.entity = new FoodMenu();
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

        logger.log("FoodMenu detail initiated!");
    }

    onSubmit() {
        this.entityService.updateEntity(FoodMenu, this.entity);
        this.location.back();
        // this.router.navigate(['FoodMenuList']);
    }
}