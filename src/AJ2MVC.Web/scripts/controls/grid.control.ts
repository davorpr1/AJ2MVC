import { Input, Output, HostBinding, AfterViewInit, HostListener, EventEmitter, Component, Self, Attribute, ViewEncapsulation, ElementRef } from 'angular2/core';
import { ControlValueAccessor, NgControl } from 'angular2/common';
import { Router } from 'angular2/router';
import { IEntityDataService, IEmptyConstruct, IDataStructure } from './../models/interfaces';
import { BaseEntity } from './../models/entitybase';

@Component({
    selector: 'base-grid',
    encapsulation: ViewEncapsulation.Emulated,
    template: `<div id="gridContainer"></div>`
})
export class GridComponent implements AfterViewInit {
    private _controlID: number;
    private static staticID: number = 1;
    private showEntityList: Array<IDataStructure> = new Array<IDataStructure>();
    private showEntity: IDataStructure = new BaseEntity();
    private gridColumns: any[];
    private EntityDataStructure: IEmptyConstruct = BaseEntity;
    private gridContainer: JQuery;

    constructor(private elRef: ElementRef,
        private router: Router,
        private entityService: IEntityDataService
    ) {
        this._controlID = ++GridComponent.staticID;
    }

    @Input() set entityType(EntityType: IEmptyConstruct) {
        this.showEntity = new EntityType();
        this.EntityDataStructure = EntityType;
        this.registerDataService();
    }

    openDetail(item: IDataStructure) {
        this.router.navigate([this.showEntity.getNameID() + '_DetailComponent', { id: item.ID }]);
    }

    registerDataService() {
        if (this.gridContainer && this.showEntity) {
            this.gridColumns = this.showEntity.browseFields.map(x => {
                return {
                    title: x.Name,
                    dataIndx: x.Name,
                    dataType: x.DataType,
                    width: 150
                }
            });
            this.gridColumns.push({
                title: "", editable: false, minWidth: 50, sortable: false, render: function (ui: any) {
                    return "<a class='view_details'>Details</a>";
                }
            });
            var that = this;
            this.gridContainer.pqGrid({
                colModel: this.gridColumns,
                dataModel: { data: this.showEntityList },
                refresh: function () {
                    var grid = jQuery(this);
                    if (!grid) return;
                    grid.find("a.view_details")
                        .unbind("click")
                        .bind("click", function (evt) {
                            var tr = jQuery(this).closest("tr"),
                                rowIndx = grid.pqGrid("getRowIndx", { $tr: tr }).rowIndx;
                            that.openDetail(grid.pqGrid('option', 'dataModel.data')[rowIndx]);
                            return false;
                        });
                }
            });
            this.gridContainer.pqGrid("option", "scrollModel.autoFit", true);
            this.entityService.data$.subscribe((updatedEntities: Array<any>) => {
                this.showEntityList = this.entityService.getCurrentLibrary(this.EntityDataStructure)
                this.gridContainer.pqGrid('option', 'dataModel.data', this.showEntityList);
                this.gridContainer.pqGrid('refreshDataAndView');
            });
            this.entityService.initdataLoad(this.EntityDataStructure);
            this.showEntityList = this.entityService.getCurrentLibrary(this.EntityDataStructure);
            this.gridContainer.pqGrid('option', 'dataModel.data', this.showEntityList);
            this.gridContainer.pqGrid('refreshDataAndView');
        }
    }

    ngAfterViewInit() {
        jQuery(this.elRef.nativeElement).find("#gridContainer").attr('id', 'gridContainer_' + this._controlID);
        this.gridContainer = jQuery(jQuery(this.elRef.nativeElement).find('#gridContainer_' + this._controlID));
        this.registerDataService();
    }
}
