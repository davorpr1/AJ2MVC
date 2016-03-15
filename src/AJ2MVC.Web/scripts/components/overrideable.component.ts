import { Component, OnInit, DynamicComponentLoader, ElementRef, ComponentRef, Injectable, Injector, Provider, EventEmitter } from 'angular2/core';
import { TestLogger } from './../services/logger';
import { IOverrideDetailComponent } from './../models/interfaces';

import { ComponentOverridesFactory } from './../factories/component-overrides.factory';
import { BusyIndicatedComponent } from './../components/busy-indicated.component';
@Component({
    template: `<div #DEFAULTANCHOR></div>`
})
@Injectable()
export class OverrideableDetailComponent extends BusyIndicatedComponent implements OnInit {

    public controls: Array<any> = new Array<{ placeHolder: string, component: any, propertyName: string, componentInstance: any }>();
    public initializationComplete: EventEmitter<number> = new EventEmitter<number>();

    constructor(private logger_ODC: TestLogger,
        private dynamicComponentLoader_ODC: DynamicComponentLoader,
        private injector_ODC: Injector,
        public elementRef_ODC: ElementRef
    ) {
        super(logger_ODC, dynamicComponentLoader_ODC, elementRef_ODC);
        logger_ODC.log("Overrideable support initiated!");
    }

    getOverrideListeners(): string[] {
        // get class name from constructor code
        return [this["constructor"].toString().match(/\w+/g)[1]];
    }

    ngOnInit() {
        super.ngOnInit();
        var that = this;
        var factory: ComponentOverridesFactory = this.injector_ODC.get(ComponentOverridesFactory);

        var customizeComponentsLeft: EventEmitter<number> = new EventEmitter<number>();
        var componentsToPrepare: number;

        var overrideComponents: any[] = factory.getAllComponentOverrides(this.getOverrideListeners());
        componentsToPrepare = overrideComponents.length;
        var createdComponents: Array<ComponentRef> = new Array<ComponentRef>();

        customizeComponentsLeft.subscribe((left: number) => {
            if (left == 0) {
                this.controls.map(desc => {
                    var componentCreate: (newComp: ComponentRef, propertyName: string) => void = (newComp: ComponentRef, propPlaceHolder: string) => {
                        that.logger_ODC.log(" *** //// *** Control loaded at (" + propPlaceHolder + ")");
                        that.controls.filter(x => x.placeHolder == propPlaceHolder).map(x => x.componentInstance = newComp.instance);
                    };
                    // check if in defined anchors of current component exists targeted placeholder
                    if ((this.elementRef_ODC as any).internalElement.componentView.appElements.filter((x: any) => x.proto.directiveVariableBindings.hasOwnProperty(desc.placeHolder)).length == 0) {
                        that.logger_ODC.log('*** * ** ** No Anchor ' + desc.placeHolder);
                    } else {
                        this.dynamicComponentLoader_ODC.loadIntoLocation(desc.controlComponent, this.elementRef_ODC, desc.placeHolder).then((newComp: ComponentRef) => {
                            newComp.instance.setParentComponent(that, desc.propertyName);

                            componentCreate(newComp, desc.placeHolder);
                        });
                    }
                });
                createdComponents.map(comp => {
                    if (comp.instance.postControlsCreatedCallback)
                        comp.instance.postControlsCreatedCallback();
                });
                this.initializationComplete.next(1);
            }
        });

        if (componentsToPrepare == 0)
            customizeComponentsLeft.next(0);

        overrideComponents.map(desc => {
            var componentCreate: (newComp: ComponentRef) => void = (newComp: ComponentRef) => {
                createdComponents.push(newComp);
                componentsToPrepare--;
                customizeComponentsLeft.next(componentsToPrepare);
                // that.logger_ODC.log("Custom component loaded: " + (newComp.instance as IOverrideDetailComponent).getInstanceID());
            };
            // check if in defined anchors of current component exists targeted placeholder
            if ((this.elementRef_ODC as any).internalElement.componentView.appElements.filter((x: any) => x.proto.directiveVariableBindings.hasOwnProperty(desc.hostElementPlaceHolder)).length == 0) {
                that.logger_ODC.log('*** * ** ** No Anchor ' + desc.hostElementPlaceHolder);
            } else {
                this.dynamicComponentLoader_ODC.loadIntoLocation(desc.overrideComponent, this.elementRef_ODC, desc.hostElementPlaceHolder).then(componentCreate).catch();
            }
        });       
    }
}