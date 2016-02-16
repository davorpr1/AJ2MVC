import { Provider, View, provide, Injector, Component, Injectable, OpaqueToken, OnInit, EventEmitter } from 'angular2/core';
import { FORM_DIRECTIVES } from 'angular2/common';
import { bootstrap } from 'angular2/platform/browser';
import { TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { TestLogger } from './../components/logger';
import { IDataStructure, IEntityDataService } from './../models/interfaces';

export class Storage<T> {
    public data: Array<T> = new Array<T>();

    public OnUpdate: EventEmitter<T> = new EventEmitter<T>();
}

@Injectable()
export class GlobalDataSharing {
    private static _storages: Map<string, Storage<any>>;

    addSharedData<T>(storageName: string, addedData: any) {
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

export class MenuItem {
    public Name: string;
    public Icon: string;
    public Tooltip: string;
    public Link: string;
    public RouteMechanism: IRouteMechanism;
}

@Component({
    directives: [FORM_DIRECTIVES, TOOLTIP_DIRECTIVES],
    selector: 'global-menu',
    template: `
        <nav><a *ngFor="#menuItem of _plainMenu" 
           tooltip="{{menuItem.Tooltip}}"
           tooltipPlacement="top"
           tooltipTrigger="mouseenter"
           (click)="gotoMenuDirection(menuItem)">{{menuItem.Name}}</a>
        </nav>`
})
class MenuComponent implements OnInit {
    private menuItems: Storage<MenuItem> = new Storage<MenuItem>();
    private _plainMenu: Array<MenuItem> = new Array<MenuItem>();

    constructor(private globalDataShare: GlobalDataSharing, private logger: TestLogger) {
    }

    gotoMenuDirection(menuItem: MenuItem) {
        menuItem.RouteMechanism.handleNavigation(menuItem.Link);
    }

    ngOnInit() {
        this.menuItems = this.globalDataShare.getSharedData<MenuItem>("MenuItems");
        this._plainMenu = this.menuItems.data;

        this.menuItems.OnUpdate.subscribe((newItem: MenuItem) => {
            this.logger.log("New menu item registered: " + newItem.Name);
            this._plainMenu = this.menuItems.data;
        }, () => { }, () => { });
    }
}

bootstrap(MenuComponent, [
    new Provider(TestLogger, { useClass: TestLogger }),
    new Provider(GlobalDataSharing, { useClass: GlobalDataSharing })
]);


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