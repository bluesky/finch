import React, { useEffect, useState } from "react";
import { Devices } from "@/types/deviceControllerTypes";
import { Entry } from "./types/UIEntry";
import StyleRender from "./StyleRender";
import DeviceRender from "./DeviceRender";
import { replaceArgs } from "./utils/ArgsFill";
import { CompositeDeviceRenderer } from "./widgets/Comp";
import { pxToEm } from "./utils/units";

export type UICanvasProps = {
  devices: Devices;
  UIData: Entry[];
  onSubmit?: (pv: string, value: string | boolean | number) => void;
  style?: React.CSSProperties;
  [key: string]: any;
};

function renderStyleComponent(
  device: Entry,
  index: number,
  devices: Devices,
  args: { [key: string]: any }
): React.ReactElement {
  return (
    <React.Fragment key={index}>
      <StyleRender
        device={device}
        devices={devices}
        args={args}
      />
    </React.Fragment>
  );
}

function renderDeviceComponent(
  UIEntry: Entry,
  index: number,
  devices: Devices,
  args: { [key: string]: any },
  onSubmit: (pv: string, value: string | boolean | number) => void
): React.ReactElement {
  let pv = replaceArgs(UIEntry.name, args);

  return (
    <React.Fragment key={index}>
      <DeviceRender
        PV={devices[pv]}
        UIEntry={UIEntry}
        onSubmit={onSubmit}
        {...args}
      />
    </React.Fragment>
  );
}

function renderCompComponent(
  device: Entry,
  index: number,
  args: { [key: string]: any }
): JSX.Element | undefined {
  return (
    <CompositeDeviceRenderer
      device={device}
      index={index}
      args={args}
    />
  );
}

function UICanvas({
  UIData,
  devices,
  onSubmit = () => { },
  style,
  ...args
}: UICanvasProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  // get display dimensions
  useEffect(() => {
    const displayDevice = UIData.find(
      (device: Entry) => device.var_type === "display"
    );
    if (displayDevice?.size) {
      setDimensions(displayDevice.size);
      // if no display height is given (-1), set to default 600px
      if (dimensions.height === -1) {
        setDimensions(prev => ({ ...prev, height: 600 }));
      }
    }
  }, [UIData, dimensions.height]);

  const renderDevices = () => {
    return UIData.map((device, index: number) => {
      switch (device.var_type) {
        case "text":
          return renderStyleComponent(device, index, devices, args);
        case "rectangle":
          return renderStyleComponent(device, index, devices, args);
        case "composite":
          return renderCompComponent(device, index, args);
        default:
          return renderDeviceComponent(device, index, devices, args, onSubmit);
      }
    });
  };

  return (
    <div
      style={{
        width: pxToEm(dimensions.width),
        height: pxToEm(dimensions.height),

        ...style,
      }}
      className="relative"
    >
      {renderDevices()}
    </div>
  );
}

export default UICanvas;