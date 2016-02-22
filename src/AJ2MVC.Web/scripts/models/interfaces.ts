import { Injectable } from 'angular2/core';
import { Validator } from 'angular2/common';
import { Observable } from 'rxjs/Observable';
import { Storage } from './../components/menu';

export interface IEmptyConstruct {
    new (): any;
}

export class FieldDefinition {
    Name: string;
    Pipe: string;
}

export interface IDataStructure {
    ID: string; // basic property - ID
    
    getNewInstance(): IDataStructure;
    // EC5 for know, no map object definition
    getValidators(): { [propName: string]: Function[]; };
    setModelData(modelData: IDataStructure): void;

    browseFields: Array<FieldDefinition>;
    getModuleName(): string;
    getEntityName(): string;
    getNameID(): string;

    // Used for deserialization of an object given from REST service.
    // In most cases this should just be in form of: "fromJSON() : any { return this; }"
    // It should only be used for data transformation or data cleanup (custom UI properties for entity).
    fromRawEntity(entity: IDataStructure): IDataStructure;

    // Used for serialization of an object.
    // Commonly used for special date formating or similiar cases.
    // Base form of: "toJSON() : string { return JSON.stringify(this); }"
    entityToJSON(): string;
}

export class FieldFilter {
    public Field: string;
    public Operator: string;
    public Term: string;

    public static toRhetosRESTQueryString(filter: FieldFilter) {
        return '{"Property":"' + filter.Field + '","Operation":"' + filter.Operator + '","Value":"' + filter.Term + '"}';
    }
}

@Injectable()
export abstract class IEntityDataService {
    data$: Observable<Array<any>>;
    abstract getEntityNameID(DataStructure: IEmptyConstruct): string;
    abstract initdataLoad(DataStructure: IEmptyConstruct): void;
    abstract reloadData(DataStructure: IEmptyConstruct): void;
    abstract getCurrentLibrary(DataStructure: IEmptyConstruct): Array<any>;
    abstract fetchEntity(DataStructure: IEmptyConstruct, ID: string): Promise<any>;
    abstract updateEntity(DataStructure: IEmptyConstruct, entity: any): void;
    abstract createEntity(DataStructure: IEmptyConstruct, entity: IDataStructure): void;
    abstract deleteEntity(DataStructure: IEmptyConstruct, entity: IDataStructure): void;
    abstract filterData(DataStructure: IEmptyConstruct, filters: FieldFilter[]): Promise<any[]>;
}

export class OverrideComponentDescriptor {
    hostComponentDescriptor: string;
    hostElementPlaceHolder: string;
    overrideComponent: any;
}

@Injectable()
export class IOverrideDetailComponent {
    static PlaceHolder: string = "DEFAULTANCHOR";
    getInstanceID(): string { return "NotDefined"; }
}

export class IEntityContainer {
    public entity: IDataStructure;
}

export class DecoratorRegistrations {
    static registeredOverrides: Storage<OverrideComponentDescriptor> = new Storage<OverrideComponentDescriptor>();
}

export class OverrideDetailComponentMetadata {
    hostComponent: any;
    targetPlaceHolder: string;
}

export function OverrideDetailComponent(params: OverrideDetailComponentMetadata) {
    return (target: any) => {
        DecoratorRegistrations.registeredOverrides.data.push({ hostComponentDescriptor: params.hostComponent.name, hostElementPlaceHolder: params.targetPlaceHolder, overrideComponent: target });
        console.log(' ***** Override detail component registered: ' + target + ', args: ' + params.hostComponent + ' -> ' + params.targetPlaceHolder);
    }
}