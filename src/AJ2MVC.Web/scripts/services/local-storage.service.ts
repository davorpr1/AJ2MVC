import {Observable} from 'rxjs/Observable';
import { Injectable, EventEmitter } from 'angular2/core';

import 'rxjs/add/operator/share';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import { AppSettings } from './../app/app.settings';

import { IDataStructure, IEntityDataService, IEmptyConstruct, FieldFilter, ChangesCommit, DataChanged } from './../models/interfaces';

@Injectable()
export class LocalStorageService implements IEntityDataService {
    data: Array<IDataStructure>;
    public dataObserver: EventEmitter<DataChanged> = new EventEmitter<DataChanged>();
    public changesStream: Observable<ChangesCommit> = Observable.prototype.startWith(null);
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

    public registerNewChangesStream(newStream: Observable<ChangesCommit>) {
        this.changesStream = Observable.merge(this.changesStream, newStream);
    }

    public getModuleName(DataStructure: IEmptyConstruct): string { return this.getDummy(DataStructure).getModuleName(); }
    public getEntityName(DataStructure: IEmptyConstruct): string { return this.getDummy(DataStructure).getEntityName(); }
    public getEntityNameID(DataStructure: IEmptyConstruct): string { return this.getDummy(DataStructure).getNameID(); }
    public entityToJSON(entity: IDataStructure): string { return entity.entityToJSON(); }
    public fromRawEntity(DataStructure: IEmptyConstruct, entity: IDataStructure): IDataStructure { return this.getDummy(DataStructure).fromRawEntity(entity); }
    
    constructor() {
        this.data = new Array<IDataStructure>();
    }

    getCurrentLibrary(DataStructure: IEmptyConstruct): Array<typeof DataStructure> {
        return this.data.filter(ent => ent instanceof DataStructure).map((x: any) => x as IEmptyConstruct);
    }

    getCurrentLibraryWithFilters(DataStructure: IEmptyConstruct, filters: FieldFilter[]): Array<typeof DataStructure> {
        var res: Array<typeof DataStructure> = this.data.filter(ent => ent instanceof DataStructure).map((x: any) => x as IEmptyConstruct);
        filters.forEach(fieldFilter => {
            res = res.filter((x: any) => (x[fieldFilter.Field].toString() as string).includes(fieldFilter.Term));
        });
        return res;
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
        this.data.every((t: IDataStructure) => {
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
        for (var index: number = this.data.length - 1; index >= 0; index--) {
            if (this.data[index] instanceof DataStructure) { this.data.splice(index, 1); }
        }
        this.data.push(({ ID: this.getEntityNameID(DataStructure) + this.entCounter } as IDataStructure));

        this.dataObserver.next({ ID: "", data: this.data });
    }

    createEntity(DataStructure: IEmptyConstruct, entity: IDataStructure) {
        this.entCounter++;
        entity.ID = this.getEntityNameID(DataStructure) + this.entCounter;
        this.data.push(entity);
        this.dataObserver.next({ ID: "", data: this.data });
    }

    updateEntity(DataStructure: IEmptyConstruct, entity: IDataStructure) {
        if (!entity.ID) {
            this.createEntity(DataStructure, entity);
            return;
        }
        this.data.forEach((rest, i) => {
            if (entity.ID === rest.ID) { this.data[i] = entity; }
        });
        this.dataObserver.next({ ID: "", data: this.data });
    }

    deleteEntity(DataStructure: IEmptyConstruct, entity: IDataStructure) {
        this.data.forEach((t, index) => {
            if (t.ID === entity.ID && t instanceof DataStructure) { this.data.splice(index, 1); }
        });
        this.dataObserver.next({ ID: "", data: this.data });
    }

    filterData(DataStructure: IEmptyConstruct, filters: FieldFilter[]): Promise<typeof DataStructure[]> {
        let res: Array<any> = this.data.filter(x => x instanceof DataStructure);
        filters.forEach(fieldFilter => {
            res = res.filter(x => (x[fieldFilter.Field].toString() as string).includes(fieldFilter.Term));
        });
        return new Promise<typeof DataStructure[]>(function (resolve, reject) {
            resolve(res);
        });
    }
}
