/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/jqueryui/jqueryui.d.ts" />
/// <reference path="../../typings/moment.d.ts" />

import { Component, View, provide, AfterViewInit, ElementRef, Input, Output, EventEmitter} from 'angular2/core';
import { ControlValueAccessor, NgModel, FORM_DIRECTIVES } from 'angular2/common';

declare var jQuery: JQueryStatic;

import * as momment_ from 'moment';
const moment: moment.MomentStatic = (<any>momment_)["default"] || momment_;

@Component({
    selector: "datepicker[ngModel]",
    directives: [FORM_DIRECTIVES],
    inputs: ['minDate', 'maxDate'],
    template: `<input id="inputCon" type="text" [(value)]="value">`
})
export class DatePickerComponent implements ControlValueAccessor, AfterViewInit {
    _value: string;
    cd: NgModel;
    @Output() private onChange: EventEmitter<any> = new EventEmitter<any>();
    @Output() private onTouched: EventEmitter<any> = new EventEmitter<any>();
    private elRef: ElementRef;
    private _id: number;
    private static staticID: number = 1;

    get minDate(): Date { return jQuery(this.elRef.nativeElement).find("#" + 'inputCon' + this._id).datepicker("option", "minDate"); }
    set minDate(value: Date) { jQuery(this.elRef.nativeElement).find("#" + 'inputCon' + this._id).datepicker("option", "minDate", value); }

    get maxDate(): Date { return jQuery(this.elRef.nativeElement).find("#" + 'inputCon' + this._id).datepicker("option", "maxDate"); }
    set maxDate(value: Date) { jQuery(this.elRef.nativeElement).find("#" + 'inputCon' + this._id).datepicker("option", "maxDate", value); }

    constructor(element: ElementRef, cd: NgModel) {
        cd.valueAccessor = this;
        this.cd = cd;
        this.elRef = element;
        this._id = ++DatePickerComponent.staticID;
    }

    isValidDate(d: any): boolean {
        if (Object.prototype.toString.call(d) !== "[object Date]")
            return false;
        return !isNaN(d.getTime());
    }

    get value(): string { return this._value; }
    set value(newValue: string) {
        if (moment(this._value, "DD.MM.YYYY.").valueOf() !== moment(newValue, "DD.MM.YYYY.").valueOf()) {
            this._value = newValue;
            let newDateValue = moment(newValue, "DD.MM.YYYY.").toDate();
            if (this.isValidDate(newDateValue)) {
                jQuery(this.elRef.nativeElement).find("#" + 'inputCon' + this._id).datepicker("option", "defaultDate", newDateValue);
                this.cd.viewToModelUpdate(newDateValue);
                this.onChange.next(newDateValue);
            } else {
                this.cd.viewToModelUpdate(null);
                this.onChange.next(null);
            }
        }
        this.onTouched.next(newValue);
    }

    writeValue(value: any): void {
        if (!value) { this._value = ""; }
        else if (value instanceof Date) { this._value = value.toLocaleDateString('hr'); }
        else if (value instanceof moment) { this._value = value.toDate().toLocaleDateString('hr'); }
        else { this._value = value.toString(); }
    }
    
    registerOnChange(fn: (_: any) => {}): void {  }

    registerOnTouched(fn: () => void): void {  }

    ngAfterViewInit() {
        var that = this;
        jQuery(this.elRef.nativeElement).find("#inputCon").attr('id', 'inputCon' + this._id);
        jQuery(this.elRef.nativeElement).find("#" + 'inputCon' + this._id).datepicker({
            changeMonth: true,
            dateFormat: "dd.mm.yy.",
            onClose: function (selectedDate) {
                that.value = selectedDate;
            }
        });
    }
}
