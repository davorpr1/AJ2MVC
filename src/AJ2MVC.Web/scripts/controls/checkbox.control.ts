import { Input, Output, HostBinding, HostListener, EventEmitter, Component, Self, Attribute, ViewEncapsulation } from 'angular2/core';
import { ControlValueAccessor, NgControl } from 'angular2/common';


@Component({
    selector: 'checkbox[ngControl], checkbox[ngFormControl], checkbox[ngModel]',
    encapsulation: ViewEncapsulation.Emulated,
    template: '<div (click)="toggle($event)">{{_checked}}</div>',
    inputs: [
        'disabled'
    ]
})

export class CheckboxComponent implements ControlValueAccessor {
    @Input('checked') _checked: boolean = false;
    @Output('change') onChange: EventEmitter<any> = new EventEmitter();

    @HostListener('blur', ['$event'])
    onTouched: Function;
    
    private _disabled: boolean = false;

    constructor( @Self() cd: NgControl) {
        cd.valueAccessor = this;
    }

    @HostBinding('attr.aria-checked')
    get checked(): boolean {
        return this._checked;
    }

    @HostBinding('attr.aria-disabled')
    get disabled(): boolean {
        return this._disabled;
    }

    @HostBinding('attr.role')
    get role(): string {
        return 'checkbox';
    }

    set disabled(value) {
        this._disabled = (value != undefined && value != null) && value !== false;
    }

    toggle(event: any): void {
        if (this.disabled) return event.stopPropagation();
        this._checked = !this._checked;
        this.onChange.next(this._checked);
    }
    registerOnChange(fn: (_: any) => void): void {
        this.onChange.subscribe(fn);
    }
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }
    writeValue(value: any): void {
        this._checked = value;
    }
}