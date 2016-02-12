"use strict";

import { EventEmitter } from 'angular2/core';
import { Validators, Validator } from 'angular2/common';
import { IDataStructure } from './../models/interfaces';

export class BaseEntity implements IDataStructure {

    public ID: string;
    getValidators(): { [propName: string]: Function[]; } {
        return {
        };
    }
    getNewInstance(): IDataStructure { throw "Has to be overriden."; }
    getModuleName(): string { return ""; }
    getEntityName(): string { return ""; }

    public setModelData(modelData: IDataStructure) {
        if (modelData) {
            this.ID = modelData.ID;
        }
    }
    public entityToJSON(): string {
        return JSON.stringify(this);
    }
    public fromRawEntity(entity: IDataStructure): IDataStructure {
        return entity;
    }
}
