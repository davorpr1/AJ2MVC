import { Provider, View, provide, Injector, Component, Injectable, OpaqueToken, OnInit, EventEmitter } from 'angular2/core';
import { Router } from 'angular2/router';
import { FORM_DIRECTIVES } from 'angular2/common';
import { bootstrap } from 'angular2/platform/browser';
import { TestLogger } from './../services/logger';
import { IDataStructure, IEntityDataService, DecoratorRegistrations } from './../models/interfaces';
import { OMAttributes } from './../directives/om_attribute';

export class Storage<T> {
    public data: Array<T> = new Array<T>();

    public OnUpdate: EventEmitter<T> = new EventEmitter<T>();
}

@Injectable()
export class GlobalDataSharing {
    private static _storages: Map<string, Storage<any>>;

    addSharedData<T>(storageName: string, addedData: T) {
        if (!GlobalDataSharing._storages.has(storageName))
            GlobalDataSharing._storages.set(storageName, new Storage<T>());

        GlobalDataSharing._storages.get(storageName).data.push(addedData);
        GlobalDataSharing._storages.get(storageName).OnUpdate.next(addedData);
    }

    getSharedData<T>(storageName: string): Storage<T> {
        if (!GlobalDataSharing._storages.has(storageName))
            GlobalDataSharing._storages.set(storageName, new Storage<T>());

        return GlobalDataSharing._storages.get(storageName);
    }
    
    constructor() {
        if (GlobalDataSharing._storages === undefined)
            GlobalDataSharing._storages = new Map<string, Storage<any>>();
    }
}

export interface IRouteMechanism {
    handleNavigation(link: string): void;
}

export interface IMenuItem {
    Name: string;
    Icon?: string;
    Tooltip: string;
    Link: string;
}

export class MenuItem {
    public Name: string = "";
    public Icon: string = "";
    public Tooltip: string = "";
    public Link: string = "";
    constructor(menuItem?: IMenuItem) {
        if (menuItem) {
            this.Name = menuItem.Name;
            this.Icon = menuItem.Icon;
            this.Tooltip = menuItem.Tooltip;
            this.Link = menuItem.Link;
        }
    }
}

@Component({
    directives: [FORM_DIRECTIVES, OMAttributes],
    selector: 'app-menu',
    template: `Menu
        <nav><span *ngFor="#menuItem of _plainMenu" 
           class="tooltip tooltip-top"
           [omAttributes]="{'data-tooltip': menuItem.Tooltip }"
           (click)="gotoMenuDirection(menuItem)">{{menuItem.Name}}</span>
        </nav>`
})
export class MenuComponent  {
    private menuItems: Storage<MenuItem> = new Storage<MenuItem>();
    private _plainMenu: Array<MenuItem> = new Array<MenuItem>();

    constructor(private globalDataShare: GlobalDataSharing, private logger: TestLogger, private router: Router) {
        logger.log('MenuComponent instatinated!');
        this.menuItems = this.globalDataShare.getSharedData<MenuItem>("MenuItems");
        DecoratorRegistrations.registeredDecorators.filter(x => x instanceof MenuItem).map(exDecorated => this.menuItems.data.push(exDecorated));

        this._plainMenu = this.menuItems.data;

        this.menuItems.OnUpdate.subscribe((newItem: MenuItem) => {
            console.log("New menu item registered: " + newItem);
            this._plainMenu = this.menuItems.data;
        }, () => { }, () => { });
    }

    gotoMenuDirection(menuItem: MenuItem) {
        this.router.navigate([menuItem.Link]);
    }    
}

// 1. Menu items container
    // simple class with Array<menuItem>
    // simple class menuItem
        // can contain Array<menuItem>
        // contains name, icon, tooltip, routerlink??
        // defines @RouteConfig... - route registration if needed
// 2. Menu items registration
    // needs to be boostraped in App or root html file
    // menu item register class (above) - adds to container in constructor part
// 3. Menu items renderer
    // component to render list items from container