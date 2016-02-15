import { Injectable } from 'angular2/core';
import { Http } from 'angular2/http';

import { RhetosRestService } from './../services/rhetos-rest.service';
import { LocalStorageService } from './../services/local-storage.service';
import { PermissionProvider } from './../services/permission-provider.service';
import { Restaurant } from './../models/restaurant';
import { EntityDataService } from './../models/interfaces';

@Injectable()
export class RestaurantsService extends RhetosRestService<Restaurant>
{
    // necessary so that http can be used in base class
    constructor(http: Http, permissionProvider: PermissionProvider) {
        super(http, permissionProvider);
        this.initializeDataStructure(new Restaurant());
    }
}

@Injectable()
export class RestaurantsDummyService extends LocalStorageService<Restaurant>
{
    constructor() {
        super();
        this.initializeDataStructure(new Restaurant());
    }
}