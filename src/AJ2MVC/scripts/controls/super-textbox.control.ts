/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/jqueryui/jqueryui.d.ts" />

import { Component, View, provide, AfterViewInit, ElementRef} from 'angular2/core';
import { ControlValueAccessor, NgModel } from 'angular2/common';

declare var jQuery: JQueryStatic;

@Component({
    selector: "super-textbox[ngModel]",
    template: `<input id="inputCon" type="text" [(ngModel)]="value">`
})
export class SuperTextboxComponent implements ControlValueAccessor, AfterViewInit {
    _value: string;
    cd: NgModel;
    private onChange: Function;
    private onTouched: Function;
    private elRef: ElementRef;

    constructor(element: ElementRef, cd: NgModel) {
        cd.valueAccessor = this;
        this.cd = cd;
        this.elRef = element;
    }

    get value(): string { return this._value; }
    set value(newValue: string) { if (this._value !== newValue) { this._value = newValue; this.cd.viewToModelUpdate(newValue); } }

    private setValue(value: string): void {
        this._value = value;
        this.cd.viewToModelUpdate(value);
    }

    writeValue(value: string): void {
        if (!value) { return; }
        this.setValue(value);
    }

    registerOnChange(fn: (_: any) => {}): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: (_: any) => {}): void {
        this.onTouched = fn;
    }

    ngAfterViewInit() {
        var that = this;
        jQuery(jQuery(this.elRef.nativeElement).find("#inputCon")).resizable({
            
        });
    }
}