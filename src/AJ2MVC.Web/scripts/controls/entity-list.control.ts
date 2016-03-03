import { Component, View, provide, OnInit, AfterViewInit, NgZone, ApplicationRef, Input, ChangeDetectorRef, Pipe, PipeTransform, OnDestroy } from 'angular2/core';
import { DatePipe } from 'angular2/common';
import { Http, HTTP_PROVIDERS, Response, Request, RequestOptions, RequestMethod, Headers, BrowserXhr } from 'angular2/http';
import { RouteConfig, ROUTER_DIRECTIVES, Router } from 'angular2/router';
import { TestLogger } from './../services/logger';
import { IDataStructure, IEntityDataService, IEmptyConstruct, FieldDefinition, FieldFilter } from './../models/interfaces';
import { GlobalDataSharing, MenuItem } from './../controls/menu';
import { MSDatePipe } from './../pipes/ModelASHTMLPipe';
import { BaseEntity } from './../models/entitybase';

@Pipe({ name: 'pipeWrapper' })
export class WrapperPipe implements PipeTransform {
    registeredPipes: Map<string, PipeTransform> = new Map<string, PipeTransform>();
    constructor() {
        if (!this.registeredPipes.get("date")) this.registeredPipes.set("date", new DatePipe());
        if (!this.registeredPipes.get("msDate")) this.registeredPipes.set("msDate", new MSDatePipe());
    }

    transform(value: string, args: string[]): any {
        if (!args || args.length === 0 || !args[0] || args[0].length === 0) return value; else {
            let pipes: string[] = args[0].split(',');
            for (var ix: number = 0; ix < pipes.length; ix++)
                if (this.registeredPipes.get(pipes[ix])) value = this.registeredPipes.get(pipes[ix]).transform(value, null);
            return value;
        }
    }
}

@Component({
    selector: 'entity-list',
    providers: [ChangeDetectorRef],
    pipes: [WrapperPipe],
    template: `
        <table class="baseTable">
            <tr>
                <th *ngFor="#browseField of fields">{{browseField.Name}}</th>
                <th>About</th>
            </tr>
            <tr *ngFor="#entityObj of showEntityList" >
                <td *ngFor="#browseField of fields">{{entityObj[browseField.Name] | pipeWrapper:browseField.Pipe}}</td>
                <td><a (click)="openDetail(entityObj)">Details</a></td>
            </tr>
        </table>
        <button type="button" class="info" (click)="triggerRefreshData()">Refresh {{ showEntity.getEntityName() }}(s)</button>
        <button type="button" class="info" (click)="newEntity()">New {{ showEntity.getEntityName() }}</button>
        `
})
export class EntityListControl implements OnInit, AfterViewInit, OnDestroy {
    @Input() dataLoadOnInit: boolean = true;
    @Input() set entityType(EntityType: IEmptyConstruct) {
        this.showEntity = new EntityType();
        this.EntityDataStructure = EntityType;
        this.fields = [].concat(this.showEntity.browseFields);
        this.registerDataService();
    }
    @Input() editLink: string = "";

    public setFilters(newFilters: Array<FieldFilter>) {
        this._filters = newFilters;
        var that = this;
        if (this._filters && this._filters.length > 0 && this.showEntity) {
            this.entityService.filterData(this.EntityDataStructure, this._filters).then((res: any[]) => { that.showEntityList = res; });
        }
    }
    private _filters: Array<FieldFilter> = null;

    private showEntityList: Array<IDataStructure> = new Array<IDataStructure>();
    private showEntity: IDataStructure = new BaseEntity();
    private EntityDataStructure: IEmptyConstruct = BaseEntity;
    private fields: Array<FieldDefinition> = new Array<FieldDefinition>();
    private _rerenderRequired: boolean = true;
    private cd: number = 0;
    static idComponent: number = 0;
    static destroyedOnes: Array<number>;
    private myIDComponent: number;

    constructor(private logger: TestLogger,
        gds: GlobalDataSharing,
        private http: Http,
        private router: Router,
        private entityService: IEntityDataService,
        private zone: NgZone,
        private applicationRef: ApplicationRef)
    {
        var that = this;
        
        setInterval(() => {
            if (this.cd != this.showEntityList.length) {
                this.cd = this.showEntityList.length;
                that.applicationRef.tick();
            }
        }, 250);

        logger.log("Entity list component initiated!");
        this.myIDComponent = ++EntityListControl.idComponent;
        if (!EntityListControl.destroyedOnes) EntityListControl.destroyedOnes = new Array<number>();
    }

    ngOnDestroy() {
        EntityListControl.destroyedOnes.push(this.myIDComponent);
        this.subscription.unsubscribe();
        this.logger.log("ENTITYLIST destroyed: (ID: " + this.myIDComponent + ', filters: ' + ((this._filters) ? this._filters.length : 0) + ')');
    }
    private subscription: any;
    private registerDataService() {
        if (this.showEntity) {
            var that = this;
            this.subscription = this.entityService.dataObserver.subscribe((updatedEntities: Array<any>) => {
                // if still valid
                if (!EntityListControl.destroyedOnes.find(x => x == this.myIDComponent)) {
                    that.logger.log("ENTITYLIST UPDATED DATA: EntityListID: " + that.myIDComponent);
                    if (!that._filters || that._filters.length === 0) {
                        that.showEntityList = that.entityService.getCurrentLibrary(that.EntityDataStructure);
                    } else {
                        that.showEntityList = that.entityService.getCurrentLibraryWithFilters(that.EntityDataStructure, that._filters);
                    }
                }
            });
            if (this.dataLoadOnInit) {
                try {
                    this.entityService.initdataLoad(this.EntityDataStructure);
                } catch (e) {
                    alert(e);
                }
                if (this._filters && this._filters.length > 0) {
                    this.entityService.filterData(this.EntityDataStructure, this._filters).then((res: any[]) => { that.showEntityList = res; });
                } else {
                    this.showEntityList = this.entityService.getCurrentLibrary(this.EntityDataStructure)
                }
            }
        }
    }

    triggerRefreshData() {
        try {
            this.entityService.reloadData(this.EntityDataStructure);
        } catch (e) {
            alert(e);
        }
    }

    newEntity() {
        this.openDetail(this.showEntity.getNewInstance());
    }

    openDetail(entity: IDataStructure) {
        if (this.editLink.length > 0) {
            this.router.navigate([this.editLink, { id: entity.ID }]);
        } else {
            this.router.navigate([this.showEntity.getNameID() + '_DetailComponent', { id: entity.ID }]);
        }
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