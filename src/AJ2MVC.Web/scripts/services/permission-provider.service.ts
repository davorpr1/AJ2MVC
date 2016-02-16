import {Observable} from 'rxjs/Observable';
import { Injectable, EventEmitter } from 'angular2/core';
import { Http } from 'angular2/http';

import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import { AppSettings } from './../app/app.settings';

import { MyClaim } from './../models/security/claim';
import { IDataStructure, FieldFilter } from './../models/interfaces';

@Injectable()
export class PermissionProvider
{
    data$: Observable<Array<MyClaim>>;
    private _dataObserver: any;
    private _initialized: boolean = false;
    private _dataStore: {
        data: Array<MyClaim>
    };
    private _dummyMyClaimInstance: MyClaim = new MyClaim();

    // necessary so that http can be used in base class
    constructor(private http: Http) {
        this.data$ = new Observable((observer: any) => this._dataObserver = observer).share();
        this._dataStore = { data: [] };
        this.reloadAllAuthorizedClaims();
    }

    reloadAllAuthorizedClaims(): void {
        this.http.get(AppSettings.API_ENDPOINT + 'Common/AllClaims/')
            .subscribe((data) => {
                this._dataStore.data = Array.from(data.json().Records, (rec: MyClaim) => rec);
                if (this._dataObserver) this._dataObserver.next(this._dataStore.data);
                this._initialized = true;
            }, error => console.log('Could not load user permissions.'));
    }

    filterAllClaims(filters: FieldFilter[]): Promise<MyClaim[]> {
        return this.http.get(AppSettings.API_ENDPOINT + 'Common/Claim/'
            + '/?genericfilter=[' + filters.map(filter => FieldFilter.toRhetosRESTQueryString(filter)).join() + ']')
            .map( (data) => {
                return Array.from(data.json().Records, (rec: MyClaim) => rec);
            }, (error: any): any => {
                console.log('Could not filter data. ERR: ' + error.toString());
                return null;
            }
            ).toPromise();
    }

    checkPermission(claimResource: string, claimRight: string): boolean {
        let storedPermission: MyClaim = this._dataStore.data.find((claim: MyClaim) => {
            return (claim.ClaimResource == claimResource) && (claim.ClaimRight == claimRight)
        });
        if (storedPermission) return storedPermission.Applies; else return false;
    }
    checkEntityPermission(entity: IDataStructure, claimRight: string): boolean {
        let claimResource: string = (entity.getModuleName() + '.' + entity.getEntityName());
        return this.checkPermission(claimResource, claimRight);
    }

    checkPermissions(claimResource: string): MyClaim[] {
        return this._dataStore.data.filter((claim: MyClaim) => claim.ClaimResource == claimResource);
    }
    checkEntityPermissions(entity: IDataStructure): MyClaim[] {
        let claimResource: string = (entity.getModuleName() + '.' + entity.getEntityName());
        return this.checkPermissions(claimResource);
    }

    reloadPermissionsForResource(entity: IDataStructure): Promise<MyClaim[]> {
        return this.filterAllClaims([{ Field: "ClaimResource", Operator: "equal", Term: entity.getModuleName() + "." + entity.getEntityName() }]).then(
            (res: MyClaim[]) => {
                return this.http.get(AppSettings.API_ENDPOINT + 'Common/MyClaim/'
                    + '/?filter=Common.Claim[]&fparam=[' + res.map((claim: MyClaim) => this._dummyMyClaimInstance.toRhetosRESTQueryString(claim)).join() + ']')
                    .map((data) => {
                        let exResult: any = Array.from(data.json().Records, (rec: any, ix: number) => {
                            res[ix].Applies = rec.Applies;
                            let loadedAlready: boolean = false;
                            for (var i = 0; i < this._dataStore.data.length; i++)
                                if (this._dataStore.data[i].ClaimResource === res[ix].ClaimResource && this._dataStore.data[i].ClaimRight === res[ix].ClaimRight)
                                {
                                    this._dataStore.data[i].Applies = res[ix].Applies;
                                    loadedAlready = true;
                                }
                            if (!loadedAlready) this._dataStore.data.push(res[ix]);
                            return rec;
                        });
                        if (this._dataObserver) this._dataObserver.next(this._dataStore.data);
                        return exResult;
                    }, (error: any): any => {
                        console.log('Could not filter data. ERR: ' + error.toString());
                        return null;
                    }).toPromise();
            });
    }
}
