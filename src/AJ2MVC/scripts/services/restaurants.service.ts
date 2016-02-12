import { Injectable } from 'angular2/core';
import { Http } from 'angular2/http';

import { RhetosRestService } from './../services/rhetos-rest.service';
import { Restaurant } from './../models/restaurant';

@Injectable()
export class RestaurantsService extends RhetosRestService<Restaurant>
{
    // necessary so that http can be used in base class
    constructor(http: Http) { this.initializeDataStructure(new Restaurant()); super(http); }
}