/// <reference path="../../typings/moment.d.ts" />
/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/jqueryui/jqueryui.d.ts" />

import {Component, provide, Injectable, ElementRef, AfterViewInit} from 'angular2/core';
import { FORM_DIRECTIVES, FormBuilder, ControlGroup, Validators } from 'angular2/common';
import { Http, HTTP_PROVIDERS, Response, Request, RequestOptions, RequestMethod, Headers, BrowserXhr } from 'angular2/http';
import { ROUTER_PROVIDERS } from 'angular2/router';
import {bootstrap} from 'angular2/platform/browser';
import { ModelA } from './../models/modela';
import { TestLogger } from './../components/logger';
import { ModelAsHTMLPipe, ExponentialStrengthPipe } from './../pipes/ModelASHTMLPipe';
import { ModelASuperComponent } from './../components/modela.component';
import { SuperTextboxComponent } from './../controls/super-textbox.control';
import { GlobalOverridesInjector } from './../module/module.registration';
import { DatePickerComponent } from './../controls/datepicker.control';
import { Alert, Progressbar, DROPDOWN_DIRECTIVES, TYPEAHEAD_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { GlobalDataSharing, MenuItem } from './../components/menu';

import {ModelAFactory} from './../factories/component.factory';

import * as momment_ from 'moment';

declare var jQuery: JQueryStatic;

const moment: moment.MomentStatic = (<any>momment_)["default"] || momment_;

@Component({
    directives: [FORM_DIRECTIVES, ModelASuperComponent, Alert, Progressbar, DROPDOWN_DIRECTIVES, SuperTextboxComponent, DatePickerComponent, TYPEAHEAD_DIRECTIVES],
    pipes: [ModelAsHTMLPipe, ExponentialStrengthPipe],
    selector: "my-app",
    template: `<h2>Welcome: {{testvar.firstName | ModelASHTML: testvar}}

    <br /><input type="text" [(ngModel)]="testvar.firstName">
    <br /><super-textbox [(ngModel)]="testString"></super-textbox>

    <br /><modela-view [testvar]="testvar"></modela-view>

    <br /><input type="number" [(ngModel)] = "power" >
    <br /><input type="number" [(ngModel)] = "factor">
    <p>
      Upper: {{power | exponentialStrength: testvar.lastName}}
    </p>
    <alert type="info"> Some alert from ng2-bootstrap! </alert>
    <progressbar [max]="maxProgress" [value]="dynamicProgress"><span style="color:white; white-space:nowrap;"> {{ dynamicProgress/maxProgress | percent }} </span>
    </progressbar>
    <datepicker [(ngModel)]="currDate"></datepicker>
    <p>
      Selected date: {{currDate}}
    </p>

    <div class="ui-widget">
      <label for="orderState">Birds: </label>
      <input id="orderState" (change)="autocompleteValueChange($event, d)">
    </div>

    <form [ngFormModel]="newExtForm" (submit)="makeNewTestEnt($event)" method="post">
        <input ngControl="email" type="email" placeholder="Irrelevant data">
        <input ngControl="password" type="password" placeholder="Irrelevant data">
        <button type="submit">New TestEnt</button>
    </form>

    <pre>Model: {{asyncSelected | json}}</pre>
    <input [(ngModel)]="asyncSelected"
           [typeahead]="getAsyncData(getContext())"
           (typeaheadLoading)="changeTypeaheadLoading($event)"
           (typeaheadNoResults)="changeTypeaheadNoResults($event)"
           (typeaheadOnSelect)="typeaheadOnSelect($event)"
           [typeaheadOptionsLimit]="7"
           placeholder="Order states"
           class="form-control">
    <div [hidden]="typeaheadLoading!==true">
        <i class="glyphicon glyphicon-refresh ng-hide" style=""></i>
    </div>
    <div [hidden]="typeaheadNoResults!==true" class="" style="">
        <i class="glyphicon glyphicon-remove"></i> No Results Found
    </div>

    `
})
class AppComponent implements AfterViewInit {
    private maxProgress: number = 150;
    private dynamicProgress: number = 20;
    private currDate: Date;

    private _power: number = 3;
    get power() : number { return this._power; }
    set power(newValue: number) {
        this._power = newValue;
        this.factor = this.factor + 1;
    }

    get testString(): string { return this.testvar.lastName; }
    set testString(value: string) {
        this.testvar.lastName = value;
        console.log('TestString setted new value for testVar.lastName to: ' + value);
    }

    autocompleteValueChange(event: any, newValue: any) {
        console.log("Autocomplete new value: " + newValue);
    }

    get testLast(): number {
        try {
            var result: number = parseInt(this.testvar.lastName);

            if (isNaN(result))
                result = 1;
            console.log('PARSED AS ' + result);
            return result;
        } catch (ex) { }
        console.log('Not parseable!');
        return 1;
    }
    private http: Http;
    private newExtForm: ControlGroup;

    factor: number = 1;
    testvar: ModelA = new ModelA();

    constructor(private m_elementRef: ElementRef, logger: TestLogger, modelFactory: ModelAFactory, http: Http, fb: FormBuilder, gds: GlobalDataSharing) {
        let newMenuItem: MenuItem = new MenuItem();
        newMenuItem.Name = "Test";
        newMenuItem.Tooltip = "Some kind of extra data in tooltip";
        gds.addSharedData<MenuItem>("MenuItems", newMenuItem);

        this.testvar.initialize();
        this.http = http;
        logger.log("App instatinated!");
        modelFactory.testMultiProviders(this.testvar);
        this.currDate = new Date(2016, 0, 1);

        this.newExtForm = fb.group({
            email: ["", Validators.required],
            password: ["", Validators.required]
        });

        setInterval(() => {

            this.currDate = moment(this.currDate).add(1, "days").toDate();

            this.dynamicProgress = Math.random() * this.maxProgress;

            newMenuItem = new MenuItem();
            newMenuItem.Name = "Test " + this.dynamicProgress.toString();
            gds.addSharedData<MenuItem>("MenuItems", newMenuItem);

        }, 3000);		
    }

    makeNewTestEnt(event: any) {
        var headers: Headers = new Headers();
        headers.append("Content-Type", 'application/json');
        headers.append("User-Agent", 'Test 1112');

        var userData: any = {
            AtTime: "\/Date(" + this.currDate.valueOf() + ")\/",
            Name: this.testvar.firstName,
        };
        var requestoptions: RequestOptions = new RequestOptions({
            method: RequestMethod.Post,
            url: "http://dprugovecki-pc:8040/FoodRhetos/REST/TestBla/TestEnt/",
            headers: headers,
            body: JSON.stringify(userData)            
        })

        return this.http.request(new Request(requestoptions))
            .subscribe((res: Response) => {
                console.log('Result ID: ' + res.text());
            }, (err) => {
                console.log(err);
            });

        event.preventDefault();
    }

    ngAfterViewInit() {
        var that = this;
        jQuery("#orderState").autocomplete({
            source: function (request: any, response: any) {
                that.http.get('http://dprugovecki-pc:8040/FoodRhetos/REST/FoodOrder/OrderState/?genericfilter=[{"Property":"Name","Operation":"contains","Value":"' + request.term + '"}]')
                    .subscribe((res: Response) => {
                        response(Array.from(res.json().Records, (rec: any) => { return { value: rec.ID, label: rec.Name } }));
                    }, (err: any) => {
                        console.log("Error while filtering data: " + err);
                    });
            },
            minLength: 2,
            select: function (event, ui) {
                console.log(ui.item ?
                    "Selected: " + ui.item.value + " aka " + ui.item.id :
                    "Nothing selected, input was " + this.value);
            },
            focus: function (event, ui) {
                event.preventDefault();
                jQuery("#orderState").val(ui.item.label);
            }
        });
    }

    private selected: string = '';
    private asyncSelected: string = '';
    private typeaheadLoading: boolean = false;
    private typeaheadNoResults: boolean = false;

    private getContext() {
        return this;
    }

    private _cache: any;
    private _prevContext: any;

    private getAsyncData(context: any): Function {
        if (this._prevContext && this._prevContext.asyncSelected === context.asyncSelected) {
            return this._cache;
        }

        this._prevContext = context;
        let f: Function = function (): Promise<string[]> {
            let p: Promise<string[]> = new Promise((resolve: Function) => {

                context.http.get('http://dprugovecki-pc:8040/FoodRhetos/REST/FoodOrder/OrderState/?genericfilter=[{"Property":"Name","Operation":"contains","Value":"' + context.asyncSelected + '"}]')
                    .subscribe((res: Response) => {
                        return resolve(Array.from(res.json().Records, (rec: any) => { return rec.Name; }));
                    }, (err: any) => {
                        console.log("Error while filtering data: " + err);
                    });
            });
            return p;
        };
        this._cache = f;
        return this._cache;
    }

    private changeTypeaheadLoading(e: boolean) {
        this.typeaheadLoading = e;
    }

    private changeTypeaheadNoResults(e: boolean) {
        this.typeaheadNoResults = e;
    }

    private typeaheadOnSelect(e: any) {
        console.log(`Selected value: ${e.item}`);
    }
}

@Injectable()
export class CORSBrowserXHr extends BrowserXhr {

    build(): any {
        var x: any = super.build();
        x['withCredentials'] = true;
        return x;
    }
}

bootstrap(AppComponent, [
    provide(TestLogger, { useClass: TestLogger }),
    provide(GlobalOverridesInjector, { useClass: GlobalOverridesInjector }),
    provide(GlobalDataSharing, { useClass: GlobalDataSharing }),
    provide(ModelAFactory, { useClass: ModelAFactory }),
    HTTP_PROVIDERS, ROUTER_PROVIDERS,
    provide(BrowserXhr, { useClass: CORSBrowserXHr }),
]);