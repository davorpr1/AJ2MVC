import { Component, View, provide, OnInit, AfterViewInit, NgZone, ApplicationRef, Input, ChangeDetectorRef } from 'angular2/core';
import { Http, HTTP_PROVIDERS, Response, Request, RequestOptions, RequestMethod, Headers, BrowserXhr } from 'angular2/http';
import { RouteConfig, ROUTER_DIRECTIVES, Router } from 'angular2/router';
import { TestLogger } from './../components/logger';
import { IDataStructure, EntityDataService } from './../models/interfaces';
import { GlobalDataSharing, MenuItem } from './../components/menu';
import { EntityDataServiceFactory } from './../factories/entity-data-service.factory';

@Component({
    selector: 'entity-list',
    providers: [ChangeDetectorRef],
    template: `
        <p>Entity list</p>
        <table class="baseTable">
            <tr>
                <th *ngFor="#browseField of fields">{{browseField}}</th>
                <th>About</th>
            </tr>
            <tr *ngFor="#entityObj of showEntityList" >
                <td *ngFor="#browseField of fields">{{entityObj[browseField]}}</td>
                <td><a (click)="openDetail(entityObj)">Details</a></td>
            </tr>
        </table>
        <button type="button" class="info" (click)="triggerRefreshData()">Refresh {{ showEntity.getEntityName() }}(s)</button>
        <button type="button" class="info" (click)="newEntity()">New {{ showEntity.getEntityName() }}</button>
        `
})
export class EntityListComponent implements OnInit, AfterViewInit {
    private showEntityList: Array<IDataStructure> = new Array<IDataStructure>();
    private showEntity: IDataStructure;
    private fields: Array<string> = new Array<string>();
    private entityService: EntityDataService;
    private _rerenderRequired: boolean = true;
    private cd: number = 1;

    constructor(private logger: TestLogger,
        gds: GlobalDataSharing,
        private http: Http,
        private router: Router,
        private entityServiceFactory: EntityDataServiceFactory,
        private zone: NgZone,
        private applicationRef: ApplicationRef)
    {
        this.registerEntityService();
        var that = this;

        setTimeout(function () {
            that.cd++;
            // to ensure rerendering view
            that.applicationRef.tick();
        }, 100);

        logger.log("Entity list component initiated!");
    }

    @Input() set entity(entity: IDataStructure) {
        this.showEntity = entity.getNewInstance();
        this.fields = [].concat(this.showEntity.browseFields);
        this.registerEntityService();
    }

    private registerEntityService() {
        if (this.showEntity && !this.entityService) {
            this.entityService = this.entityServiceFactory.getInstanceForEntity(this.showEntity);
            if (this.entityService) {
                this.entityService.data$.subscribe((updatedEntities: Array<IDataStructure>) => this.showEntityList = updatedEntities);
                this.entityService.initdataLoad();
                this.showEntityList = this.entityService.getCurrentLibrary();
            }
        }
    }

    triggerRefreshData() {
        this.entityService.reloadData();
    }

    newEntity() {
        this.openDetail(this.showEntity.getNewInstance());
    }

    openDetail(entity: IDataStructure) {
        this.router.navigate([this.showEntity.getNameID() + '_DetailComponent', { id: entity.ID }]);
    }

    ngAfterViewInit() {
        this.logger.log('Entity list component AfterViewInit invoked.');        
    }
    
    ngOnInit() {
        this.logger.log('Entity list component OnInit invoked.');
        this._rerenderRequired = false;
        // something cheerfully written here
    }

}