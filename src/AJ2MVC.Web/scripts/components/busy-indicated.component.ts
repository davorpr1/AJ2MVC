import { Component, OnInit, DynamicComponentLoader, ElementRef, ComponentRef, Injectable, Provider, EventEmitter, Input, Output } from 'angular2/core';
import { TestLogger } from './../services/logger';

import { BusyOverlayComponent } from './../components/busy-overlay.component';

@Component({
    template: `<div #DEFAULTANCHOR></div>`
})
@Injectable()
export class BusyIndicatedComponent implements OnInit {
    protected _busy: boolean = false;
    @Output() busyChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Input() public set busy(newValue: boolean) {
        this._busy = newValue;
        this.busyChanged.next(newValue);
    }

    constructor(private logger_BI: TestLogger,
        private dynamicComponentLoader_BI: DynamicComponentLoader,
        public elementRef_BI: ElementRef
    ) {
        logger_BI.log("Busy indicator support initiated!");
    }

    ngOnInit() {
        var that = this;
        // check if in defined anchors of current component exists targeted placeholder
        if ((this.elementRef_BI as any).internalElement.componentView.appElements.filter((x: any) => x.proto.directiveVariableBindings.hasOwnProperty("busyOverlayPlace")).length == 0) {
            this.dynamicComponentLoader_BI.loadNextToLocation(BusyOverlayComponent, this.elementRef_BI).then((newComp: ComponentRef) => {
                (newComp.instance as BusyOverlayComponent).inProgressID = that._busy;
                that.busyChanged.subscribe((newValue: boolean) => {
                    (newComp.instance as BusyOverlayComponent).inProgressID = newValue;
                });
            });
        } else {
            this.dynamicComponentLoader_BI.loadIntoLocation(BusyOverlayComponent, this.elementRef_BI, "busyOverlayPlace").then((newComp: ComponentRef) => {
                (newComp.instance as BusyOverlayComponent).inProgressID = that._busy;
                that.busyChanged.subscribe((newValue: boolean) => {
                    (newComp.instance as BusyOverlayComponent).inProgressID = newValue;
                });
            });
        }
    }
}