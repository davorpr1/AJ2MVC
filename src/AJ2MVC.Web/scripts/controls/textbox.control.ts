import { Component, OnInit, DynamicComponentLoader, ElementRef, ComponentRef, Inject, forwardRef, Input } from 'angular2/core';
import { FORM_DIRECTIVES, ControlGroup, Validators, FormBuilder } from 'angular2/common';
import { BaseEntity } from './../models/entitybase';
import { TestLogger } from './../services/logger';
import { IEntityContainer, IOverrideDetailComponent, OverrideDetailComponent, ValidatorDefinition } from './../models/interfaces';

@Component({
    directives: [FORM_DIRECTIVES],
    template: `<div [ngFormModel]="customizedForm">
                <div class="form-group">
                <label for="TextField">New {{propertyName}}</label>
                <input type="text" ngControl="TextField" [(ngModel)]="parent.entity[propertyName]">
                <div *ngFor="#validator of validators">
                    <div *ngIf="customizedForm.controls['TextField'].hasError(validator.ErrorCode) && !customizedForm.controls['TextField'].pristine" class="ui error message">{{validator.ErrorMessage}}</div>
                </div>
              </div></div>`
})
export class TextboxComponent {
    public parent: IEntityContainer = { entity: new BaseEntity(), entityForm: null };
    public customizedForm: ControlGroup;
    @Input() public propertyName: string = "ID";
    private validators: ValidatorDefinition[] = [];

    constructor(private logger: TestLogger,
        private fb: FormBuilder
    ) {
        this.customizedForm = fb.group({ TextField: [""] });

        logger.log("Textbox control constructed!");
    }

    public setParentComponent(parentComponent: IEntityContainer, propertyName: string): void {
        this.parent = parentComponent;
        this.propertyName = propertyName;
        this.validators = this.parent.entity.getValidators()[this.propertyName];
        this.customizedForm.controls['TextField'].validator = Validators.compose(this.validators.map(x => x.Validator));
        parentComponent.entityForm.addControl(this.propertyName, this.customizedForm.controls["TextField"]);
    }
}