import { Entry } from './types/UIEntry';
import { replaceArgs } from './utils/ArgsFill';

export type DeviceRenderProps = {
  UIEntry: Entry;
  val?: string | number | boolean;
  vis?: string;
  dynamic?: boolean;
  [key: string]: any;
};

function StyleRender({ UIEntry, val, vis, dynamic, ...args }: DeviceRenderProps) {

  const name = replaceArgs(UIEntry.name, args); // replaces P and R with 13SIM1 and cam1 e.g.
  const { x, y } = UIEntry.location;
  const { width, height } = UIEntry.size;

  const commonProps = {
    style: {
      fontSize: '0.85rem',
      position: 'absolute' as const,
      left: `${x}px`,
      top: `${y}px`,
      width: `${width}px`,
      height: `${height}px`
    },
    children: name // automatically gets put inside div
  };

  if (!dynamic) {
    if (UIEntry.var_type === 'rectangle') {
      const { children, ...propsWithoutChildren } = commonProps;
      return <div {...propsWithoutChildren} className="border-2 border-gray-300" />;
    }

    const alignmentClasses = {
      "horiz. right": "text-right",
      "horiz. centered": "text-center",
      "horiz. left": "text-left"
    } as const;

    const alignmentClass = UIEntry.align ? alignmentClasses[UIEntry.align as keyof typeof alignmentClasses] : null;

    return <div {...commonProps} className={alignmentClass || undefined} />;
  }

  const visibilityConditions: Record<string, boolean> = {
    "if zero": val === 0,
    "if not zero": val !== 0,
  };

  // visibilityConditions[vis] takes in vis, which is either "if zero" or "if not zero", so this line asks if
  // vis is defined and either val === 0 or val !== 0 thru visibilityConditions

  if (vis && visibilityConditions[vis]) {
    return <div {...commonProps} />;
  }

  return null; // fallback condition
}

export default StyleRender;