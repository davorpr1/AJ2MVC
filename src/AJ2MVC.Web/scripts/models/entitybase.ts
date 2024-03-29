﻿"use strict";

import { EventEmitter } from 'angular2/core';
import { Validators, Validator } from 'angular2/common';
import { IDataStructure, FieldDefinition, ValidatorDefinition } from './../models/interfaces';

export class BaseEntity implements IDataStructure {
    public ID: string;
    
    getValidators(): { [propName: string]: ValidatorDefinition[]; } {
        return {
        };
    }
    browseFields: Array<FieldDefinition> = [{ Name: "ID", Pipe: "", DataType: "string" }];
    getNewInstance(): IDataStructure { throw "Has to be overriden."; }
    getModuleName(): string { return ""; }
    getEntityName(): string { return ""; }
    getNameID(): string { return this.getModuleName() + '_' + this.getEntityName(); }

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
