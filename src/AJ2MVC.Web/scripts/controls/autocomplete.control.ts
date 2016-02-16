/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/jqueryui/jqueryui.d.ts" />

import { Component, View, provide, AfterViewInit, ElementRef, Input, Output, EventEmitter} from 'angular2/core';
import { ControlValueAccessor, NgModel, FORM_DIRECTIVES } from 'angular2/common';

import { IEntityDataService, IEmptyConstruct, FieldFilter } from './../models/interfaces';

declare var jQuery: JQueryStatic;

@Component({
    selector: "autocomplete[ngModel]",
    directives: [FORM_DIRECTIVES],
    template: `<input id="inputCon" (keyup)="autocompleteValueChange($event, d)" [value]="_value">`
})
export class AutocompleteComponent implements ControlValueAccessor, AfterViewInit {
    _value: string = "";
    _id: string;
    cd: NgModel;
    private onChange: Function;
    private onTouched: Function;
    private elRef: ElementRef;
    @Output() private onSelected: EventEmitter<string> = new EventEmitter<string>();
    @Input() private dataSource: IEntityDataService;
    @Input() private entityType: IEmptyConstruct;

    constructor(element: ElementRef, cd: NgModel) {
        cd.valueAccessor = this;
        this.cd = cd;
        this.elRef = element;
    }

    get valueID(): string { return this._id; }
    set valueID(newValue: string) {
        if (this._id !== newValue) {
            this._id = newValue;
            this.cd.viewToModelUpdate(newValue);
            this.dataSource.fetchEntity(this.entityType, newValue).then((rest: any) => { this._value = rest.Name; });
        }
    }

    writeValue(valueID: string): void {
        if (!valueID) { return; }
        if (!this._id || this._id !== valueID) {
            this._id = valueID;
            this.dataSource.fetchEntity(this.entityType, valueID).then((rest: any) => { this._value = rest.Name; });
        }
    }
    
    registerOnChange(fn: (_: any) => {}): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: (_: any) => {}): void {
        this.onTouched = fn;
    }

    autocompleteValueChange(event: any, bla: any) {
        console.log(event);
    }

    ngAfterViewInit() {
        var that = this;
        jQuery(this.elRef.nativeElement).find("#inputCon").autocomplete({
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
                console.log(ui.item ?
                    "Selected: " + ui.item.value + " aka " + ui.item.id :
                    "Nothing selected, input was " + this.value);
                that.valueID = ui.item.id;
                that.onSelected.next(ui.item.id);
            },
            focus: function (event, ui) {
                event.preventDefault();
                jQuery(that.elRef.nativeElement).find("#inputCon").val(ui.item.value);
            }
        });
    }
}
