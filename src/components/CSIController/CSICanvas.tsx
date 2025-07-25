import React, { useEffect, useState } from "react";
import { Devices } from "@/types/deviceControllerTypes";
import { Entry } from "./types/UIEntry";
import StyleRender from "./StyleRender";
import DeviceRender from "./DeviceRender";
import { replaceArgs } from "./utils/ArgsFill";
import { CompositeDeviceRenderer } from "./Comp";
import { pxToEm } from "./utils/units";
import { cn } from "@/lib/utils"; 
import styles from "./styles.json"; 

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
  if (device.dynamic_attribute) {
    // turn pv into "13SIM1:cam1:pv"
    const pv = replaceArgs(device.dynamic_attribute.chan, args);

    return (
      <React.Fragment key={index}>
        <StyleRender
          UIEntry={device}
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
      <StyleRender UIEntry={device} dynamic={false} {...args} />
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

function CSICanvas({
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
      className={cn("relative", styles.styles.default.display,)}
    >
      {renderDevices()}
    </div>
  );
}

export default CSICanvas;