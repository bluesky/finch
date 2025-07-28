import { Entry } from './types/UIEntry';
import { Devices } from "@/types/deviceControllerTypes";
import { replaceArgs } from './utils/ArgsFill';
import { pxToEm } from './utils/units';
import Text from './Text';
import Rectangle from './Rectangle';

export type StyleRenderProps = {
  device: Entry;
  devices: Devices;
  args: { [key: string]: any };
};

function StyleRender({ device, devices, args }: StyleRenderProps) {
  const name = replaceArgs(device.name, args);
  const { x, y } = device.location;
  const { width, height } = device.size;

  let val: string | number | boolean | undefined;
  let vis: string | undefined;
  let dynamic = false;

  if (device.dynamic_attribute) {
    dynamic = true;
    const pv = replaceArgs(device.dynamic_attribute.chan, args);
    val = devices[pv]?.value;
    vis = device.dynamic_attribute.vis;
  }

  const commonProps = {
    style: {
      fontSize: '1em',
      position: 'absolute' as const,
      left: pxToEm(x),
      top: pxToEm(y),
      width: pxToEm(width),
      height: pxToEm(height)
    }
  };

  switch (device.var_type) {
    case 'rectangle': {
      return <Rectangle {...commonProps} />
    }
    case 'text': {
      return <Text {...commonProps} dynamic={dynamic} vis={vis} val={val} align={device.align}> {name} </Text>
    }
    default:
      return null;
  }
}

export default StyleRender;