﻿import { Component, OnInit, DynamicComponentLoader, ElementRef, ComponentRef, Injectable, Input } from 'angular2/core';
import { FORM_DIRECTIVES, FormBuilder, Validators, ControlGroup, AbstractControl } from 'angular2/common';
import { Http, HTTP_PROVIDERS, Response, Request, RequestOptions, RequestMethod, Headers, BrowserXhr } from 'angular2/http';
import { RouteConfig, ROUTER_DIRECTIVES, RouteParams, Router } from 'angular2/router';
import { TestLogger } from './../../services/logger';
import { Restaurant } from './../../models/restaurant';
import { IEntityDataService, IEntityContainer } from './../../models/interfaces';

import { RestaurantDetailComponent } from './../../components/restaurant/restaurant-detail.component';
import { FoodMenuListComponent } from './../../components/foodmenu/foodmenu-list.component';

@Component({
    directives: [RestaurantDetailComponent, FoodMenuListComponent],
    template: `<table><tr>
            <td>First instance  <restaurant-detail [entityID]="entID" #restaurant></restaurant-detail></td>
            <td>Second instance <restaurant-detail [entityID]="entID"></restaurant-detail>
            </td></tr>
           </table>
            All menu of restaurant {{ restaurant.entity.Name }}
            <foodmenu-list [restaurantID]="restaurant.entity.ID"></foodmenu-list>            
            End of dual view`
})
export class RestaurantWrapperComponent {
    private entID: string = "";
    constructor(private logger: TestLogger,
        routeParams: RouteParams
    ) {
        this.entID = routeParams.get("id");
    }
}