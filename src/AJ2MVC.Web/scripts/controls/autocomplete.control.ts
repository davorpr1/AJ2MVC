/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/jqueryui/jqueryui.d.ts" />

import { Input, Output, HostBinding, AfterViewInit, HostListener, EventEmitter, Component, Self, Attribute, ViewEncapsulation, ElementRef } from 'angular2/core';
import { ControlValueAccessor, NgControl } from 'angular2/common';
import { IEntityDataService, IEmptyConstruct } from './../models/interfaces';

declare var jQuery: JQueryStatic;

@Component({
    selector: 'autocomplete[ngControl], autocomplete[ngFormControl], autocomplete[ngModel]',
    encapsulation: ViewEncapsulation.Emulated,
    template: `<input id="inputCon" type="text" [(value)]="_idString">`
})
export class AutocompleteComponent implements ControlValueAccessor, AfterViewInit {
    @Input('id') _id: string = "";
    @Output('change') onChange: EventEmitter<any> = new EventEmitter();
    @Output() private onSelected: EventEmitter<string> = new EventEmitter<string>();

    @HostListener('blur', ['$event'])
    onTouched: Function;
    private _controlID: number;
    private static staticID: number = 1;
    private _idString: string = "";
    @Input() private dataSource: IEntityDataService;
    @Input() private entityType: IEmptyConstruct;

    constructor( @Self() cd: NgControl, private elRef: ElementRef) {
        cd.valueAccessor = this; // Validation will not work if we don't set the control's value accessor
        this._controlID = ++AutocompleteComponent.staticID;
    }
    registerOnChange(fn: (_: any) => void): void {
        this.onChange.subscribe(fn);
    }
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }
    writeValue(valueID: any): void {
        if (!valueID) { return; }
        if (!this._id || this._id !== valueID) {
            this._id = valueID;
            this.dataSource.fetchEntity(this.entityType, valueID).then((rest: any) => { this._idString = rest.Name; });
        }
    }
    ngAfterViewInit() {
        var that = this;
        jQuery(this.elRef.nativeElement).find("#inputCon").attr('id', 'inputCon_SuperAC_' + this._controlID);
        jQuery(this.elRef.nativeElement).find('#inputCon_SuperAC_' + this._controlID).autocomplete({
            source: function (request: any, response: any) {
                that.dataSource.filterData(that.entityType, [{ Field: "Name", Operator: "contains", Term: request.term }]).then(
                    (res: any[]) => {
                        response(Array.from(res, (rec: any) => { return { value: rec.Name, id: rec.ID } }));
                    }
                ).catch((err: any) => {
                    console.log("Error while filtering data: " + err);
                });
            },
            minLength: 2,
            select: function (event, ui) {
                that.onChange.next(ui.item.id);
                that._idString = ui.item.value;
                that.onSelected.next(ui.item.id);
            },
            focus: function (event, ui) {
                event.preventDefault();
                jQuery(that.elRef.nativeElement).find('#inputCon_SuperAC_' + that._controlID).val(ui.item.value);
            },
            change: function (event, ui) {
                if (that._idString != jQuery(that.elRef.nativeElement).find('#inputCon_SuperAC_' + that._controlID).val())
                {
                    jQuery(that.elRef.nativeElement).find('#inputCon_SuperAC_' + that._controlID).val("");
                    that._idString = "";
                    that.onChange.next(null);
                }
            }
        });
    }
}
