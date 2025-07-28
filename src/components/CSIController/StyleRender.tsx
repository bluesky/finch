import { cn } from '@/lib/utils';
import { Entry } from './types/UIEntry';
import { replaceArgs } from './utils/ArgsFill';
import { pxToEm } from './utils/units';
import styles from "./styles.json";
import { useVariant } from "./VariantContext";
import Text from './Text';
import Rectangle from './Rectangle';

export type StyleRenderProps = {
  UIEntry: Entry;
  val?: string | number | boolean;
  vis?: string;
  dynamic?: boolean;
  [key: string]: any;
};

function StyleRender({ UIEntry, val, vis, dynamic, ...args }: StyleRenderProps) {
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
        <Rectangle
          {...commonProps}
        />
      );
    }
    case 'text': {
      return (
        <Text
          {...commonProps}
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