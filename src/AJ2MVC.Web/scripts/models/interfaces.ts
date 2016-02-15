import { Validator } from 'angular2/common';
import { Observable } from 'rxjs/Observable';

export interface IDataStructure {
    ID: string; // basic property - ID

    getNewInstance(): IDataStructure;
    // EC5 for know, no map object definition
    getValidators(): { [propName: string]: Function[]; };
    setModelData(modelData: IDataStructure): void;

    browseFields: Array<string>;
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

export interface EntityDataService {
    data$: Observable<Array<any>>;
    getEntityNameID(): string;
    initdataLoad(): void;
    reloadData(): void;
    getCurrentLibrary(): Array<any>;
    fetchEntity(ID: string): any;
    updateEntity(entity: any): void;
}