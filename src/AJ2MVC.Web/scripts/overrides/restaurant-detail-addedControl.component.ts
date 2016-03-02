import { Component, OnInit, DynamicComponentLoader, ElementRef, ComponentRef, Inject, forwardRef } from 'angular2/core';
import { FORM_DIRECTIVES, FormBuilder, Validators, ControlGroup, AbstractControl, Control } from 'angular2/common';
import { TestLogger } from './../services/logger';
import { Restaurant } from './../models/restaurant';
import { IEntityContainer, IOverrideDetailComponent, OverrideDetailComponent } from './../models/interfaces';
import { RestaurantDetailComponent } from './../components/restaurant/restaurant-detail.component';
import { OverrideableDetailComponent } from './../components/overrideable.component';
import { TextboxComponent } from './../controls/textbox.control';

@Component({
    directives: [FORM_DIRECTIVES],
    template: ` <div #websiteControl></div>`
})
@OverrideDetailComponent({
    hostComponent: RestaurantDetailComponent,
    targetPlaceHolder: "formStart"
})
export class RestaurantDetailCustomWebsiteControlComponent extends OverrideableDetailComponent implements IOverrideDetailComponent, OnInit {
    public customStaticRefID: string = "RestaurantCustomizationComponent_";
    public static ID: number = 0;

    getInstanceID(): string { return this.customStaticRefID; }

    constructor(private logger: TestLogger,
        private elementRef: ElementRef,
        @Inject(forwardRef(() => RestaurantDetailComponent)) private parentComponent: RestaurantDetailComponent
    ) {
        super(logger, parentComponent.dynamicComponentLoader, parentComponent.injector, elementRef);
        this.customStaticRefID += ++RestaurantDetailCustomWebsiteControlComponent.ID;

        logger.log("Restaurant customization initiated!");
    }

    ngOnInit() {
        super.ngOnInit();
        var that = this;
        this.parentComponent.dynamicComponentLoader.loadIntoLocation(TextboxComponent, this.elementRef, 'websiteControl').then((newComp: ComponentRef) => {
            newComp.instance.setParentComponent(that.parentComponent, 'WebSite');
        });
    }
}