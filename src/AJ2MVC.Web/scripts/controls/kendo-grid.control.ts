import { Input, Output, HostBinding, AfterViewInit, HostListener, EventEmitter, Component, Self, Attribute, ViewEncapsulation, ElementRef, OnDestroy } from 'angular2/core';
import { ControlValueAccessor, NgControl } from 'angular2/common';
import { Router } from 'angular2/router';
import { IEntityDataService, IEmptyConstruct, IDataStructure, FieldFilter } from './../models/interfaces';
import { BaseEntity } from './../models/entitybase';

@Component({
    selector: 'kendo-grid',
    encapsulation: ViewEncapsulation.Emulated,
    template: `<div id="gridContainer"></div>`
})
export class KendoGridComponent implements AfterViewInit, OnDestroy {
    @Input() set entityType(EntityType: IEmptyConstruct) {
        this.showEntity = new EntityType();
        this.EntityDataStructure = EntityType;
        this.registerDataService();
    }
    @Input() editLink: string = "";
    public setFilters(newFilters: Array<FieldFilter>) {
        this._filters = newFilters;
        var that = this;
        if (this._filters && this._filters.length > 0 && this.gridContainer && this.showEntity) {
            this.entityService.filterData(this.EntityDataStructure, this._filters).then((res: any[]) => {
                that.showEntityList = res;
                that._gridInstance.setDataSource(new kendo.data.DataSource({ data: that.showEntityList, pageSize: 5 }));
            });
        }
    }

    private _controlID: number;
    private static staticID: number = 1;
    private showEntityList: Array<IDataStructure> = new Array<IDataStructure>();
    private showEntity: IDataStructure = new BaseEntity();
    private gridColumns: any[];
    private EntityDataStructure: IEmptyConstruct = BaseEntity;
    private gridContainer: JQuery;
    private _gridInstance: kendo.ui.Grid = null;
    private _filters: Array<FieldFilter> = null;

    constructor(private elRef: ElementRef,
        private router: Router,
        private entityService: IEntityDataService
    ) {
        this._controlID = ++KendoGridComponent.staticID;
    }

    ngOnDestroy() {
        if (this.dataLoadSubscription)
            this.dataLoadSubscription.unsubscribe();
    }

    openDetail(entity: IDataStructure) {
        if (this.editLink.length > 0) {
            this.router.navigate([this.editLink, { id: entity.ID }]);
        } else {
            this.router.navigate([this.showEntity.getNameID() + '_DetailComponent', { id: entity.ID }]);
        }
    }

    showDetails(event: any) {
        event.preventDefault();
        var dataItem: any = this._gridInstance.dataItem(jQuery(event.currentTarget).closest("tr"));
        this.openDetail({ ID: dataItem.ID } as IDataStructure);
    }

    private dataLoadSubscription: any = null;
    registerDataService() {
        if (this.gridContainer && this.showEntity) {
            this.gridColumns = this.showEntity.browseFields.map(x => {
                return {
                    title: x.Name,
                    field: x.Name,
                    type: x.DataType,
                    width: 150
                }
            });
            var that = this;
            this.gridColumns.push({
                title: " ", width: 50, command: {
                    text: "Details", click: (event: any) => { that.showDetails(event); }
                }
            });
            this._gridInstance = this.gridContainer.kendoGrid({
                columns: this.gridColumns,
                dataSource: {
                    data: this.showEntityList,
                    pageSize: 5
                },
                pageable: true,
                toolbar: [`<div class="toolbar"><button class="ui-icon-plus" click="function(){that.openDetail(that.showEntity.getNewInstance());}">New</button></div>`]
            }).data("kendoGrid");
            this.dataLoadSubscription = this.entityService.dataObserver.subscribe((updatedEntities: Array<any>) => {
                if (!that._filters || that._filters.length === 0) {
                    that.showEntityList = that.entityService.getCurrentLibrary(that.EntityDataStructure);
                } else {
                    that.showEntityList = that.entityService.getCurrentLibraryWithFilters(that.EntityDataStructure, that._filters);
                }
                that._gridInstance.setDataSource(new kendo.data.DataSource({ data: that.showEntityList, pageSize: 5 }));
            });
            try {
                this.entityService.initdataLoad(this.EntityDataStructure);
            } catch (e) {
                alert(e);
            }

            if (this._filters && this._filters.length > 0) {
                this.entityService.filterData(this.EntityDataStructure, this._filters).then((res: any[]) => {
                    that.showEntityList = res;
                    that._gridInstance.setDataSource(new kendo.data.DataSource({ data: that.showEntityList, pageSize: 5 }));
                });
            } else {
                this.showEntityList = this.entityService.getCurrentLibrary(this.EntityDataStructure);
                this._gridInstance.setDataSource(new kendo.data.DataSource({ data: that.showEntityList, pageSize: 5 }));
            }
        }
    }

    ngAfterViewInit() {
        jQuery(this.elRef.nativeElement).find("#gridContainer").attr('id', 'gridContainer_' + this._controlID);
        this.gridContainer = jQuery(jQuery(this.elRef.nativeElement).find('#gridContainer_' + this._controlID));
        this.registerDataService();
    }
}
