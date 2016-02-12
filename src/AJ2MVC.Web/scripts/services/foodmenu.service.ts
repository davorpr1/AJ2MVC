import { Injectable } from 'angular2/core';
import { Http } from 'angular2/http';

import {RhetosRestService} from './../services/rhetos-rest.service';
import { PermissionProvider } from './../services/permission-provider.service';
import {FoodMenu} from './../models/foodmenu';

@Injectable()
export class FoodMenuService extends RhetosRestService<FoodMenu>
{
    // necessary so that http can be used in base class
    constructor(http: Http, permissionProvider: PermissionProvider) { super(http, permissionProvider); this.initializeDataStructure(new FoodMenu()); }
}