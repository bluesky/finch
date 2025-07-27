import { cn } from '@/lib/utils';
import { Entry } from './types/UIEntry';
import { replaceArgs } from './utils/ArgsFill';
import { pxToEm } from './utils/units';
import styles from "./styles.json";
import { useVariant } from "./VariantContext";
import Text from './Text'; // Import your Text component

export type DeviceRenderProps = {
  UIEntry: Entry;
  val?: string | number | boolean;
  vis?: string;
  dynamic?: boolean;
  [key: string]: any;
};

function StyleRender({ UIEntry, val, vis, dynamic, ...args }: DeviceRenderProps) {
  const { variant } = useVariant();
  const name = replaceArgs(UIEntry.name, args); // replaces P and R with 13SIM1 and cam1 e.g.
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
      if (!dynamic) {
        const alignmentClasses = {
          "horiz. right": "text-right",
          "horiz. centered": "text-center",
          "horiz. left": "text-left"
        } as const;

        const alignmentClass = UIEntry.align ? alignmentClasses[UIEntry.align as keyof typeof alignmentClasses] : null;

        return (
          <Text
            dynamic
            {...commonProps}
            className={cn(alignmentClass || undefined, styles.variants[variant as keyof typeof styles.variants].text)}
          >
            {name}
          </Text>
        );
      }
      else {
        const visibilityConditions: Record<string, boolean> = {
          "if zero": val === 0,
          "if not zero": val !== 0,
        };

        // visibilityConditions[vis] takes in vis, which is either "if zero" or "if not zero", so this line asks if
        // vis is defined and either val === 0 or val !== 0 thru visibilityConditions

        if (vis && visibilityConditions[vis]) {
          return (
            <Text
            dynamic
              {...commonProps}
              className={cn(styles.variants[variant as keyof typeof styles.variants].text)}
            >
              {name}
            </Text>
          );
        }

        return null; // fallback condition
      }

    }
    default:
      return null;
  }



}

export default StyleRender;