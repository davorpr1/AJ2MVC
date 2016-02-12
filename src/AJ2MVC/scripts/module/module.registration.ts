import { Provider, View, provide, Injector, Component, Injectable, OpaqueToken } from 'angular2/core';
import { FORM_DIRECTIVES } from 'angular2/common';
import { bootstrap } from 'angular2/platform/browser';
import * as modDef from './../module/overrides';
import { TestLogger } from './../components/logger';
import { GlobalDataSharing, Storage, MenuItem } from './../components/menu';

@Injectable()
export class GlobalOverridesInjector {
    private static _registeredProviders: Provider[];
    private _injector: Injector;

    get sharedInjector(): Injector {
        return this._injector;
    }
    static get sharedProviders(): Provider[] {
        return this._registeredProviders;
    }

    addProvider(provider: Provider) {
        GlobalOverridesInjector._registeredProviders.push(provider);
        this._injector = Injector.resolveAndCreate(GlobalOverridesInjector._registeredProviders);
    }

    addProviders(providers: Provider[]) {
        GlobalOverridesInjector._registeredProviders = GlobalOverridesInjector._registeredProviders.concat(providers);
        this._injector = Injector.resolveAndCreate(GlobalOverridesInjector._registeredProviders);
    }

    registerMultiProviderClass(namedClass: string, providerClass: any) {
        this.addProvider(new Provider(namedClass, { useClass: providerClass, multi: true }));
    }

    constructor() {
        if (GlobalOverridesInjector._registeredProviders === undefined)
            GlobalOverridesInjector._registeredProviders = new Array<Provider>();

        this._injector = Injector.resolveAndCreate(GlobalOverridesInjector._registeredProviders);
    }
}

@Component({
    directives: [FORM_DIRECTIVES],
    selector: 'modulex-placed',
    template: ``
})
class ModuleStartComponent {
    static moduleIdentifier: string = "Module X - Overrides of basic classes";

    constructor(logger: TestLogger, globalInjector: GlobalOverridesInjector, globalDataShare: GlobalDataSharing) {
        let newMenuItem: MenuItem = new MenuItem();
        newMenuItem.Name = "Test";
        newMenuItem.Tooltip = "Some kind of extra data in tooltip";
        globalDataShare.addSharedData<MenuItem>("MenuItems", newMenuItem);

        logger.log("Module X instatinated!");

        globalInjector.registerMultiProviderClass("BasicClassToOverride", modDef.Override1);
        globalInjector.registerMultiProviderClass("BasicClassToOverride", modDef.Override2);

        var res = Injector.resolveAndCreate(GlobalOverridesInjector.sharedProviders).get("BasicClassToOverride");

        logger.log("Overrides registered to global Injector! RESULT: " + res);
    }
}

bootstrap(ModuleStartComponent, [
    new Provider(TestLogger, { useClass: TestLogger }),
    new Provider(GlobalOverridesInjector, { useClass: GlobalOverridesInjector }),
    new Provider(GlobalDataSharing, { useClass: GlobalDataSharing })
]);

