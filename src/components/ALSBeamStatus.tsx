const ALSBeamStatus = () => {
    return (
        <div className="flex items-center justify-center bg-stone-400/50 p-4 px-8 w-fit m-auto rounded-sm shadow-lg">
            <iframe
                src="https://controls.als.lbl.gov/als-beamstatus/site/alsstatus_alsweb"
                title="ALS Beam Status"
                width="755"
                height="635"
            />
            </div>
    );
};
export default ALSBeamStatus;