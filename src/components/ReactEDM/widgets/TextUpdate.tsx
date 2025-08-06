import { cn } from "@/lib/utils"; // adjust import path as needed
import { useVariant } from '../context/VariantContext';
import styles from "../styles.json"

interface TextUpdateProps {
    val: string | number | boolean;
    enum_strs?: string[] | null;
    precision?: number | null;
    style?: React.CSSProperties;
}

export const TextUpdate: React.FC<TextUpdateProps> = ({
    val,
    enum_strs,
    precision,
    style,
}) => {
    const { variant } = useVariant();
    const getDisplayValue = () => {
        if (typeof val === 'number') {
            // if update value is for an enum
            if (enum_strs) {
                return enum_strs[val];
            }
            // if update value is just a number
            if (precision === null) {
                return val;
            } else {
                return val.toFixed(precision);
            }
        }
        // if update value is a string or boolean
        return String(val);
    };

    const getClassName = () => {
        const baseClasses = "text-blue-900";
        const variantClass = styles?.variants?.[variant as keyof typeof styles.variants]?.text_update || "";
        const truncateClass = typeof val === 'string' ? "truncate" : "";

        return cn(baseClasses, truncateClass, variantClass);
    };

    return (
        <div style={style} className={getClassName()}>
            {getDisplayValue()}
        </div>
    );
};