/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/jqueryui/jqueryui.d.ts" />
/// <reference path="../../typings/kendo-ui/kendo-ui.d.ts" />

import { Input, Output, HostBinding, AfterViewInit, HostListener, EventEmitter, Component, Self, Attribute, ViewEncapsulation, ElementRef } from 'angular2/core';
import { ControlValueAccessor, NgControl } from 'angular2/common';
import { IEntityDataService, IEmptyConstruct } from './../models/interfaces';

declare var jQuery: JQueryStatic;

@Component({
    selector: 'super-textbox[ngControl], super-textbox[ngFormControl], super-textbox[ngModel]',
    encapsulation: ViewEncapsulation.Emulated,
    template: `<div><textarea id="inputCon" [(value)]="_value"></textarea></div>`,
    host: {
        '(change)': 'onChange($event.target.value)',
        '(input)': 'onChange($event.target.value)',
        '(blur)': 'onTouched()'
    },
})
export class SuperTextboxComponent implements ControlValueAccessor, AfterViewInit {
    @Input('val') _value: string = "";
    onChange: Function = (_: any) => { };

    private _controlElem: JQuery = null;
    private _textEditor: any = null;
    private _height: number = 25;
    @Input() set height(newHeight: number) {
        this._height = newHeight;
        if (this._controlElem) {
           // this._controlElem.height(newHeight);
           // this._controlElem.parent().height(newHeight);
        }
    }

    onTouched: Function = () => { };
    private _controlID: number;
    private static staticID: number = 1;

    constructor( @Self() cd: NgControl, private elRef: ElementRef) {
        cd.valueAccessor = this; // Validation will not work if we don't set the control's value accessor
        this._controlID = ++SuperTextboxComponent.staticID;
    }
    registerOnChange(fn: (_: any) => void): void {
        this.onChange = (value: any) => { fn(value); };
    }
    registerOnTouched(fn: () => void): void { this.onTouched = fn; }

    writeValue(value: any): void {
        if (!value) { return; }
        this._value = value;
        this._textEditor.value(this._value);
    }

    ngAfterViewInit() {
        var that = this;
        jQuery(this.elRef.nativeElement).find("#inputCon").attr('id', 'inputCon_SuperTX_' + this._controlID);
        this._controlElem = jQuery(jQuery(this.elRef.nativeElement).find('#inputCon_SuperTX_' + this._controlID));
        /*this._controlElem.resizable({
            minHeight: this._height,
            animate: true
        });*/
        this._textEditor = this._controlElem.kendoEditor({
            tools: [
                "formatting",
                "bold", "italic", "underline",
                "strikethrough", "subscript", "superscript",
                "justifyLeft", "justifyCenter", "justifyRight", "justifyFull",
                "insertUnorderedList", "insertOrderedList", "indent", "outdent"
            ],
            change: function (event: kendo.ui.EditorEvent) {
                that.onChange(event.sender.element.val());
            },
            keyup: function (event: any) {
                that.onChange(event.target.textContent);
            }
        }).data("kendoEditor");
    }
}
