import { EventEmitter } from 'angular2/core';
import { Validators, Validator } from 'angular2/common';
import { BaseEntity } from './../../models/entitybase';

export class Claim extends BaseEntity {
    public ClaimResource: string;
    public ClaimRight: string;
    public Active: boolean;
    public ID: string;

    getNewInstance(): Claim { return new Claim(); }
    getModuleName(): string { return "Common"; }
    getEntityName(): string { return "Claim"; }

    getValidators(): { [propName: string]: Function[]; } { return { }; }

    toRhetosRESTQueryString(claim: Claim): string {
        if (claim) return '{"ClaimResource":"' + claim.ClaimResource + '","ClaimRight":"' + claim.ClaimRight + '"}';
        else return '{"ClaimResource":"' + this.ClaimResource + '","ClaimRight":"' + this.ClaimRight + '"}';
    }

    public setModelData(modelData: Claim) {
        if (modelData) {
            this.ID = modelData.ID;
            this.ClaimResource = modelData.ClaimResource;
            this.ClaimRight = modelData.ClaimRight;
            this.Active = modelData.Active;
        }
    }

    private jsonReplaceHelper(prop: string, val: any) {
        if (!val) return undefined; // prevent sending null values to server
        return val;
    }
}

export class MyClaim extends Claim {
    public ClaimResource: string;
    public ClaimRight: string;
    public Active: boolean;
    public ID: string;

    public Applies: boolean = false;

    getNewInstance(): MyClaim { return new MyClaim(); }
    getModuleName(): string { return "Common"; }
    getEntityName(): string { return "MyClaim"; }

    toRhetosRESTQueryString(claim: MyClaim): string {
        if (claim) return '{"ClaimResource":"' + claim.ClaimResource + '","ClaimRight":"' + claim.ClaimRight + '","Applies":' + claim.Applies + '}';
        else return '{"ClaimResource":"' + this.ClaimResource + '","ClaimRight":"' + this.ClaimRight + '","Applies":' + this.Applies + '}';
    }
}