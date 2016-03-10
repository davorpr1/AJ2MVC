/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/jqueryui/jqueryui.d.ts" />
/// <reference path="../../typings/kendo-ui/kendo-ui.d.ts" />

import { Input, Output, HostBinding, AfterViewInit, HostListener, EventEmitter, Component, Self, Attribute, ViewEncapsulation, ElementRef } from 'angular2/core';
import { ControlValueAccessor, NgControl } from 'angular2/common';
import { IEntityDataService, IEmptyConstruct } from './../models/interfaces';

declare var jQuery: JQueryStatic;

@Component({
    selector: 'kendo-datepick[ngControl], kendo-datepick[ngFormControl], kendo-datepick[ngModel]',
    encapsulation: ViewEncapsulation.Emulated,
    template: `<div><input id="inputCon"></div>`,
    host: {
        '(change)': 'onChange($event.target.value())',
        '(input)': 'onChange($event.target.value())',
        '(blur)': 'onTouched()'
    },
    inputs: ['minDate', 'maxDate']
})
export class KendoDatePickerComponent implements ControlValueAccessor, AfterViewInit {
    onChange: Function = (_: any) => { };

    private _controlElem: JQuery = null;
    private _datepicker: kendo.ui.DatePicker = null;

    onTouched: Function = () => { };
    private _controlID: number;
    private static staticID: number = 1;

    get minDate(): Date { return this._datepicker.max(); }
    set minDate(value: Date) { if (this._datepicker) this._datepicker.min(value); }

    get maxDate(): Date { return this._datepicker.max(); }
    set maxDate(value: Date) { if (this._datepicker) this._datepicker.max(value); }

    constructor( @Self() cd: NgControl, private elRef: ElementRef) {
        cd.valueAccessor = this; // Validation will not work if we don't set the control's value accessor
        this._controlID = ++KendoDatePickerComponent.staticID;
    }
    registerOnChange(fn: (_: any) => void): void {
        this.onChange = (value: any) => { fn(value); };
    }
    registerOnTouched(fn: () => void): void { this.onTouched = fn; }

    writeValue(value: any): void {
        if (!value) { return; }
        this._datepicker.value(value);
    }

    ngAfterViewInit() {
        var that = this;
        jQuery(this.elRef.nativeElement).find("#inputCon").attr('id', 'inputCon_KendoDP_' + this._controlID);
        this._controlElem = jQuery(jQuery(this.elRef.nativeElement).find('#inputCon_KendoDP_' + this._controlID));
        this._datepicker = this._controlElem.kendoDatePicker({
            change(event: kendo.ui.DatePickerChangeEvent) {
                that.onChange(event.sender.value());
            },
            format: 'dd.MM.yyyy.'
        }).data("kendoDatePicker");
    }
}
