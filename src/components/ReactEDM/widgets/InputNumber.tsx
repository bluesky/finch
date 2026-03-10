import { cn } from "@/lib/utils";
import { CSSProperties, useState, useEffect, useRef } from "react";
import styles from "../styles.json";
import { useVariant } from "../context/VariantContext";

type InputNumberProps = {
  label?: string;
  onSubmit?: (value: number) => void;
  isDisabled?: boolean;
  precision?: number | null;
  style?: CSSProperties;
  val?: number | string | boolean;
};

export default function InputNumber({
  label = "",
  onSubmit = (input) => {
    console.log("submit " + input);
  },
  isDisabled = false,
  precision,
  style,
  val,
}: InputNumberProps) {
  const { variant } = useVariant();

  const [inputValue, setInputValue] = useState<string>("");
  const [originalValue, setOriginalValue] = useState<string>(""); // Track original value
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof val === "number") {
      const formattedValue =
        precision === null
          ? Math.round(val).toString()
          : val.toFixed(precision);
      setInputValue(formattedValue);
      setOriginalValue(formattedValue); // Update original value when val changes
    } else {
      setInputValue("");
      setOriginalValue("");
    }
  }, [val, precision]);

  if (typeof val !== "number") {
    return null;
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setOriginalValue(inputValue); // Store the value when focus starts
    e.target.select();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (precision === null) {
      // Only allow integers (whole numbers)
      if (/^$|^[0-9]*$/.test(newValue)) {
        setInputValue(newValue);
      }
    } else {
      // Allow decimals for float input
      if (/^$|^[0-9]*\.?[0-9]*$/.test(newValue)) {
        setInputValue(newValue);
      }
    }
  };

  const formatValue = () => {
    if (inputValue === "") {
      setInputValue("");
      return;
    }

    const num = parseFloat(inputValue);
    if (!isNaN(num)) {
      if (precision === null) {
        // Round to nearest integer
        const rounded = Math.round(num);
        setInputValue(rounded.toString());
      } else {
        // Format to specified precision
        setInputValue(num.toFixed(precision));
      }
    } else {
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      formatValue();
      const num = parseFloat(inputValue);
      if (!isNaN(num)) {
        if (precision === null) {
          onSubmit(Math.round(num));
        } else {
          onSubmit(parseFloat(num.toFixed(precision)));
        }
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      // Restore original value
      setInputValue(originalValue);
      // Delay the blur to allow state update to complete
      setTimeout(() => {
        inputRef.current?.blur();
      }, 0);
    }
  };

  return (
    <input
      ref={inputRef}
      disabled={isDisabled}
      type="text"
      value={inputValue}
      className={cn(
        `
                        ${isDisabled ? "hover:cursor-not-allowed" : ""} 
                        w-1/2 pl-1`,
        styles.variants[variant as keyof typeof styles.variants].input_num
      )}
      onChange={handleChange}
      onKeyDown={handleKeyPress}
      onBlur={formatValue}
      onFocus={handleFocus}
      style={style}
    />
  );
}
