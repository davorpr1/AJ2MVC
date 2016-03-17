import { Input, Output, HostBinding, AfterViewInit, HostListener, EventEmitter, Component, Self, Attribute, ViewEncapsulation, ElementRef, ChangeDetectorRef } from 'angular2/core';
import { ControlValueAccessor, NgControl } from 'angular2/common';
import { Router } from 'angular2/router';
import { IEntityDataService, IEmptyConstruct, IDataStructure, FieldFilter } from './../models/interfaces';
import { BaseEntity } from './../models/entitybase';

@Component({
    selector: 'base-grid',
    encapsulation: ViewEncapsulation.Emulated,
    template: `<div id="gridContainer"></div>`
})
export class GridComponent implements AfterViewInit {
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
                that.gridContainer.pqGrid('option', 'dataModel.data', that.showEntityList);
                that.gridContainer.pqGrid('refreshDataAndView');
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
    private _filters: Array<FieldFilter> = null;

    constructor(private elRef: ElementRef,
        private router: Router,
        private entityService: IEntityDataService,
        private cd: ChangeDetectorRef
    ) {
        this._controlID = ++GridComponent.staticID;
    }

    openDetail(entity: IDataStructure) {
        if (this.editLink.length > 0) {
            this.router.navigate([this.editLink, { id: entity.ID }]);
        } else {
            this.router.navigate([this.showEntity.getNameID() + '_DetailComponent', { id: entity.ID }]);
        }
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
                toolbar: {
                    items: [
                        {
                            type: 'button', icon: 'ui-icon-plus', label: 'New', listeners: [
                                {
                                    "click": function (evt: any, ui: any) {
                                        that.openDetail(that.showEntity.getNewInstance());
                                    }
                                }
                            ]
                        }
                    ]
                },
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
            this.cd.detectChanges();
            this.entityService.dataObserver.subscribe((updatedEntities: Array<any>) => {
                if (!this._filters || this._filters.length === 0) {
                    this.showEntityList = this.entityService.getCurrentLibrary(this.EntityDataStructure);
                } else {
                    this.showEntityList = this.entityService.getCurrentLibraryWithFilters(this.EntityDataStructure, this._filters);
                }
                this.gridContainer.pqGrid('option', 'dataModel.data', this.showEntityList);
                this.gridContainer.pqGrid('refreshDataAndView');
            });
            try {
                this.entityService.initdataLoad(this.EntityDataStructure);
            } catch (e) {
                alert(e);
            }

            if (this._filters && this._filters.length > 0) {
                this.entityService.filterData(this.EntityDataStructure, this._filters).then((res: any[]) => {
                    this.showEntityList = res;
                    this.gridContainer.pqGrid('option', 'dataModel.data', this.showEntityList);
                    this.gridContainer.pqGrid('refreshDataAndView');
                });
            } else {
                this.showEntityList = this.entityService.getCurrentLibrary(this.EntityDataStructure);
                this.gridContainer.pqGrid('option', 'dataModel.data', this.showEntityList);
                this.gridContainer.pqGrid('refreshDataAndView');
            }
        }
    }

    ngAfterViewInit() {
        jQuery(this.elRef.nativeElement).find("#gridContainer").attr('id', 'gridContainer_' + this._controlID);
        this.gridContainer = jQuery(jQuery(this.elRef.nativeElement).find('#gridContainer_' + this._controlID));
        this.registerDataService();
    }
}
