import { Input, Output, HostBinding, AfterViewInit, HostListener, EventEmitter, Component, Self, Attribute, ViewEncapsulation, ElementRef } from 'angular2/core';
import { ControlValueAccessor, NgControl } from 'angular2/common';
import { IEntityDataService, IEmptyConstruct } from './../models/interfaces';

@Component({
    selector: 'dropdown[ngControl], dropdown[ngFormControl], dropdown[ngModel]',
    encapsulation: ViewEncapsulation.Emulated,
    template: `
            <select id="inputCon" [ngModel]="_valueID" (ngModelChange)="updateSelectedValue($event)">
                <option value=""><i>Not selected</i></option>
                <option *ngFor="#option of availableItems" value="{{ option.value }}">{{option.name}}</option>
            </select>`
})
export class DropdownComponent implements ControlValueAccessor, AfterViewInit {
    @Output('change') onChange: EventEmitter<any> = new EventEmitter();
    @Output() private onSelected: EventEmitter<string> = new EventEmitter<string>();

    @HostListener('blur', ['$event'])
    onTouched: Function;
    private _controlID: number;
    private _valueID: string = null;
    private static staticID: number = 1;
    public availableItems: Array<{ value: string, name: string }>;
    @Input() private dataSource: IEntityDataService;
    @Input() private entityType: IEmptyConstruct;

    constructor( @Self() cd: NgControl, private elRef: ElementRef) {
        cd.valueAccessor = this; // Validation will not work if we don't set the control's value accessor
        this._controlID = ++DropdownComponent.staticID;
    }
    registerOnChange(fn: (_: any) => void): void {
        this.onChange.subscribe(fn);
    }
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }
    writeValue(valueID: any): void {
        if (!valueID) { return; }
        var that = this;
        setTimeout(() => { that._valueID = valueID; });
    }

    updateSelectedValue(event: any) {
        this._valueID = event;
        this.onChange.next(event);
    }

    ngAfterViewInit() {
        var that = this;
        setTimeout(() => {
            that.dataSource.dataObserver.subscribe((changes: any) => {
                that.availableItems = that.dataSource.getCurrentLibrary(that.entityType).map((x: any) => { return { value: x.ID, name: x.Name }; });
                that.writeValue(that._valueID); // refresh value selection
            });
            that.dataSource.initdataLoad(that.entityType);
            that.availableItems = that.dataSource.getCurrentLibrary(that.entityType).map((x: any) => { return { value: x.ID, name: x.Name }; });
            that.writeValue(that._valueID); // refresh value selection
        }, 0);
    }
}
