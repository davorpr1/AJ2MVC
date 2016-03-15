import { Component, View, provide } from 'angular2/core';

@Component({
    inputs: ["inProgressID"],
    template: `<div *ngIf="inProgressID" class="inside-div-overlay"><img class="working-icon" src="./../css/cog11.svg" data-cog="cog11"></div>`
})
export class BusyOverlayComponent {
    public inProgressID: boolean;
}