import { Pipe, PipeTransform } from 'angular2/core';
import { ModelA } from './../models/modela';
import { TestLogger } from './../components/logger';

@Pipe({
    name: 'ModelASHTML'
})
export class ModelAsHTMLPipe implements PipeTransform {

    private logger: TestLogger;

    constructor(logger: TestLogger) {
        this.logger = logger;
        logger.log("Pipe instatinated!");
    }

    transform(input: string, adds: any[]): string {
        this.logger.log("Pipe transform requested!");
        if (adds.length > 0)
        {
            if (adds[0] instanceof ModelA)
                return (adds[0] as ModelA).lastName + ', ' + (adds[0] as ModelA).firstName;
            return adds[0].toString();
        }
        return input;
    }
}

@Pipe({ name: 'exponentialStrength' })
export class ExponentialStrengthPipe implements PipeTransform {

    transform(value: number, args: string[]): any {
        console.log('expPipeTransform requested for ' + value + ', ' + args);
        return Math.pow(value, isNaN(parseFloat(args[0])) ? 1 : parseFloat(args[0]) );
    }
}