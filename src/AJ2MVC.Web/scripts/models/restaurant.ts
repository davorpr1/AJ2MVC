"use strict";

import { EventEmitter } from 'angular2/core';
import { Validators, Control } from 'angular2/common';

import { BaseEntity } from './../models/entitybase';
import { FieldDefinition } from './../models/interfaces';

function containsCommaValidator(control: Control): { [s: string]: boolean } {
    if (!control.value || !control.value.match(/[A-Za-z0-9 ]\,[ A-Za-z]/)) {
        return { noComma: true };
    }
}

function urlValidator(control: Control): { [s: string]: boolean } {
    if (!control.value || !control.value.match(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/)) {
        return { notValidURL: true };
    }
}

export class Restaurant extends BaseEntity {
    public Name: string;
    public Address: string;
    public Description: string;
    public WebSite: string;
    public DateOpened: string;
    public DateClosed: string;

    public ID: string;

    get browseFields(): Array<FieldDefinition> { return [{ Name: "Name", Pipe: "", DataType: "string" }, { Name: "Address", Pipe: "", DataType: "string" }, { Name: "WebSite", Pipe: "", DataType: "string" }]; }

    getNewInstance(): Restaurant { return new Restaurant(); }
    getModuleName(): string { return "FoodOrder"; }
    getEntityName(): string { return "Restaurant"; }

    public getValidators(): { [propName: string]: Function[]; } {
        return {
            "Name": [Validators.required, Validators.minLength(3)],
            "Address": [Validators.required, containsCommaValidator],
            "WebSite": [Validators.required, urlValidator]
        };
    }

    public setModelData(modelData: Restaurant) {
        if (modelData) {
            this.ID = modelData.ID;
            this.Name = modelData.Name;
            this.Address = modelData.Address;
            this.Description = modelData.Description;
            this.WebSite = modelData.WebSite;
            this.DateOpened = modelData.DateOpened;
            this.DateClosed = modelData.DateClosed;
        }
    }
}

