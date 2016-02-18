/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/jqueryui/jqueryui.d.ts" />

import { Input, Output, HostBinding, AfterViewInit, HostListener, EventEmitter, Component, Self, Attribute, ViewEncapsulation, ElementRef } from 'angular2/core';
import { ControlValueAccessor, NgControl } from 'angular2/common';
import { IEntityDataService, IEmptyConstruct } from './../models/interfaces';

declare var jQuery: JQueryStatic;

@Component({
    selector: 'super-textbox[ngControl], super-textbox[ngFormControl], super-textbox[ngModel]',
    providers: [NgControl],
    encapsulation: ViewEncapsulation.Emulated,
    template: `<input id="inputCon" type="text" (blur)="touched()" (keypress)="dataChange()" [(value)]="_value">`
})
export class SuperTextboxComponent implements ControlValueAccessor, AfterViewInit {
    @Input('value') _value: string = "";
    @Output('change') onChange: EventEmitter<any> = new EventEmitter();
    @Output() private onSelected: EventEmitter<string> = new EventEmitter<string>();

    @HostListener('blur', ['$event'])
    @Output('touch') onTouched: EventEmitter<any> = new EventEmitter();

    private _controlID: number;
    private static staticID: number = 1;
    @Input() private dataSource: IEntityDataService;
    @Input() private entityType: IEmptyConstruct;

    constructor( @Self() cd: NgControl, private elRef: ElementRef) {
        cd.valueAccessor = this; // Validation will not work if we don't set the control's value accessor
        this._controlID = ++SuperTextboxComponent.staticID;
    }
    touched(event: any) {
        this.onTouched.next(event);
    }
    dataChange(event: any) {
        this.onChange.next(this._value);
    }
    registerOnChange(fn: (_: any) => void): void {
        this.onChange.subscribe(fn);
    }
    registerOnTouched(fn: () => void): void {
        this.onTouched.subscribe(fn);
    }
    writeValue(value: any): void {
        this._value = value;
    }
    ngAfterViewInit() {
        var that = this;
        jQuery(this.elRef.nativeElement).find("#inputCon").attr('id', 'inputCon_SuperTX_' + this._controlID);
        jQuery(jQuery(this.elRef.nativeElement).find('#inputCon_SuperTX_' + this._controlID)).resizable({
        });
    }
}
