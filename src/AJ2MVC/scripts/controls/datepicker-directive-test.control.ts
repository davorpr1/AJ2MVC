/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/jqueryui/jqueryui.d.ts" />
/// <reference path="../../typings/moment.d.ts" />

import { Directive, View, provide, AfterViewInit, ElementRef, Provider, forwardRef, Renderer} from 'angular2/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, NgModel, FORM_DIRECTIVES, FORM_PROVIDERS } from 'angular2/common';

const DATEPICKER_VALUE_ACCESSOR = () => { return new Provider(
        NG_VALUE_ACCESSOR, { useExisting: forwardRef(() => DatePickerComponent), multi: true }) };

declare var jQuery: JQueryStatic;
import * as momment_ from 'moment';
const moment: moment.MomentStatic = (<any>momment_)["default"] || momment_;

/**
 * The accessor for selecting date value and listening to changes that is used by the
 * {@link NgModel}, {@link NgFormControl}, and {@link NgControlName} directives.
 *
 *  ### Example
 *  ```
 *  <input type="datepicker" [(ngModel)]="birthdate">
 *  ```
 */
@Directive({
    selector: 'input[type=datepicker][ngControl],input[type=datepicker][ngFormControl],input[type=datepicker][ngModel]',
    host: {
        '(change)': 'onChange($event.target.value)'
    },
    bindings: [DATEPICKER_VALUE_ACCESSOR]
})
export class DatePickerComponent implements ControlValueAccessor, AfterViewInit {
    private onChange = (_: any) => { };
    private onTouched = () => { };

    constructor(private _renderer: Renderer, private _elementRef: ElementRef) { }

    writeValue(value: Date): void {
        this._renderer.setElementProperty(this._elementRef.nativeElement, 'value', value.toLocaleDateString('hr-HR'));
    }

    registerOnChange(fn: (_: any) => void): void {
        this.onChange = (value) => { fn(new Date(value)); };
        // this.onChange = (value) => { fn(new Date(Date.parse(value))); }
    }

    registerOnTouched(fn: () => {}): void { this.onTouched = fn; }

    ngAfterViewInit() {
        var that = this;
        jQuery(this._elementRef.nativeElement).datepicker({
            changeMonth: true,
            onClose: function (selectedDate: any) {
                that._renderer.setElementProperty(that._elementRef.nativeElement, 'value', moment(selectedDate).toDate().toLocaleDateString('hr-HR'));
            }
        });
    }
}
