import { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import CSICanvas from "./CSICanvas";
import { useUIData } from "./utils/useUIData";
import ScalableContainer from "./ScalableContainer";
import { useTabManagement } from "../Tabs/context/TabsContext";
import { useMock } from "./MockContext"; 
import styles from "./styles.json"; 

export type CSIViewProps = {
  className?: string;
  fileName: string;
  scale?: number; // Add scale prop
  onScaleChange?: (scale: number) => void; // Add callback for scale changes
  [key: string]: any;
};

export default function CSIView({
  className,
  fileName,
  scale = 0.85, // Default scale
  onScaleChange,
  ...args
}: CSIViewProps) {
  const { mock } = useMock();
  const [currentScale, setCurrentScale] = useState(scale);
  const { addTab } = useTabManagement();

  // Update local scale when prop changes
  useEffect(() => {
    setCurrentScale(scale);
  }, [scale]);

  const { UIData, loading, error, devices, onSubmitSettings } = useUIData({
    fileName,
    args,
    mock
  });

  const handleScaleChange = useCallback((newScale: number) => {
    setCurrentScale(newScale);
    onScaleChange?.(newScale); // Notify parent of scale change
  }, [onScaleChange]);

  const addTabWithScale = useCallback((
    label: string,
    content: React.ReactNode,
    fileName: string,
    args: Record<string, any>
  ) => {
    addTab(label, content, fileName, args, currentScale);
  }, [addTab, currentScale]);

  if (loading) {
    return (
      <div className={cn("inline-block rounded-xl bg-slate-100 p-4 mt-4", className)}>
        <div className="text-blue-500">Loading {fileName}...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("inline-block rounded-xl bg-slate-100 p-4 mt-4", className)}>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!UIData) {
    return (
      <div className={cn("inline-block rounded-xl bg-slate-100 p-4 mt-4", className)}>
        <div className="text-white">No data available</div>
      </div>
    );
  }

  return (
    <ScalableContainer 
      className={cn("inline-block rounded-xl bg-slate-100 p-4 mt-4", className, styles.variants.default.display)}
      initialScale={currentScale}
      minScale={0.3}
      maxScale={3.0}
      onScaleReset={0.85}
      sensitivity={200}
      onScaleChange={handleScaleChange}
    >
      <CSICanvas
        UIData={UIData}
        devices={devices}
        onSubmit={onSubmitSettings}
        addTab={addTabWithScale}
        {...args}
      />
    </ScalableContainer>
  );
}