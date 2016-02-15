import {Observable} from 'rxjs/Observable';
import { Injectable } from 'angular2/core';
import {Http, RequestOptions, Headers} from 'angular2/http';

import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import { AppSettings } from './../app/app.settings';

import { IDataStructure, EntityDataService } from './../models/interfaces';
import { MyClaim } from './../models/security/claim';
import { PermissionProvider } from './../services/permission-provider.service';

export class FieldFilter {
    public Field: string;
    public Operator: string;
    public Term: string;

    public static toRhetosRESTQueryString(filter: FieldFilter) {
        return '{"Property":"' + filter.Field + '","Operation":"' + filter.Operator + '","Value":"' + filter.Term + '"}';
    }
}

@Injectable()
export class RhetosRestService<T extends IDataStructure> implements EntityDataService {
    data$: Observable<Array<T>>;
    private _dataObserver: any;
    private _loaded: boolean = false;
    protected _http: Http;
    protected _permissionProvider: PermissionProvider;
    protected _permissionHolderPromise: Promise<MyClaim[]>;
    protected _dummyEntityInstance: T;

    private _hasReadRight: boolean = false;
    private _hasNewRight: boolean = false;
    private _hasEditRight: boolean = false;
    private _hasRemoveRight: boolean = false;

    public getModuleName(): string { return this._dummyEntityInstance.getModuleName(); }
    public getEntityName(): string { return this._dummyEntityInstance.getEntityName(); }
    public getEntityNameID(): string { return this._dummyEntityInstance.getNameID(); }
    public entityToJSON(entity: T): string { return entity.entityToJSON(); }
    public fromRawEntity(entity: T): T { return (this._dummyEntityInstance.fromRawEntity(entity) as T); }

    private _dataStore: {
        data: Array<T>
    };

    constructor(http: Http, permissionProvider: PermissionProvider) {
        this.data$ = new Observable((observer: any) => this._dataObserver = observer).share();
        this._http = http;
        this._permissionProvider = permissionProvider;
        this._dataStore = { data: [] };
    }

    private updatePermissions(permissions: MyClaim[]) {
        permissions.map((claim: MyClaim) => {
            if (claim.ClaimRight === "Edit") this._hasEditRight = claim.Applies;
            if (claim.ClaimRight === "New") this._hasNewRight = claim.Applies;
            if (claim.ClaimRight === "Remove") this._hasRemoveRight = claim.Applies;
            if (claim.ClaimRight === "Read") this._hasReadRight = claim.Applies;
        });
        console.log(this._dummyEntityInstance.getEntityName() + ' rights: New(' + this._hasNewRight + '), Read(' + this._hasReadRight + '), Edit(' + this._hasEditRight + '), Remove(' + this._hasRemoveRight + ')');        
    } 

    // This must be called before using Service itself.
    public initializeDataStructure(dataStructure: T) {
        this._dummyEntityInstance = dataStructure;

        this._permissionProvider.data$.subscribe(permissions => this.updatePermissions(this._permissionProvider.checkEntityPermissions(this._dummyEntityInstance)));
        this.updatePermissions(this._permissionProvider.checkEntityPermissions(this._dummyEntityInstance));
    }

    getCurrentLibrary() {
        return this._dataStore.data;
    }

    initdataLoad() {
        if (!this._loaded) {
            this._loaded = true;
            this.reloadData();
        }
    }

    public createEntityInstance(model: T): T {
        let res: T = (this._dummyEntityInstance.getNewInstance() as T);
        res.setModelData(model);
        return res;
    }

    fetchEntity(id: string): Promise<T> {
        let res: T = null;
        this._dataStore.data.every((t: T) => {
            if (t.ID === id) {
                res = this.createEntityInstance(t);
                return false;
            }
            return true;
        });
        if (res) {
            return new Promise<T>(function (resolve, reject) {
                console.log('Entity with ID (' + id + ') found in data store.');
                resolve(res);
            });
        } else {
            return this._http.get(AppSettings.API_ENDPOINT + this.getModuleName() + '/' + this.getEntityName() + '/' + id)
                .map(
                (data) => {
                    let entObj: T = this.fromRawEntity(data.json());
                    this._dataStore.data.push(entObj);
                    if (this._dataObserver) this._dataObserver.next(this._dataStore.data);

                    return this.createEntityInstance(entObj);
                }, (error: any) => {
                    console.log('Could not create entity.');
                    return this.createEntityInstance(null);
                }
                ).toPromise();
        }
    }

    reloadData() {
        this._http.get(AppSettings.API_ENDPOINT + this.getModuleName() + '/' + this.getEntityName() + '/')
            .subscribe(data => {
                this._dataStore.data = Array.from(data.json().Records, (rec: T) => this.fromRawEntity(rec));
                if (this._dataObserver) this._dataObserver.next(this._dataStore.data);
            }, error => console.log('Could not load data.'));
    }

    createEntity(entity: T) {
        if (!this._hasNewRight) {
            console.log('User does not have "New" right on "' + this.getModuleName() + '.' + this.getEntityName() + '".');
        } else {
            let headers = new Headers({ 'Content-Type': 'application/json' });
            let options = new RequestOptions({ headers: headers });

            this._http.post(AppSettings.API_ENDPOINT + this.getModuleName() + '/' + this.getEntityName() + '/', this.entityToJSON(entity), options)
                .subscribe(data => {
                    entity.ID = data.json().ID;
                    this._dataStore.data.push(entity);
                    if (this._dataObserver) this._dataObserver.next(this._dataStore.data);
                }, (error: any) => console.log('Could not create entity.'));
        }
    }

    updateEntity(entity: T) {
        if (!entity.ID) {
            this.createEntity(entity);
            return;
        }

        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        this._http.put(AppSettings.API_ENDPOINT + this.getModuleName() + '/' + this.getEntityName() + '/' + entity.ID, this.entityToJSON(entity), options)
            .subscribe(data => {
                this._dataStore.data.forEach((rest, i) => {
                    if (entity.ID === rest.ID) { this._dataStore.data[i] = entity; }
                });

                if (this._dataObserver) this._dataObserver.next(this._dataStore.data);
            }, (error: any) => console.log('Could not update entity.'));
    }

    deleteEntity(entity: T) {
        this._http.delete(AppSettings.API_ENDPOINT + this.getModuleName() + '/' + this.getEntityName() + '/' + entity.ID).subscribe((response: any) => {
            this._dataStore.data.forEach((t, index) => {
                if (t.ID === entity.ID) { this._dataStore.data.splice(index, 1); }
            });
            if (this._dataObserver) this._dataObserver.next(this._dataStore.data);
        }, (error: any) => console.log('Could not delete entity.'));
    }

    filterData(filters: FieldFilter[]): Promise<T[]> {
        return this._http.get(AppSettings.API_ENDPOINT + this.getModuleName() + '/' + this.getEntityName()
                + '/?genericfilter=[' + filters.map(filter => FieldFilter.toRhetosRESTQueryString(filter)).join() + ']')
            .map(
            (data) => {
                return Array.from(data.json().Records, (rec: T) => this.fromRawEntity(rec));
            }, (error: any) => {
                console.log('Could not filter data. ERR: ' + error.toString());
                return this.createEntityInstance(null);
            }
            ).toPromise();
    }

}