"use strict";

import {Injectable} from 'angular2/core';

@Injectable()
export class TestLogger {
    static counter: number = 0;
    currCounter: number;

    constructor() {
        TestLogger.counter++;
        this.currCounter = TestLogger.counter;
    }

    public log(message: string) {
        console.log("Logger " + this.currCounter + ": " + message);
    }
}