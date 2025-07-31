import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Devices } from "@/types/deviceControllerTypes";
import { Entry } from "./types/ADLEntry";
import StyleRender from "./StyleRender";
import DeviceRender from "./DeviceRender";
import { ADLParser } from "./utils/ADLParse";
import * as ADLs from "./utils/adl";
import useOphydSocket from "@/hooks/useOphydSocket";
import { parseCustomFormat } from "./utils/ADLtoJSON";
import { replaceArgs } from "./utils/ArgsFill";
import { createDeviceNameArray } from "./utils/CreateDeviceNameArray";

export type ADLCanvasProps = {
  devices: Devices;
  ADLData: Entry[];
  onSubmit?: (pv: string, value: string | boolean | number) => void;
  style?: React.CSSProperties;
  [key: string]: any;
};

function renderTextComponent(
  device: Entry,
  index: number,
  devices: Devices,
  args: { [key: string]: any }
): React.ReactElement {
  if (device.dynamic_attribute) {
    // turn pv into "13SIM1:cam1:pv"
    const pv = replaceArgs(device.dynamic_attribute.chan, args);

    return (
      <React.Fragment key={index}>
        <StyleRender
          ADLEntry={device}
          dynamic={true}
          val={devices[pv]?.value}
          vis={device.dynamic_attribute.vis}
          {...args}
        />
      </React.Fragment>
    );
  }

  return (
    <React.Fragment key={index}>
      <StyleRender ADLEntry={device} dynamic={false} {...args} />
    </React.Fragment>
  );
}

function renderDeviceComponent(
  ADLEntry: Entry,
  index: number,
  devices: Devices,
  args: { [key: string]: any },
  onSubmit: (pv: string, value: string | boolean | number) => void
): React.ReactElement {
  let pv = replaceArgs(ADLEntry.name, args);

  return (
    <React.Fragment key={index}>
      <DeviceRender
        PV={devices[pv]}
        ADLEntry={ADLEntry}
        onSubmit={onSubmit}
        {...args}
      />
    </React.Fragment>
  );
}

function renderCompositeDevice(
  device: Entry,
  index: number,
  detectorSetup: any, // Replace with your actual detectorSetup type
  args: { [key: string]: any }
): JSX.Element | undefined {
  const canvasStyle = {
    position: "absolute" as const, // The 'as const' ensures TypeScript knows it's a literal
    left: `${device.location.x}px`,
    top: `${device.location.y}px`,
  };
  // if the composite links to another adl file
  if (device.comp_file !== undefined) {
    // if given ADSetup.adl, this returns ADSetup
    const fileNameNoADL: string = device.comp_file.split(".")[0];
    if (!(fileNameNoADL in ADLs.default)) {
      return <div className="text-black" style={canvasStyle}>{device.comp_file} not found</div>;
    }
    // this is the actual ADL file from detecetorSetup (which represents all contents of the adl folder)
    const component =
      detectorSetup.default[fileNameNoADL as keyof typeof detectorSetup];

    // parsed version of the adl file
    const data = ADLParser(parseCustomFormat(component));

    // ws call
    const deviceNames = useMemo(() => createDeviceNameArray(data, args), []);

    const wsUrl = useMemo(() => "ws://localhost:8000/ophydSocket", []);
    const { devices, handleSetValueRequest } = useOphydSocket(
      deviceNames
    );
    const onSubmitSettings = useCallback(handleSetValueRequest, []);

    return (
      <React.Fragment key={index}>
        <ADLCanvas
          ADLData={data}
          devices={devices}
          onSubmit={onSubmitSettings}
          style={canvasStyle}
          {...args}
        />
      </React.Fragment>
    );
  }
  // if the composite just has children components and not another ADL file
  else if (device.children !== undefined) {
    const deviceNames = useMemo(
      () => createDeviceNameArray(device.children!, args),
      []
    );
    const wsUrl = useMemo(() => "ws://localhost:8000/ophydSocket", []);
    const { devices, handleSetValueRequest } = useOphydSocket(
      deviceNames
    );
    const onSubmitSettings = useCallback(handleSetValueRequest, []);

    return (
      <React.Fragment key={index}>
        <ADLCanvas
          ADLData={device.children!}
          devices={devices}
          onSubmit={onSubmitSettings}
          style={{ position: "absolute" }}
          {...args}
        />
      </React.Fragment>
    );
  }

  return undefined;
}

function ADLCanvas({
  ADLData,
  devices,
  onSubmit = () => {},
  style,
  ...args
}: ADLCanvasProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  // get display dimensions
  useEffect(() => {
    const displayDevice = ADLData.find(
      (device) => device.var_type === "display"
    );
    if (displayDevice?.size) {
      setDimensions(displayDevice.size);
    }
  }, [ADLData]);
  const renderDevices = () => {
    return ADLData.map((device: Entry, index: number) => {
      switch (device.var_type) {
        case "text":
          return renderTextComponent(device, index, devices, args);
        case "rectangle":
          return renderTextComponent(device, index, devices, args);
        case "composite":
          return renderCompositeDevice(device, index, ADLs, args);
        default:
          return renderDeviceComponent(device, index, devices, args, onSubmit);
      }
    });
  };
  return (
    <div
      style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        ...style,
      }}
      className="relative"
    >
      {renderDevices()}
    </div>
  );
}

export default ADLCanvas;
