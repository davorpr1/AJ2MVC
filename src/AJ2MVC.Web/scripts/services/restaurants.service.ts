import { Injectable } from 'angular2/core';
import { Http } from 'angular2/http';

import { RhetosRestService } from './../services/rhetos-rest.service';
import { PermissionProvider } from './../services/permission-provider.service';
import { Restaurant } from './../models/restaurant';

@Injectable()
export class RestaurantsService extends RhetosRestService<Restaurant>
{
    // necessary so that http can be used in base class
    constructor(http: Http, permissionProvider: PermissionProvider) {
        super(http, permissionProvider);
        this.initializeDataStructure(new Restaurant());
    }
}