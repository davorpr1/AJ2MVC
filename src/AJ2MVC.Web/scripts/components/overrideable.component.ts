import { Component, OnInit, DynamicComponentLoader, ElementRef, ComponentRef, Injectable, Injector, Provider } from 'angular2/core';
import { TestLogger } from './../components/logger';
import { IOverrideDetailComponent } from './../models/interfaces';

import { ComponentOverridesFactory } from './../factories/component-overrides.factory';

@Component({
    template: `<div #DEFAULTANCHOR></div>`
})
@Injectable()
export class OverrideableDetailComponent implements OnInit {
    constructor(private logger_ODC: TestLogger,
        private dynamicComponentLoader_ODC: DynamicComponentLoader,
        private injector_ODC: Injector,
        public elementRef_ODC: ElementRef
    ) {
        logger_ODC.log("Overrideable support initiated!");
    }

    getOverrideListeners(): string[] {
        // get class name from constructor code
        return [this["constructor"].toString().match(/\w+/g)[1]];
    }

    ngOnInit() {
        var that = this;
        var factory: ComponentOverridesFactory = this.injector_ODC.get(ComponentOverridesFactory);
        factory.getAllComponentOverrides(this.getOverrideListeners()).map(desc => {
            this.dynamicComponentLoader_ODC.loadIntoLocation(desc.overrideComponent, this.elementRef_ODC, desc.hostElementPlaceHolder).then(
                (newComp: ComponentRef) => {
                    that.logger_ODC.log("Custom component loaded: " + (newComp.instance as IOverrideDetailComponent).getInstanceID());
                }
            );
        });
    }
}