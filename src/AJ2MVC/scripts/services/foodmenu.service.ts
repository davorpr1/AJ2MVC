import { Injectable } from 'angular2/core';
import { Http } from 'angular2/http';

import {RhetosRestService} from './../services/rhetos-rest.service';
import {FoodMenu} from './../models/foodmenu';

@Injectable()
export class FoodMenuService extends RhetosRestService<FoodMenu>
{
    // necessary so that http can be used in base class
    constructor(http: Http) { this.initializeDataStructure(new FoodMenu()); super(http); }
}