import { useMemo, useCallback } from "react";
import useOphydSocket from "@/hooks/useOphydSocket";
import * as ADLs from "./utils/adl";
import { ADLParser } from "./utils/ADLParse";
import ADLCanvas from "./ADLCanvas";
import { cn } from "@/lib/utils";
import { parseCustomFormat } from "./utils/ADLtoJSON";
import { createDeviceNameArray } from "./utils/CreateDeviceNameArray";

export type ADLViewProps = {
  className?: string;
  fileName: string;
  [key: string]: any;
};

export default function ADLView({
  className,
  fileName,
  ...args
}: ADLViewProps) {
  const fileNameNoADL: string = fileName.split(".")[0];
  if (!(fileNameNoADL in ADLs.default)) {
    return <div className="text-white">{fileName} not found</div>;
  }
  const component = ADLs.default[fileNameNoADL as keyof typeof ADLs];
  const ADLData = ADLParser(parseCustomFormat(component));

  // array of ex. "13SIM1:cam1:GainRed"
  // settings is cameraDeviceData which is json of data fro PV's for the camera
  var deviceNames = useMemo(() => createDeviceNameArray(ADLData, args), []);
  const wsUrl = useMemo(() => "ws://localhost:8000/ophydSocket", []);

  //we need a ws just for the control PV, since a user may only want that one
  //we need another ws just for the settings PVs, in case the user wants those options.
  //or can we just combine them into one?

  const { devices, handleSetValueRequest } = useOphydSocket(deviceNames);
  const onSubmitSettings = useCallback(handleSetValueRequest, []);

  return (
    <>
      <div
        className={cn("inline-block rounded-xl bg-slate-100 p-4 mt-4", className)}
      >
        <ADLCanvas
          ADLData={ADLData}
          devices={devices}
          onSubmit={onSubmitSettings}
          {...args}
        />
      </div>
    </>
  );
}
