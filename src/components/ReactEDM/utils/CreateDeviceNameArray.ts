import { Entry } from "../types/UIEntry";
import { replaceArgs } from "./ArgsFill";

export const createDeviceNameArray = (Data: Entry[], args: { [key: string]: any }) => {

    var pvArray: string[] = [];
    Data.forEach((group) => {
      if (group.var_type !== 'text' && group.var_type !== 'display' && group.var_type !== 'composite' && group.var_type !== 'rectangle') {
        let pv = replaceArgs(group.name, args)
        pvArray.push(pv);
      }
    })
    return pvArray;
  };