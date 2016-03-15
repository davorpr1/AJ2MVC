import {Provider, provide, Injector, OpaqueToken, Injectable, NoProviderError, OnInit } from 'angular2/core';
import { GlobalDataSharing, Storage } from './../controls/menu';
import { OverrideDataDefinitionDescriptor, DecoratorRegistrations } from './../models/interfaces';

@Injectable()
export class DataOverridesFactory {
    private registeredOverrides: Storage<OverrideDataDefinitionDescriptor> = new Storage<OverrideDataDefinitionDescriptor>();
    private _plainOverrides: Array<OverrideDataDefinitionDescriptor> = new Array<OverrideDataDefinitionDescriptor>();

    constructor(private globalDataShare: GlobalDataSharing) {
        console.log('DataOverridesFactory instatinated!');
        this.registeredOverrides = this.globalDataShare.getSharedData<OverrideDataDefinitionDescriptor>("DataAccessOverrides");
        DecoratorRegistrations.registeredDecorators.filter(x => x instanceof OverrideDataDefinitionDescriptor).map(exDecorated => this.registeredOverrides.data.push(exDecorated));

        this._plainOverrides = this.registeredOverrides.data;

        this.registeredOverrides.OnUpdate.subscribe((newItem: OverrideDataDefinitionDescriptor) => {
            console.log("New override registered for: " + newItem.overrideDataDefinition);
            this._plainOverrides = this.registeredOverrides.data;
        }, () => { }, () => { });
    }

    // returns Type
    public getAllDataOverrides(dataListenerDescriptors: Array<string>): OverrideDataDefinitionDescriptor[]
    {
        return this._plainOverrides.filter(x => dataListenerDescriptors.indexOf(x.hostDataDescriptor) >= 0).map(x => x);
    }
}
