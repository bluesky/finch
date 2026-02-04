import { useState, Fragment, useEffect } from "react";
import { useStatusQuery } from './hooks/useQServerQueries';
import QItemPopupRow from './QItemPopupRow';

import { PopupItem, HistoryResultRow } from "./types/types";

import DeleteResultPopup from "./DeleteResultPopup";
import ConfirmDeleteItemPopup from "./ConfirmDeleteItemPopup";
import Button from "../Button";
import ButtonWithIcon from "../ButtonWithIcon";
import { getPlanColor, getPlanColorOpacity } from "./utils/qItemColorData";
import { tailwindIcons } from "../../assets/icons";
import { Pulse, Faders, Fingerprint, User, UsersThree, Pause, PlayPause, Trash } from "@phosphor-icons/react";
import { Tooltip } from 'react-tooltip';
import { deleteQueueItem, pauseRE, resumeRE, abortRE } from "./utils/apiClient";
import { GetRunsActiveResponse, GetStatusResponse, PostItemRemoveResponse } from "./types/apiTypes";

import dayjs from "dayjs";


type QItemPopupProps = {
    popupItem: PopupItem;
    handleQItemPopupClose: () => void;
    isItemDeleteButtonVisible?: boolean;
    handleCopyItemClick?: (name: string, kwargs: { [key: string]: any }) => void;
    isItemRunning?: boolean;
}
export default function QItemPopup( {popupItem, handleQItemPopupClose=()=>{}, isItemDeleteButtonVisible=true, handleCopyItemClick, isItemRunning }: QItemPopupProps) {
    const [isDeleteModeVisible, setIsDeleteModeVisibile] = useState(false);
    const [areResultsVisible, setAreResultsVisible] = useState(false);
    const [response, setResponse] = useState<PostItemRemoveResponse | null>(null);
    const [isTracebackCopied, setIsTracebackCopied] = useState(false);
    const [runsActiveResponse, setRunsActiveResponse] = useState<GetRunsActiveResponse| null>(null);
    const [apiStatusResponse, setApiStatusResponse] = useState<GetStatusResponse | null>(null);

    // Use the centralized status query from our query hooks
    const { data: statusData, isLoading: statusLoading, error: statusError } = useStatusQuery();

    // Update state when statusData changes
    useEffect(() => {
        if (statusData) {
            setApiStatusResponse(statusData);
        }
    }, [statusData]);

    //check if item is in the current queue or the history
    const isHistory = 'result' in popupItem;


    const handleDeleteResponse = (data: any) => {
        setAreResultsVisible(true);
        setResponse(data);
        if (data?.success === true) {
            //close the popup after 2 seconds
            setTimeout(() => {
                handleQItemPopupClose();
            }, 2000);
        }
    };

    const handleCloseResults = () => {
        setIsDeleteModeVisibile(false);
        setAreResultsVisible(false);
        handleQItemPopupClose();
    };

    const handleFirstDeleteClick = () => {
        //display set of buttons to delete, grey out background
        setIsDeleteModeVisibile(true);
    };

    
    const handleCancelDeleteClick = () => {
        //remove buttons from ui, revert to original background color
        setIsDeleteModeVisibile(false);
    }
        
    const handleConfirmDeleteClick = () => {
        setIsDeleteModeVisibile(false); //close the delete mode popup
        const body = {uid: popupItem.item_uid};
        deleteQueueItem(body, handleDeleteResponse); //send POST, show results popup
    };

    const handleCopyTracebackClick = () => {
        (popupItem.result && popupItem.result.traceback) &&
        navigator.clipboard.writeText(popupItem.result.traceback)
            .then(() => {
                setIsTracebackCopied(true);
            })
            .catch((err) => {
                console.error('Failed to copy traceback: ', err);
            });
    };

    const handleCopyClick = (name:string, kwargs: { [key: string]: any } | undefined) => {
        //close the popup after the item is copied so user can immediately see the plan below the popup
        if (!handleCopyItemClick) return;
        if (kwargs) {
            handleCopyItemClick(name, kwargs);
        } else {
            handleCopyItemClick(name, {}); //we only copy kwargs, not args (positional arguments). Users need to be using kwargs for their plans...
        }
        handleQItemPopupClose();
    }

    const handleAbortClick = async () => {
        const success = await abortRE();
        if (success) {
            handleQItemPopupClose();
        }
    };

    const displayKwarg = (value: [] | string) => {
        //value may be an Array, String, or Object
        if (Array.isArray(value)) {
            return value.toString().replaceAll(',', ', ');
        } else if (typeof value === 'string') {
            return value;
        } else {
            return JSON.stringify(value);
        }
    };


    //to do - revise this for a single return with conditional rendering onthe div / p tag for content
    const printParameter = (kwarg:string) => {
        if (popupItem.kwargs === undefined) return;
        if (Array.isArray(popupItem.kwargs[kwarg])) {
            return (
            <span className="flex" key={kwarg}>
                <p className="w-1/2">{kwarg}</p>
                <div className= "w-1/2 flex flex-wrap justify-start">
                    {popupItem.kwargs[kwarg].map((item) => <p key={item} className={`${isDeleteModeVisible ? 'bg-slate-300' : 'bg-sky-100'} mr-2 px-1 mb-2 rounded-sm`}>{item}</p>)}
                </div>
            </span>
            )
        } else if (typeof popupItem.kwargs[kwarg] === 'string') {
            return (
                <span className="flex" key={kwarg}>
                    <p className="w-1/2">{kwarg}</p>
                    <p className="w-1/2">{popupItem.kwargs[kwarg]}</p>
                </span>
            )
        } else {
            return (
                <span className="flex" key={kwarg}>
                    <p className="w-1/2">{kwarg}</p>
                    <p className="w-1/2">{JSON.stringify(popupItem.kwargs[kwarg])}</p>
                </span>
            )
        }
    };

    const settings = [
        {
            name:'Parameters',
            icon: <Faders size={36}/>,
            content: popupItem.kwargs &&
                <Fragment>
                    {popupItem.kwargs && Object.keys(popupItem.kwargs).map((kwarg) => printParameter(kwarg))}
                    {handleCopyClick && <div className="flex justify-center py-4"><Button text='Copy Plan' cb={()=> handleCopyClick(popupItem.name, popupItem.kwargs)} styles={`m-auto ${isDeleteModeVisible ? 'opacity-0' : ''}`}/></div>}
                </Fragment>
        },
        {
            name:'UID',
            icon: <Fingerprint size={36}/>,
            content: popupItem.item_uid,
        },
        {
            name:'User',
            icon: <User size={36}/>,
            content: popupItem.user,
        },
        {
            name:'User_Group',
            icon: <UsersThree size={36}/>,
            content: popupItem.user_group,
        },
    ];

    var results:HistoryResultRow[] = [];
    if (isHistory && popupItem.result) {
        const result = popupItem.result;
        results = [
            {
                name: 'Status',
                icon: result.exit_status === 'failed' ? tailwindIcons.exclamationTriangle : tailwindIcons.checkmarkInCircle,
                content: <p >Status: {popupItem.result.exit_status}</p>
            },
            {
                name: 'Timeline',
                icon: tailwindIcons.clock,
                content:
                    <span>
                        <p>Start: {dayjs(result.time_start * 1000).format('MM/DD hh:mm:ss a')}</p>
                        <p>Finish: {dayjs(result.time_stop * 1000).format('MM/DD hh:mm:ss a')}</p>
                    </span>
            },
            {
                name: 'UIDs',
                icon: tailwindIcons.fingerprint,
                content: 
                    (result.run_uids.length > 0 || result.scan_ids.length > 0) ?
                        <div>
                            <div>{result.run_uids.map((uid) => <p key={uid}>run: {uid}</p>)}</div>
                            <div>{result.scan_ids.map((uid) => <p key={uid}>scan: {uid}</p>)}</div>
                        </div>
                    :
                        null
            },
            {
                name: 'Message',
                icon: tailwindIcons.chatBubbleOvalEllipsisLeft,
                content:
                    (result.msg.length > 0) ?
                        <p className="pt-2">{result.msg}</p>
                    :
                        null
            },
            {
                name: 'Traceback',
                icon: tailwindIcons.commandLine,
                content:
                    (result.traceback.length > 0) ?
                        <article className="h-fit relative" style={{'scrollbarColor': 'grey white'}}>
                            <div 
                                className={`${isTracebackCopied ? 'text-green-500' : 'text-sky-400'} h-10 aspect-square absolute top-0 right-0 hover:text-green-300 hover:cursor-pointer`}
                                onClick={handleCopyTracebackClick}
                            >
                                {isTracebackCopied ? tailwindIcons.clipBoardDocumentCheck : tailwindIcons.clipBoardDocument}
                            </div>
                            <p className="whitespace-pre-wrap pt-6"> {result.traceback}</p>
                        </article>
                    :
                        null
            }
        ];
    }



        return (
            <div  onClick={handleQItemPopupClose} className={`absolute top-0 left-0 w-full h-full z-40 rounded-md ${getPlanColorOpacity(popupItem.name)} flex justify-center items-center ${isDeleteModeVisible ? 'bg-red-600/40' : ''}`}>
                <div  onClick={(e)=> e.stopPropagation()} className={`z-50 relative  ${isHistory ? 'w-[90%] h-[70%] max-w-6xl max-h-[80rem]' : 'w-[75%]  h-[50%] min-h-[40rem] max-w-[40rem] max-h-[60rem]'} rounded-lg ${isDeleteModeVisible ? 'bg-slate-300' : 'bg-slate-50'}`}>
                    {areResultsVisible && <DeleteResultPopup response={response} handleCloseClick={handleCloseResults}/>}
                    {isDeleteModeVisible && <ConfirmDeleteItemPopup handleCancel={handleCancelDeleteClick} handleDelete={handleConfirmDeleteClick} />}
                    <span  className={`${getPlanColor(popupItem.name)} h-[10%] max-h-12 flex items-center justify-between rounded-t-lg ${isDeleteModeVisible ? 'opacity-20' : ''}`}>
                        <div className="h-5/6 aspect-square w-fit text-red-500 ml-4">{popupItem.result && popupItem.result.exit_status === 'failed' ? tailwindIcons.exclamationTriangle : ''}</div>
                        <p className={`text-center text-white text-2xl py-1  `}>{popupItem.name}</p>
                        <div  className='h-4/5 aspect-square hover:cursor-pointer hover:text-slate-200 text-black mr-4' onClick={handleQItemPopupClose}>{tailwindIcons.xCircle}</div>
                    </span>
                    <div  className="h-[90%] flex">
                        {isHistory ? (
                            <section  className="w-3/5 h-full overflow-auto flex flex-col space-y-4 py-2 border-r border-r-slate-200">
                                <h2 className="text-center text-xl font-semibold">Results</h2>
                                {results.map((item) => {
                                    return (
                                        item.content !== null ?
                                            <QItemPopupRow name={item.name} icon={item.icon} content={item.content} key={item.name}/>
                                        :
                                            ''
                                    )
                                })}
                            </section> 
                        ) : ( 
                            ''
                        )}
                        <section  className={`${isHistory ? 'w-2/5' : 'w-full'} h-full overflow-auto flex flex-col space-y-4 py-2`}>
                            {isItemRunning ?
                            <>
                            <div className="flex flex-col pb-12 pt-4">
                                <h2 className="text-center text-xl font-semibold">Active Run Information</h2>
                                <QItemPopupRow 
                                    name="Status" 
                                    icon={<Pulse size={36}/>} 
                                    content={
                                        <>                                           
                                            {statusError ? (
                                                <div className="text-red-600 text-sm">
                                                    Error fetching status: {statusError.message}
                                                </div>
                                            ) : statusData ? (
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Manager State:</span>
                                                        <span className=''>
                                                            {statusData.manager_state}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">RE State:</span>
                                                        <span className=''>
                                                            {statusData.re_state}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Worker Environment:</span>
                                                        <span className=''>
                                                            {statusData.worker_environment_state}
                                                        </span>
                                                    </div>
                                                    {statusData.running_item_uid && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Running Item:</span>
                                                            <span className="">
                                                                {statusData.running_item_uid.slice(0, 8)}...
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-gray-500 text-sm">Loading status...</div>
                                            )
                                            }
                                            <span className="flex justify-start items-center gap-4 mt-4">
                                                <ButtonWithIcon 
                                                    text={apiStatusResponse?.manager_state === "paused" ? "Resume Plan" : "Pause Plan"} 
                                                    icon={apiStatusResponse?.manager_state === "paused" ? <PlayPause size={20}/> : <Pause size={20}/>}
                                                    isSecondary={true}
                                                    styles="bg-white"
                                                    cb={apiStatusResponse?.manager_state === "paused" ? resumeRE : pauseRE}
                                                    disabled={apiStatusResponse?.pause_pending === true}
                                                />
                                                <p>{apiStatusResponse?.pause_pending === true ? "Pause pending..." : ""}</p>

                                                {apiStatusResponse?.manager_state === "paused" ?
                                                    <ButtonWithIcon
                                                        text="Delete Plan"
                                                        icon={<Trash size={20}/>}
                                                        isSecondary={true}
                                                        styles="bg-red-300 hover:bg-red-500"
                                                        cb={handleAbortClick}
                                                    />
                                                        :
                                                        ''
                                                }
                                            </span>
                                        </>
                                    } 
                                    />
                            </div>
                            </>
                            :
                                ''
                            }
                            <h2 className="text-center text-xl font-semibold">Plan Information</h2>
                            {settings.map((row) => <QItemPopupRow key={row.name} name={row.name} icon={row.icon} content={row.content} hideBackground={isDeleteModeVisible}/>)}
                            <div  className={`${isItemDeleteButtonVisible ? '' : 'hidden'} flex justify-center `}>
                                <span className={` ${isDeleteModeVisible ? 'hidden' : ''} hover:cursor-pointer w-12 h-12 hover:text-red-500`} onClick={handleFirstDeleteClick}>{tailwindIcons.trash}</span>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        );
};
