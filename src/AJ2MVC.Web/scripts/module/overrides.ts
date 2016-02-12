import { Injectable } from 'angular2/core';
import { IOverride } from './../factories/component.factory';
import { ModelA } from './../models/modela';

@Injectable() 
export class Override1 implements IOverride {

    constructor() {
        console.log('Override1 instatinated!');
    }

    override(objToOverride: ModelA) {
        objToOverride.lastName = "Cause";
        console.log('Override1 overrides Something from outside.......!');
    }
}

@Injectable()
export class Override2 implements IOverride {

    constructor() {
        console.log('Override2 instatinated!');
    }

    override(objToOverride: ModelA) {
        objToOverride.firstName = "Just";
        console.log('Override2 overrides Something from outside.......!');
    }
}