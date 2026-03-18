import { tailwindIcons } from "../../assets/icons";
import QSParameterInput from "./QSParameterInput";
import AddQueueItemButton from "./AddQueueItemButton";
import SubmissionResultPopup from "./SubmissionResultPopup";
import QItem from "./QItem";
import { Tooltip } from "react-tooltip";
import { useQSAddItem } from "./hooks/useQSAddItem";

import { CopiedPlan } from "./types/types";
import { WidgetStyleProps } from "./Widget";

const positionTooltipMessage = 'The position for the plan to be inserted at. \n Type = String or Integer. \n Default = "back" for the back of the Queue. \n Use "front" to insert at the front of the Queue. \n Integer values may be used, where 0 represents the front of the Queue.'

type QsAddItemProps = WidgetStyleProps & {
    copiedPlan?: CopiedPlan | null;
    isGlobalMetadataChecked?: boolean;
    globalMetadata?: {[key: string]: any};
};

export default function QSAddItem({
    copiedPlan = null, 
    isGlobalMetadataChecked = false, 
    globalMetadata = {}
}: QsAddItemProps) {
    
    const {
        isSubmissionPopupOpen,
        submissionResponse,
        allowedPlans,
        allowedDevices,
        activePlan,
        parameters,
        body,
        positionInput,
        resetInputsTrigger,
        setActivePlan,
        setParameters,
        handlePlanSelect,
        submitPlan,
        executePlan,
        closeSubmissionPopup,
        handleParameterRefreshClick,
        handlePositionInputChange,
        updateBodyKwargs,
        checkRequiredParameters,
    } = useQSAddItem({ copiedPlan, isGlobalMetadataChecked, globalMetadata });

    // Icons
    const arrowRefresh = tailwindIcons.arrowRefresh;
    const arrowLongLeft = tailwindIcons.arrowLongLeft;

    return (
        <form className={`w-full h-full flex transition-all duration-1000 ease-in relative`}>
            {/* Popup after submit button clicked */}
            {isSubmissionPopupOpen ? <SubmissionResultPopup response={submissionResponse} cb={closeSubmissionPopup}/> : ''}

        {/* Main Form */}
            {/* Plan */}
            <div className={`${activePlan ? 'w-2/12 border-r-2' : 'w-full border-none'} border-slate-300 flex flex-col`}>
                <div className="bg-gray-200 h-10 text-center flex justify-between items-center flex-shrink-0">
                    <h1 className="pl-3">PLAN</h1>
                    <div className={`${activePlan ? 'opacity-100 hover:cursor-pointer hover:text-slate-600' : 'opacity-0'} pr-2`} onClick={() => setActivePlan(null)}>{arrowLongLeft}</div>
                </div>
                <ul className={`${activePlan ? '' : ''} flex-grow duration-[1100ms] overflow-auto overflow-y-auto transition-all ease-in relative`}>
                    {!activePlan && <div className="absolute top-0 left-0 w-2/12 h-full border-r border-slate-300 pointer-events-none"></div>}
                    {Object.keys(allowedPlans).map((plan) => {
                        return (
                            <li key={plan} 
                                className={`${activePlan === plan ? 'bg-indigo-200' : ''} hover:cursor-pointer group leading-tight flex`} 
                                onClick={() => handlePlanSelect(plan)}>
                                    <p className={`${activePlan ? 'w-full': 'w-2/12 '} group-hover:bg-indigo-300 px-2 py-1`}>{plan.replaceAll('_', ' ')}</p>
                                    <p className={`${activePlan ? 'hidden w-0' : 'w-10/12 pl-4 group-hover:bg-indigo-50'} py-1`}>{allowedPlans[plan].description}</p>
                            </li>
                        )
                    })}
                </ul>
            </div>
            {/* Parameters Column*/}
            <div className={`${activePlan ? 'w-5/12 border-r-2' : 'w-0 hidden border-none'} border-slate-300 h-full flex flex-col`}>
                <div className="bg-gray-200 h-10 text-center flex justify-around items-center flex-shrink-0">
                    <h1>PARAMETERS</h1>
                    <div className="hover:cursor-pointer hover:text-slate-600" onClick={() => handleParameterRefreshClick(activePlan)}>{arrowRefresh}</div>
                </div>
                {/* Parameter Inputs */}
                <div className="flex flex-wrap content-start justify-center space-x-2 space-y-4 py-4 px-2 flex-grow overflow-auto overflow-y-auto">
                    {activePlan ? <h3>{activePlan}: {allowedPlans[activePlan].description}</h3> : ''}
                    {parameters && Object.keys(parameters).map((param) => 
                        <QSParameterInput 
                            key={param} 
                            param={parameters[param]} 
                            parameter={parameters[param]}
                            parameters={parameters} 
                            parameterName={parameters[param].name}
                            updateBodyKwargs={updateBodyKwargs} 
                            setParameters={setParameters} 
                            allowedDevices={allowedDevices} 
                            resetInputsTrigger={resetInputsTrigger} 
                            copiedPlan={copiedPlan} 
                            isGlobalMetadataChecked={isGlobalMetadataChecked}
                            globalMetadata={globalMetadata} />)}
                </div>
            </div>
            {/* Summary Column */}
            <div className={`${activePlan ? 'w-3/12 border-r-2' : 'w-0 hidden border-none'} border-slate-300 h-full flex flex-col`}>
                <div className="bg-gray-200 h-10 flex justify-center items-center shrink-0">
                    <h1 className="text-center">SUMMARY</h1>
                </div>
                <div className="flex items-start justify-start 3xl:justify-center py-4 px-2 flex-grow w-full overflow-auto">
                    <pre className="text-sm">{JSON.stringify(body, null, 2)}</pre>
                </div>
            </div>
            {/* Submit Column */}
            <div className={`${activePlan ? 'w-2/12 border-r-2' : 'w-0 hidden border-none'} border-slate-300 flex flex-col`}>
                <div className="bg-gray-200 h-10 text-center flex justify-center items-center flex-shrink-0">
                    <h1 className="">SUBMIT</h1>
                </div>
                <div className="flex flex-col space-y-4 items-center py-4 flex-grow overflow-auto">
                    <QItem type='blank' item={body.item} text={body.item.name} styles={'hover:cursor-default hover:shadow-none'}/>
                    <label id="positionLabel" className="flex justify-center w-fit items-center">
                        Position: 
                        <input 
                            className="w-12 border border-slate-200 rounded-sm bg-slate-50 text-center ml-2"
                            value={positionInput}
                            onChange={e => handlePositionInputChange(e.target.value)}
                        />
                    </label>
                    <Tooltip anchorSelect={'#positionLabel'} children={<p className="whitespace-pre-wrap">{positionTooltipMessage}</p>} offset={25} place="top" variant="info" style={{'maxWidth' : "500px", 'height': 'fit-content'}} delayShow={400}/>
                    <AddQueueItemButton text={'Add To Queue'} isButtonEnabled={checkRequiredParameters()} styles={'drop-shadow-md'} cb={() => submitPlan(body)}/>
                    <span className="flex w-4/5 items-center">
                        <div className="h-1 border-b border-slate-300 w-2/5"></div>
                        <p className="text-slate-300 w-1/5 text-center">or</p>
                        <div className="h-1 border-b border-slate-300 w-2/5"></div>
                    </span>
                    <AddQueueItemButton text={'Execute Now'} isButtonEnabled={checkRequiredParameters()} styles={'drop-shadow-md'} cb={() => executePlan(body)}/>
                </div>
            </div>
        </form>
    )
}