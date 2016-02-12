import {ModelA} from './../models/modela';
import {Provider, provide, Injector, OpaqueToken, Injectable, NoProviderError } from 'angular2/core';
import {GlobalOverridesInjector} from './../module/module.registration';

@Injectable()
export class ModelAFactory {
    private _globalInjector: GlobalOverridesInjector;

    constructor(globalInjector: GlobalOverridesInjector) {
        console.log('ModelAFactory instatinated!');
        this._globalInjector = globalInjector;
        console.log("GLOBAL INJECTOR PROVIDERS: " + GlobalOverridesInjector.sharedProviders);
    }

    public getInstance() : ModelA {
        var model: ModelA = new ModelA();
        return model;
    }

    public testMultiProviders(testObj: ModelA) {
        var registeredClasses: any[] = [];

        try {
            registeredClasses = Injector.resolveAndCreate(GlobalOverridesInjector.sharedProviders).get("BasicClassToOverride");
        } catch (loadException) {
            if (loadException instanceof NoProviderError) {
                console.log((loadException as NoProviderError).message);
                return; // OK, no registered override providers.
            } else {
                throw loadException;
            }
        }

        console.log('TestMultiProviders result: ' + registeredClasses);
        console.log(registeredClasses[0]);
        for (var ix = 0; ix < registeredClasses.length; ix++)
            registeredClasses[ix].override(testObj);
    }
}

export interface IOverride {
    override(input: any) : any;
}
