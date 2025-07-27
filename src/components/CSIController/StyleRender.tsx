import { cn } from '@/lib/utils';
import { Entry } from './types/UIEntry';
import { replaceArgs } from './utils/ArgsFill';
import { pxToEm } from './utils/units';
import styles from "./styles.json";
import { useVariant } from "./VariantContext";
import Text from './Text';

export type DeviceRenderProps = {
  UIEntry: Entry;
  val?: string | number | boolean;
  vis?: string;
  dynamic?: boolean;
  [key: string]: any;
};

function StyleRender({ UIEntry, val, vis, dynamic, ...args }: DeviceRenderProps) {
  const { variant } = useVariant();
  const name = replaceArgs(UIEntry.name, args);
  const { x, y } = UIEntry.location;
  const { width, height } = UIEntry.size;

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

  switch (UIEntry.var_type) {
    case 'rectangle': {
      return (
        <div
          {...commonProps}
          className={cn("border-2 border-gray-300", styles.variants[variant as keyof typeof styles.variants].rectangle)}
        />
      );
    }
    case 'text': {
      return (
        <Text
          {...commonProps}
          className={cn(styles.variants[variant as keyof typeof styles.variants].text)}
          dynamic={dynamic}
          vis={vis}
          val={val}
          align={UIEntry.align}
        >
          {name}
        </Text>
      );
    }
    default:
      return null;
  }
}

export default StyleRender;