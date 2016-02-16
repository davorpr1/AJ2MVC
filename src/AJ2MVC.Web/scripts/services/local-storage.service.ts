﻿import {Observable} from 'rxjs/Observable';
import { Injectable } from 'angular2/core';

import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import { AppSettings } from './../app/app.settings';

import { IDataStructure, IEntityDataService, IEmptyConstruct, FieldFilter } from './../models/interfaces';

@Injectable()
export class LocalStorageService implements IEntityDataService {
    data$: Observable<Array<IDataStructure>>;
    private _dataObserver: any;
    private _loaded: boolean = false;
    protected _dummyEntityInstances: Array<IDataStructure> = new Array<IDataStructure>();
    protected entCounter: number = 1;

    private _hasReadRight: boolean = false;
    private _hasNewRight: boolean = false;
    private _hasEditRight: boolean = false;
    private _hasRemoveRight: boolean = false;

    public getDummy(DataStructure: IEmptyConstruct): IDataStructure {
        let res: IDataStructure;
        res = this._dummyEntityInstances.find((dummy: any) => dummy instanceof DataStructure);
        if (!res) {
            res = new DataStructure();
            this._dummyEntityInstances.push(res);
        }
        return res;
    }

    public getModuleName(DataStructure: IEmptyConstruct): string { return this.getDummy(DataStructure).getModuleName(); }
    public getEntityName(DataStructure: IEmptyConstruct): string { return this.getDummy(DataStructure).getEntityName(); }
    public getEntityNameID(DataStructure: IEmptyConstruct): string { return this.getDummy(DataStructure).getNameID(); }
    public entityToJSON(entity: IDataStructure): string { return entity.entityToJSON(); }
    public fromRawEntity(DataStructure: IEmptyConstruct, entity: IDataStructure): IDataStructure { return this.getDummy(DataStructure).fromRawEntity(entity); }

    private _dataStore: {
        data: Array<IDataStructure>
    };

    constructor() {
        this.data$ = new Observable((observer: any) => this._dataObserver = observer).share();
        this._dataStore = { data: [] };
    }

    getCurrentLibrary(DataStructure: IEmptyConstruct): Array<typeof DataStructure> {
        return this._dataStore.data.filter(ent => ent instanceof DataStructure).map((x: any) => x as IEmptyConstruct);
    }

    public initdataLoad(DataStructure: IEmptyConstruct) {
        if (!this._loaded) {
            this._loaded = true;
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
        this._dataStore.data.every((t: IDataStructure) => {
            if (t.ID === id && t instanceof DataStructure) {
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
            res = this.createEntityInstance(DataStructure, null);
            return new Promise<typeof DataStructure>(function (resolve, reject) {
                console.log('Entity with ID (' + id + ') not found in data store.');
                resolve(res);
            });
        }
    }

    reloadData(DataStructure: IEmptyConstruct) {
        for (var index: number = this._dataStore.data.length - 1; index >= 0; index--) {
            if (this._dataStore.data[index] instanceof DataStructure) { this._dataStore.data.splice(index, 1); }
        }
        this._dataStore.data.push(({ ID: this.getEntityNameID(DataStructure) + this.entCounter } as IDataStructure));

        if (this._dataObserver) this._dataObserver.next(this._dataStore.data);
    }

    createEntity(DataStructure: IEmptyConstruct, entity: IDataStructure) {
        this.entCounter++;
        entity.ID = this.getEntityNameID(DataStructure) + this.entCounter;
        this._dataStore.data.push(entity);
        if (this._dataObserver) this._dataObserver.next(this._dataStore.data);
    }

    updateEntity(DataStructure: IEmptyConstruct, entity: IDataStructure) {
        if (!entity.ID) {
            this.createEntity(DataStructure, entity);
            return;
        }
        this._dataStore.data.forEach((rest, i) => {
            if (entity.ID === rest.ID) { this._dataStore.data[i] = entity; }
        });
        if (this._dataObserver) this._dataObserver.next(this._dataStore.data);
    }

    deleteEntity(DataStructure: IEmptyConstruct, entity: IDataStructure) {
        this._dataStore.data.forEach((t, index) => {
            if (t.ID === entity.ID && t instanceof DataStructure) { this._dataStore.data.splice(index, 1); }
        });
        if (this._dataObserver) this._dataObserver.next(this._dataStore.data);
    }

    filterData(DataStructure: IEmptyConstruct, filters: FieldFilter[]): Promise<typeof DataStructure[]> {
        let res: Array<any> = this._dataStore.data.filter(x => x instanceof DataStructure);
        filters.forEach(fieldFilter => {
            res = res.filter(x => (x[fieldFilter.Field].toString() as string).includes(fieldFilter.Term));
        });
        return new Promise<typeof DataStructure[]>(function (resolve, reject) {
            resolve(res);
        });
    }
}
