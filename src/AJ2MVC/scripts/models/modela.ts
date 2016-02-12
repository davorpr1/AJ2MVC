"use strict";

import {EventEmitter} from 'angular2/core';

export class ModelA {
    public firstName: string;
    public lastName: string;

    public OnInitialize: EventEmitter<ModelA> = new EventEmitter<ModelA>();

    public initialize() {
        this.firstName = "John";
        this.lastName = "Smith";

        this.OnInitialize.next(this);
    }
}
