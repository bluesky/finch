import { CSSProperties, useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import styles from "../styles.json";
import { useVariant } from "../context/VariantContext";

type InputTextProps = {
  label?: string;
  onSubmit?: (value: string) => void;
  isDisabled?: boolean;
  style?: CSSProperties;
  val?: string | number | boolean;
};

export default function InputText({
  label = "",
  onSubmit = (input) => {
    console.log("submit " + input);
  },
  isDisabled = false,
  style,
  val = "",
}: InputTextProps) {
  const { variant } = useVariant();
  const stringVal = String(val);
  const [inputValue, setInputValue] = useState<string>(stringVal);
  const [originalValue, setOriginalValue] = useState<string>(""); // Track original value
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const newValue = String(val);
    setInputValue(newValue);
    setOriginalValue(newValue); // Update original value when val changes
  }, [val]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setOriginalValue(inputValue); // Store the value when focus starts
    e.target.select();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSubmit(inputValue);
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

  // Only render if val can be converted to a string (which it always can)
  return (
    <input
      ref={inputRef}
      disabled={isDisabled}
      type="text"
      value={inputValue}
      className={cn(
        `${
          isDisabled ? "hover:cursor-not-allowed" : ""
        } w-1/2 border border-slate-300 pl-1`,
        styles.variants[variant as keyof typeof styles.variants].input_text
      )}
      onChange={handleChange}
      onKeyDown={handleKeyPress}
      onFocus={handleFocus}
      style={style}
    />
  );
}
