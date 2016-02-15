import {Observable} from 'rxjs/Observable';
import { Injectable } from 'angular2/core';

import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import { AppSettings } from './../app/app.settings';

import { IDataStructure, EntityDataService } from './../models/interfaces';

@Injectable()
export class LocalStorageService<T extends IDataStructure> implements EntityDataService {
    data$: Observable<Array<T>>;
    private _dataObserver: any;
    private _loaded: boolean = false;
    protected _dummyEntityInstance: T;
    protected entCounter: number = 1;

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

    constructor() {
        this.data$ = new Observable((observer: any) => this._dataObserver = observer).share();
        this._dataStore = { data: [] };
    }
    
    // This must be called before using Service itself.
    public initializeDataStructure(dataStructure: T) {
        this._dummyEntityInstance = dataStructure;
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
            res = this.createEntityInstance(null);
            return new Promise<T>(function (resolve, reject) {
                console.log('Entity with ID (' + id + ') not found in data store.');
                resolve(res);
            });
        }
    }

    reloadData() {
        this.entCounter = 1;
        this._dataStore.data.push(({ ID: this.getEntityNameID() + this.entCounter } as T));
    }

    createEntity(entity: T) {
        this.entCounter++;
        entity.ID = this.getEntityNameID() + this.entCounter;
        this._dataStore.data.push(entity);
        if (this._dataObserver) this._dataObserver.next(this._dataStore.data);
    }

    updateEntity(entity: T) {
        if (!entity.ID) {
            this.createEntity(entity);
            return;
        }
        this._dataStore.data.forEach((rest, i) => {
            if (entity.ID === rest.ID) { this._dataStore.data[i] = entity; }
        });
        if (this._dataObserver) this._dataObserver.next(this._dataStore.data);
    }

    deleteEntity(entity: T) {
        this._dataStore.data.forEach((t, index) => {
            if (t.ID === entity.ID) { this._dataStore.data.splice(index, 1); }
        });
        if (this._dataObserver) this._dataObserver.next(this._dataStore.data);
    }
}