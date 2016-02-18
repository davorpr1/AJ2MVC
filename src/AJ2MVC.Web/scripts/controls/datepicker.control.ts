/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/jqueryui/jqueryui.d.ts" />
/// <reference path="../../typings/moment.d.ts" />

import { Input, Output, HostBinding, AfterViewInit, HostListener, EventEmitter, Component, Self, Attribute, ViewEncapsulation, ElementRef } from 'angular2/core';
import { ControlValueAccessor, NgControl } from 'angular2/common';

declare var jQuery: JQueryStatic;
import * as momment_ from 'moment';
const moment: moment.MomentStatic = (<any>momment_)["default"] || momment_;

@Component({
    selector: 'datepick[ngControl], datepick[ngFormControl], datepick[ngModel]',
    encapsulation: ViewEncapsulation.Emulated,
    template: `<input id="inputCon" type="text" [(value)]="_dateString">`,
    inputs: ['minDate', 'maxDate']
})

export class DatePickerComponent implements ControlValueAccessor, AfterViewInit {
    @Input('date') _date: Date = new Date();
    @Output('change') onChange: EventEmitter<any> = new EventEmitter();

    @HostListener('blur', ['$event'])
    onTouched: Function;
    private _id: number;
    private static staticID: number = 1;
    private _dateString: string = (new Date()).toLocaleDateString('hr');

    get minDate(): Date { return jQuery(this.elRef.nativeElement).find("#" + 'inputCon_SuperDP_' + this._id).datepicker("option", "minDate"); }
    set minDate(value: Date) { jQuery(this.elRef.nativeElement).find("#" + 'inputCon_SuperDP_' + this._id).datepicker("option", "minDate", value); }

    get maxDate(): Date { return jQuery(this.elRef.nativeElement).find("#" + 'inputCon_SuperDP_' + this._id).datepicker("option", "maxDate"); }
    set maxDate(value: Date) { jQuery(this.elRef.nativeElement).find("#" + 'inputCon_SuperDP_' + this._id).datepicker("option", "maxDate", value); }

    constructor( @Self() cd: NgControl, private elRef: ElementRef) {
        cd.valueAccessor = this;
        this._id = ++DatePickerComponent.staticID;
    }
    registerOnChange(fn: (_: any) => void): void {
        this.onChange.subscribe(fn);
    }
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }
    writeValue(value: any): void {
        this._date = value;
        if (this._date instanceof Date)
            this._dateString = this._date.toLocaleDateString('hr');
        else
            this._dateString = "";
    }

    isValidDate(d: any): boolean {
        if (Object.prototype.toString.call(d) !== "[object Date]")
            return false;
        return !isNaN(d.getTime());
    }
    setDate(newValue: string) {
        if (moment(this._date).valueOf() !== moment(newValue, "DD.MM.YYYY.").valueOf()) {
            this._dateString = newValue;
            let newDateValue = moment(newValue, "DD.MM.YYYY.").toDate();
            if (this.isValidDate(newDateValue)) {
                this._date = newDateValue;
                this.onChange.next(newDateValue);
            } else {
                this._date = null;
                this.onChange.next(null);
            }
        }
    }
    ngAfterViewInit() {
        var that = this;
        jQuery.datepicker.setDefaults(jQuery.datepicker.regional['hr']);
        // necessary as jQueryUI works by DOM element ID attribute
        jQuery(this.elRef.nativeElement).find("#inputCon").attr('id', 'inputCon_SuperDP_' + this._id);
        jQuery(this.elRef.nativeElement).find("#" + 'inputCon_SuperDP_' + this._id).datepicker({
            changeMonth: true,
            dateFormat: "dd.mm.yy.",
            onClose: function (selectedDate) {
                that.setDate(selectedDate);
            }
        });
    }
}