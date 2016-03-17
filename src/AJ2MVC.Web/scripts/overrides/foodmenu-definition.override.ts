import { FoodMenu } from './../models/foodmenu';
import { OverrideDataDefinition } from './../models/interfaces';
import { DataStructureWithClaims } from './../services/rhetos-rest.service';

@OverrideDataDefinition({
    hostDataDefinition: FoodMenu
})
export class OverrideSaveFoodMenuDetail {
    public override(foodMenuDesc: DataStructureWithClaims) {
        var bkp = foodMenuDesc.saveOld, bkpInsert = foodMenuDesc.saveNew;
        for (var i: number = foodMenuDesc.dataStructure.browseFields.length - 1; i >= 0; i--) {
            if (foodMenuDesc.dataStructure.browseFields[i].Name == "ActiveFrom" || foodMenuDesc.dataStructure.browseFields[i].Name == "ActiveUntil") {
                foodMenuDesc.dataStructure.browseFields[i].Name += "Date";
                foodMenuDesc.dataStructure.browseFields[i].DataType = "date";
                foodMenuDesc.dataStructure.browseFields[i].Pipe = "msDate";
            }
        }

        foodMenuDesc.saveOld = (ent: FoodMenu, initSave: (ent: any) => void) => {
            ent.Name += "_UPDATE";
            bkp(ent, initSave);
            console.log("Data overriden sent for save!");
        };

        foodMenuDesc.saveNew = (ent: FoodMenu, initSave: (ent: any) => void) => {
            ent.Name += "_INSERT";
            bkpInsert(ent, initSave);
            console.log("Data overriden sent for save!");
        };
    }
}
