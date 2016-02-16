//import { Provider, View, provide, Injector, Component, Injectable, OpaqueToken, OnInit, EventEmitter } from 'angular2/core';
//import { FORM_DIRECTIVES } from 'angular2/common';
//import { bootstrap } from 'angular2/platform/browser';
//import { TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
//import { TestLogger } from './../components/logger';
//import { IDataStructure, EntityDataService } from './../models/interfaces';

//import { Storage, GlobalDataSharing } from './../components/menu';

//@Injectable()
//export class EntityDataServiceFactory {
//    private registeredDataServices: Storage<EntityDataService> = new Storage<EntityDataService>();
//    private _plainDataServices: Array<EntityDataService> = new Array<EntityDataService>();

//    constructor(private globalDataShare: GlobalDataSharing, private logger: TestLogger) {
//        this.registeredDataServices = this.globalDataShare.getSharedData<EntityDataService>("DataServices");
//        this._plainDataServices = this.registeredDataServices.data;

//        this.registeredDataServices.OnUpdate.subscribe((newItem: EntityDataService) => {
//            this.logger.log("New data service registered: " + newItem.getEntityNameID());
//            this._plainDataServices = this.registeredDataServices.data;
//        }, () => { }, () => { });
//    }

//    getInstanceForEntity(entity: IDataStructure): EntityDataService {
//        return this._plainDataServices.find((etSer: EntityDataService) => etSer.getEntityNameID() === entity.getNameID());
//    }
//}