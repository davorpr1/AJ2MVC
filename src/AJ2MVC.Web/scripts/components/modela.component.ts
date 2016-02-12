import { Component, View, provide } from 'angular2/core';
import { TestLogger } from './../components/logger';
import { ModelA } from './../models/modela';
import { SuperTextboxComponent } from './../controls/super-textbox.control';

@Component({
    selector: "modela-view",
    inputs: ["testvar"],
    directives: [SuperTextboxComponent],
    providers: [provide(TestLogger, { useClass: TestLogger,  })],
    template: `<h3>Super: {{testvar.lastName + ', ' + testvar.firstName}}</h3>
        <br /><super-textbox [(ngModel)]="testvar.lastName"></super-textbox>
        <form-end-place></form-end-place>`
})
export class ModelASuperComponent {
    testvar: ModelA;
    constructor(logger: TestLogger) {
        logger.log("ModelA instatinated!");
    }
}