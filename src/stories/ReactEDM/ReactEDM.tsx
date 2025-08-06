import ReactEDMs from "@/components/ReactEDM/ReactEDM";
export type ReactEDMProps = {
  className?: string;
  fileName?: string;
  P?: string;
  R?: string;
  variant?: string;
};

export default function ReactEDM({
  fileName,
  P,
  R,
  variant = "default"
}: ReactEDMProps) {
  return (
    <div className="bg-[rgb(12,74,110)]">
         <ReactEDMs fileName={fileName} P={P} R={R} variant={variant} mock/>
    </div>
  );
}
