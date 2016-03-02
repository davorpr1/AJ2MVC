﻿import {Observable} from 'rxjs/Observable';
import { Injectable, EventEmitter } from 'angular2/core';
import {Http, RequestOptions, Headers} from 'angular2/http';

import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import { AppSettings } from './../app/app.settings';

import { IDataStructure, IEntityDataService, IEmptyConstruct, FieldFilter } from './../models/interfaces';
import { MyClaim } from './../models/security/claim';
import { PermissionProvider } from './../services/permission-provider.service';

export class DataStructureWithClaims {
    dataStructure: IDataStructure;
    DataStructureType: IEmptyConstruct;
    constructor(DataStructure: IEmptyConstruct) {
        this.DataStructureType = DataStructure;
        this.dataStructure = new DataStructure();
    }

    ReadRight: boolean = false;
    NewRight: boolean = false;
    EditRight: boolean = false;
    RemoveRight: boolean = false;
    PermissionLoaded: boolean = false;

    InitialDataLoaded: boolean = false;
}

@Injectable()
export class RhetosRestService implements IEntityDataService {
    public data: Array<IDataStructure>;
    public dataObserver: EventEmitter<Array<IDataStructure>> = new EventEmitter<Array<IDataStructure>>();
    protected _http: Http;
    protected _permissionHolderPromise: Promise<MyClaim[]>;
    protected _dummyEntityInstances: Array<DataStructureWithClaims> = new Array<DataStructureWithClaims>();

    public getDummy(DataStructure: IEmptyConstruct): IDataStructure {
        return this.getDummyWithClaim(DataStructure).dataStructure;
    }

    public getDummyWithClaim(DataStructure: IEmptyConstruct): DataStructureWithClaims {
        let res: DataStructureWithClaims;
        res = this._dummyEntityInstances.find((dummy: DataStructureWithClaims) => dummy.dataStructure instanceof DataStructure);
        if (!res) {
            res = new DataStructureWithClaims(DataStructure);
            this._dummyEntityInstances.push(res);
            this.updatePermissions(this.permissionProvider.checkEntityPermissions(res.dataStructure));
        }
        return res;
    }

    public getModuleName(DataStructure: IEmptyConstruct): string { return this.getDummy(DataStructure).getModuleName(); }
    public getEntityName(DataStructure: IEmptyConstruct): string { return this.getDummy(DataStructure).getEntityName(); }
    public getEntityNameID(DataStructure: IEmptyConstruct): string { return this.getDummy(DataStructure).getNameID(); }
    public entityToJSON(entity: IDataStructure): string { return entity.entityToJSON(); }
    public fromRawEntity(DataStructure: IEmptyConstruct, entity: IDataStructure): IDataStructure {
        let res: any = new DataStructure();
        (res as IDataStructure).setModelData(entity);
        return res;
    }

    constructor(http: Http, private permissionProvider: PermissionProvider) {
        this.data = new Array<IDataStructure>();
        this._http = http;
        this.permissionProvider.data$.subscribe(newPermissions => this.updatePermissions(newPermissions));
    }

    private updatePermissions(permissions: MyClaim[]) {
        var that = this;
        permissions.map((claim: MyClaim) => {
            this._dummyEntityInstances.filter((dum: DataStructureWithClaims) => dum.dataStructure.getModuleName() + '.' + dum.dataStructure.getEntityName() === claim.ClaimResource)
                .forEach((dum: DataStructureWithClaims) => {
                    if (claim.ClaimRight === "Edit") dum.EditRight = claim.Applies;
                    if (claim.ClaimRight === "New") dum.NewRight = claim.Applies;
                    if (claim.ClaimRight === "Remove") dum.RemoveRight = claim.Applies;
                    if (claim.ClaimRight === "Read") {
                        if (!dum.ReadRight && claim.Applies) {
                            dum.ReadRight = claim.Applies;
                            that.reloadData(dum.DataStructureType);
                        }
                    }
                    dum.PermissionLoaded = true;
            });
        });
    } 

    getCurrentLibrary(DataStructure: IEmptyConstruct): Array<typeof DataStructure> {
        return this.data.filter(ent => ent instanceof DataStructure).map((x: any) => x as IEmptyConstruct);
    }

    getCurrentLibraryWithFilters(DataStructure: IEmptyConstruct, filters: FieldFilter[]): Array<typeof DataStructure> {
        var res: Array<typeof DataStructure> = this.data.filter(ent => ent instanceof DataStructure).map((x: any) => x as IEmptyConstruct);
        filters.forEach(fieldFilter => {
            // TODO: local filter per operation type implementation
            res = res.filter((x: any) => (x[fieldFilter.Field].toString() as string).includes(fieldFilter.Term));
        });
        return res;
    }

    initdataLoad(DataStructure: IEmptyConstruct) {
        if (!this.getDummyWithClaim(DataStructure).InitialDataLoaded) {
            this.getDummyWithClaim(DataStructure).InitialDataLoaded = true;
            this.reloadData(DataStructure);
        }
    }

    public createEntityInstance(DataStructure: IEmptyConstruct, model: IDataStructure): typeof DataStructure {
        let res: any = new DataStructure();
        (res as IDataStructure).setModelData(model);
        return res;
    }

    fetchEntity(DataStructure: IEmptyConstruct, id: string): Promise<typeof DataStructure> {
        let res: typeof DataStructure = null;
        this.data.every((t: IDataStructure) => {
            if (t.ID === id) {
                res = this.createEntityInstance(DataStructure, t);
                return false;
            }
            return true;
        });
        if (res) {
            return new Promise<typeof DataStructure>(function (resolve, reject) {
                console.log('Entity with ID (' + id + ') found in data store.');
                resolve(res);
            });
        } else {
            var that = this;
            if (id) {
                return this._http.get(AppSettings.API_ENDPOINT + this.getModuleName(DataStructure) + '/' + this.getEntityName(DataStructure) + '/' + id)
                    .map(
                    (data) => {
                        let entObj: IDataStructure = this.fromRawEntity(DataStructure, data.json());
                        let found: boolean = false;
                        this.data.forEach((rest, i) => {
                            if (entObj.ID === rest.ID) {
                                this.data[i] = entObj;
                                found = true;
                            }
                        });
                        if (!found) this.data.push(entObj);

                        this.dataObserver.next(this.data);
                        return this.createEntityInstance(DataStructure, entObj);
                    }, (error: any) => {
                        console.log('Could not create entity.');
                        return this.createEntityInstance(DataStructure, null);
                    }
                    ).toPromise();
            } else return new Promise<typeof DataStructure>(function (resolve, reject) { resolve(that.createEntityInstance(DataStructure, null)); });
        }
    }

    reloadData(DataStructure: IEmptyConstruct) {
        var perm: DataStructureWithClaims = this.getDummyWithClaim(DataStructure);
        if (perm.ReadRight) {
            this._http.get(AppSettings.API_ENDPOINT + this.getModuleName(DataStructure) + '/' + this.getEntityName(DataStructure) + '/')
                .subscribe(data => {
                    let toAdd: Array<IDataStructure> = new Array<IDataStructure>();
                    data.json().Records.map((rec: IDataStructure) => {
                        let preparedEnt: IDataStructure = this.fromRawEntity(DataStructure, rec);
                        let found: boolean = false;
                        this.data.forEach((rest, i) => {
                            if (preparedEnt.ID === rest.ID) {
                                this.data[i] = preparedEnt;
                                found = true;
                            }
                        });
                        if (!found) toAdd.push(preparedEnt);
                    });

                    this.data = this.data.concat(toAdd);
                    this.dataObserver.next(this.data);
                }, error => {
                    console.log('Could not load data.');
                });
        } else {
            if (perm.PermissionLoaded) {
                throw new Error('User does not have right to load: ' + this.getEntityNameID(DataStructure));
            }
        }
    }

    createEntity(DataStructure: IEmptyConstruct, entity: IDataStructure) {
        var perm: DataStructureWithClaims = this.getDummyWithClaim(DataStructure);
        if (!perm.NewRight) {
            if (perm.PermissionLoaded) {
                console.log('User does not have "New" right on "' + this.getModuleName(DataStructure) + '.' + this.getEntityName(DataStructure) + '".');
            }
        } else {
            let headers = new Headers({ 'Content-Type': 'application/json' });
            let options = new RequestOptions({ headers: headers });

            this._http.post(AppSettings.API_ENDPOINT + this.getModuleName(DataStructure) + '/' + this.getEntityName(DataStructure) + '/', this.entityToJSON(entity), options)
                .subscribe(data => {
                    entity.ID = data.json().ID;
                    this.data.push(entity);
                    this.dataObserver.next(this.data);
                }, (error: any) => console.log('Could not create entity.'));
        }
    }

    updateEntity(DataStructure: IEmptyConstruct, entity: IDataStructure) {
        if (!entity.ID) {
            this.createEntity(DataStructure, entity);
            return;
        }

        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        this._http.put(AppSettings.API_ENDPOINT + this.getModuleName(DataStructure) + '/' + this.getEntityName(DataStructure) + '/' + entity.ID, this.entityToJSON(entity), options)
            .subscribe(data => {
                this.data.forEach((rest, i) => {
                    if (entity.ID === rest.ID) { this.data[i] = entity; }
                });

                this.dataObserver.next(this.data);
            }, (error: any) => console.log('Could not update entity.'));
    }

    deleteEntity(DataStructure: IEmptyConstruct, entity: IDataStructure) {
        this._http.delete(AppSettings.API_ENDPOINT + this.getModuleName(DataStructure) + '/' + this.getEntityName(DataStructure) + '/' + entity.ID).subscribe((response: any) => {
            this.data.forEach((t, index) => {
                if (t.ID === entity.ID) { this.data.splice(index, 1); }
            });
            this.dataObserver.next(this.data);
        }, (error: any) => console.log('Could not delete entity.'));
    }

    filterData(DataStructure: IEmptyConstruct, filters: FieldFilter[]): Promise<typeof DataStructure[]> {
        return this._http.get(AppSettings.API_ENDPOINT + this.getModuleName(DataStructure) + '/' + this.getEntityName(DataStructure)
                + '/?genericfilter=[' + filters.map(filter => FieldFilter.toRhetosRESTQueryString(filter)).join() + ']')
            .map(
            (data) => {
                return Array.from(data.json().Records, (rec: any) => (this.fromRawEntity(DataStructure, (rec as IDataStructure)) as any));
            }, (error: any) => {
                console.log('Could not filter data. ERR: ' + error.toString());
                return this.createEntityInstance(DataStructure, null);
            }
            ).toPromise();
    }

}