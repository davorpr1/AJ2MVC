import { FoodMenu } from './../models/foodmenu';
import { OverrideDataDefinition } from './../models/interfaces';
import { DataStructureWithClaims } from './../services/rhetos-rest.service';

@OverrideDataDefinition({
    hostDataDefinition: FoodMenu
})
export class OverrideSaveFoodMenuDetail {
    public override(foodMenuDesc: DataStructureWithClaims) {
        var bkp = foodMenuDesc.save;
        for (var i: number = foodMenuDesc.dataStructure.browseFields.length - 1; i >= 0; i--) {
            if (foodMenuDesc.dataStructure.browseFields[i].Name == "ActiveFrom" || foodMenuDesc.dataStructure.browseFields[i].Name == "ActiveUntil") {
                foodMenuDesc.dataStructure.browseFields[i].Name += "Date";
                foodMenuDesc.dataStructure.browseFields[i].DataType = "date";
                foodMenuDesc.dataStructure.browseFields[i].Pipe = "msDate";
            }
        }

        foodMenuDesc.save = (ent: FoodMenu, initSave: (ent: any) => void) => {
            ent.Name += "added";
            bkp(ent, initSave);
            console.log("Data overriden sent for save!");
        };
    }
}
