import IFrame from "@/components/IFrame";

export default function ServiceStatusPage() {
    return (
        <div className="flex justify-start items-start h-full w-full flex-wrap gap-8">
            <IFrame url="https://controls.als.lbl.gov/als-beamstatus/site/alsstatus_alsweb" width={755} height={635}/>
            <IFrame url="http://localhost:7681/" isSizeResponsive={true}/>
        </div>
    )
}