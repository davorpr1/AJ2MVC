import { Injectable, EventEmitter, Injector } from 'angular2/core';
import { Validator, ControlGroup, NgFormModel } from 'angular2/common';
import { Observable } from 'rxjs/Observable';
import { Storage, MenuItem, IMenuItem } from './../controls/menu';

export interface IEmptyConstruct {
    new (): any;
}

export class ValidatorDefinition {
    Validator: Function;
    ErrorMessage: string;
    ErrorCode: string;
}

export class FieldDefinition {
    Name: string;
    Pipe: string;
    DataType: string;
}

export interface IDataStructure {
    ID: string; // basic property - ID
    
    getNewInstance(): IDataStructure;
    // EC5 for know, no map object definition
    getValidators(): { [propName: string]: ValidatorDefinition[]; };
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

export enum DataChangeType {
    Insert,
    Update,
    Delete
}

export class ChangesCommit {
    public ID: string = ""; // change identifier
    public DataType: IEmptyConstruct;
    public ChnageType: DataChangeType;
    public data: Array<IDataStructure>;
}

export class DataChanged {
    public ID: string = ""; // change identifier
    public data: Array<IDataStructure>;
}

@Injectable()
export abstract class IEntityDataService {
    data: Array<any>;
    dataObserver: EventEmitter<DataChanged>;
    abstract registerNewChangesStream(newStream: Observable<ChangesCommit>): void;
    abstract getEntityNameID(DataStructure: IEmptyConstruct): string;
    abstract initdataLoad(DataStructure: IEmptyConstruct): void;
    abstract reloadData(DataStructure: IEmptyConstruct): void;
    abstract getCurrentLibrary(DataStructure: IEmptyConstruct): Array<any>;
    abstract getCurrentLibraryWithFilters(DataStructure: IEmptyConstruct, filters: FieldFilter[]): Array<any>;    
    abstract fetchEntity(DataStructure: IEmptyConstruct, ID: string): Promise<any>;
    abstract updateEntity(DataStructure: IEmptyConstruct, entity: any): void;
    abstract createEntity(DataStructure: IEmptyConstruct, entity: IDataStructure): void;
    abstract deleteEntity(DataStructure: IEmptyConstruct, entity: IDataStructure): void;
    abstract filterData(DataStructure: IEmptyConstruct, filters: FieldFilter[]): Promise<any[]>;

    abstract getDummy(DataStructure: IEmptyConstruct): IDataStructure;
}

export class OverrideComponentDescriptor {
    hostComponentDescriptor: string;
    hostElementPlaceHolder: string;
    overrideComponent: any;
    constructor(item: OverrideComponentDescriptor) {
        this.hostComponentDescriptor = item.hostComponentDescriptor;
        this.hostElementPlaceHolder = item.hostElementPlaceHolder;
        this.overrideComponent = item.overrideComponent;
    }
}

export class ControlDefinition {
    placeHolder: string;
    controlComponent: any;
    propertyName: string; 
    componentInstance: any = null;
}

@Injectable()
export class IOverrideDetailComponent {
    static PlaceHolder: string = "DEFAULTANCHOR";
    getInstanceID(): string { return "NotDefined"; }
}

@Injectable()
export class IEntityContainer {
    public entity: IDataStructure;
    public entityForm: ControlGroup;
}

export class DecoratorRegistrations {
    static registeredDecorators: Array<any> = new Array<any>();
}

export interface OverrideDetailComponentMetadata {
    hostComponent: any;
    targetPlaceHolder?: string;
}

export function OverrideDetailComponent(params: OverrideDetailComponentMetadata) {
    return (target: any) => {
        if (!params.targetPlaceHolder) params.targetPlaceHolder = 'DEFAULTANCHOR';

        DecoratorRegistrations.registeredDecorators.push(new OverrideComponentDescriptor({ hostComponentDescriptor: params.hostComponent.name, hostElementPlaceHolder: params.targetPlaceHolder, overrideComponent: target }));
        console.log(' ***** Override detail component registered: ' + target + ', args: ' + params.hostComponent.name + ' -> ' + params.targetPlaceHolder);
    }
}

export function AppMenuItem(params: IMenuItem) {
    return (target: any) => {
        DecoratorRegistrations.registeredDecorators.push(new MenuItem(params));
        console.log(' ***** Menu item registered in declaration time: ' + target + ', args: ' + params);
    }
}

/*Override data definition*/

export class OverrideDataDefinitionDescriptor {
    hostDataDescriptor: string;
    overrideDataDefinition: any;
    constructor(item: OverrideDataDefinitionDescriptor) {
        this.hostDataDescriptor = item.hostDataDescriptor;
        this.overrideDataDefinition = item.overrideDataDefinition;
    }
}

export interface OverrideDataDefinitionMetadata {
    hostDataDefinition: any;
}
export class ClassHelper {
    static getClassName(someClass: any): string {
        return someClass["constructor"].toString().match(/\w+/g)[1];
    }
}

export function OverrideDataDefinition(params: OverrideDataDefinitionMetadata) {
    return (target: any) => {
        DecoratorRegistrations.registeredDecorators.push(new OverrideDataDefinitionDescriptor({ hostDataDescriptor: params.hostDataDefinition.name, overrideDataDefinition: target }));
        console.log(' ***** Override detail component registered: ' + target.name + ', args: ' + params.hostDataDefinition.name);
    }
}
