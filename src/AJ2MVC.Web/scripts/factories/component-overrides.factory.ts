import {Provider, provide, Injector, OpaqueToken, Injectable, NoProviderError, OnInit } from 'angular2/core';
import { GlobalDataSharing, Storage } from './../components/menu';
import { OverrideComponentDescriptor, IOverrideDetailComponent, IEmptyConstruct } from './../models/interfaces';

@Injectable()
export class ComponentOverridesFactory {
    private registeredOverrides: Storage<OverrideComponentDescriptor> = new Storage<OverrideComponentDescriptor>();
    private _plainOverrides: Array<OverrideComponentDescriptor> = new Array<OverrideComponentDescriptor>();

    constructor(private globalDataShare: GlobalDataSharing) {
        console.log('ComponentOverridesFactory instatinated!');
        this.registeredOverrides = this.globalDataShare.getSharedData<OverrideComponentDescriptor>("ComponentDetailOverrides");
        this._plainOverrides = this.registeredOverrides.data;

        this.registeredOverrides.OnUpdate.subscribe((newItem: OverrideComponentDescriptor) => {
            console.log("New override registered for: " + newItem.overrideComponent);
            this._plainOverrides = this.registeredOverrides.data;
        }, () => { }, () => { });
    }

    // returns Type
    public getAllComponentOverrides(componentListenerDescriptors: Array<string>): IEmptyConstruct[]
    {
        return this._plainOverrides.filter(x => componentListenerDescriptors.indexOf(x.hostComponentDescriptor) >= 0 ).map(x => x.overrideComponent);
    }
}
