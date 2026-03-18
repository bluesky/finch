import ExperimentAngleScan from "@/components/Experiment/ExperimentAngleScan";
export default function AngleScanPage() {
    return (
        <div className="flex flex-col p-4 space-y-6">
            <div className="min-w-96">
                <ExperimentAngleScan 
                    onSuccess={(response) => {
                        console.log("Angle scan started", response);
                    }}
                    onError={(error) => {
                        console.error("Angle scan failed:", error);
                    }}
                />
            </div>
        </div>
    );
}