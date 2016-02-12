import { Injectable } from 'angular2/core';
import { Http } from 'angular2/http';

import { AppSettings } from './../app/app.settings';

import { RhetosRestService, FieldFilter } from './../services/rhetos-rest.service';
import { Claim } from './../models/security/claim';
import { IDataStructure } from './../models/interfaces';

@Injectable()
export class ClaimService extends RhetosRestService<Claim>
{
    // necessary so that http can be used in base class
    constructor(http: Http) { super(http, null); this.initializeDataStructure(new Claim()); }
}

