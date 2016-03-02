/// <reference path="../../typings/moment.d.ts" />

import { EventEmitter } from 'angular2/core';
import { Validators, Validator } from 'angular2/common';
import { BaseEntity } from './../models/entitybase';
import { FieldDefinition, ValidatorDefinition } from './../models/interfaces';
import * as momment_ from 'moment';
const moment: moment.MomentStatic = (<any>momment_)["default"] || momment_;

export class FoodMenu extends BaseEntity {
    public Name: string;
    public ActiveFrom: string;
    public ActiveUntil: string;
    public RestaurantID: string;
    public ID: string;    

    private _activeFromDate: Date;
    private _activeUntilDate: Date;
    public get ActiveFromDate(): Date { return this._activeFromDate; }
    public set ActiveFromDate(value: Date) {
        this._activeFromDate = value;
        if (formatMSDate(this._activeFromDate) != this.ActiveFrom)
            this.ActiveFrom = formatMSDate(this._activeFromDate);
    }
    public get ActiveUntilDate(): Date { return this._activeUntilDate; }
    public set ActiveUntilDate(value: Date) {
        this._activeUntilDate = value;
        if (formatMSDate(this._activeUntilDate) != this.ActiveUntil)
            this.ActiveUntil = formatMSDate(this._activeUntilDate);
    }

    get browseFields(): Array<FieldDefinition> { return [{ Name: "Name", Pipe: "", DataType: "string" }, { Name: "ActiveFromDate", Pipe: "msDate", DataType: "date" }, { Name: "ActiveUntilDate", Pipe: "msDate", DataType: "date" }]; }

    getNewInstance(): FoodMenu { return new FoodMenu(); }
    getModuleName(): string { return "FoodOrder"; }
    getEntityName(): string { return "FoodMenu"; }

    getValidators(): { [propName: string]: ValidatorDefinition[]; } {
        return {
            "Name": [{ Validator: Validators.required, ErrorCode: 'required', ErrorMessage: "Name is required" },
                { Validator: Validators.minLength(3), ErrorCode: 'minlength', ErrorMessage: "Name's minimum length is 3 characters" }]
        };
    }

    public setModelData(modelData: FoodMenu) {
        if (modelData) {
            modelData = this.fromRawEntity(modelData);
            this.ID = modelData.ID;
            this.Name = modelData.Name;
            this.ActiveFrom = modelData.ActiveFrom;
            this.ActiveFromDate = modelData.ActiveFromDate;
            this.ActiveUntil = modelData.ActiveUntil;
            this.ActiveUntilDate = modelData.ActiveUntilDate;
            this.RestaurantID = modelData.RestaurantID;
        }
    }

    private jsonReplaceHelper(prop: string, val: any) {
        if (!val || prop === "ActiveFromDate" || prop === "ActiveToDate") return undefined;
        return val;
    }
    public entityToJSON(): string {
        this.ActiveFrom = formatMSDate(this.ActiveFromDate);
        this.ActiveUntil = formatMSDate(this.ActiveUntilDate);
        return JSON.stringify(this, this.jsonReplaceHelper);
    }
    public fromRawEntity(entity: FoodMenu): FoodMenu {
        if (entity.ActiveFrom) entity.ActiveFromDate = moment(entity.ActiveFrom).toDate(); else entity.ActiveFromDate = null;
        if (entity.ActiveUntil) entity.ActiveUntilDate = moment(entity.ActiveUntil).toDate(); else entity.ActiveUntilDate = null;
        return entity;
    }
}

function formatMSDate(date: Date): string {
    let timezonePart: string = "";
    let tzMin: number = date.getTimezoneOffset();
    if (date.getTimezoneOffset() > 0) timezonePart += '-'; else { timezonePart += '+'; tzMin = -tzMin; }

    if (tzMin < 600) timezonePart += '0';
    timezonePart += Math.floor(tzMin / 60).toString();
    if ((tzMin % 60) < 10) timezonePart += '0';
    timezonePart += (tzMin % 60).toString();

    return "\/Date(" + date.valueOf() + timezonePart + ")\/";
}