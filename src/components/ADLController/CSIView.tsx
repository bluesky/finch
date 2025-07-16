import { cn } from "@/lib/utils";
import CSICanvas from "./CSICanvas";
import { useUIData } from "./utils/useUIData";

export type CSIViewProps = {
  className?: string;
  fileName: string;
  [key: string]: any;
};

export default function CSIView({
  className,
  fileName,
  ...args
}: CSIViewProps) {
  // UIData is Entry[] (aka from the ADL/bob file), devices are the devices from the WS
  const { UIData, loading, error, devices, onSubmitSettings } = useUIData({
    fileName,
    args
  });
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
    <div className={cn("inline-block rounded-xl bg-slate-100 p-4 mt-4", className)}>
      <CSICanvas
        UIData={UIData}
        devices={devices}
        onSubmit={onSubmitSettings}
        {...args}
      />
    </div>
  );
}