import { useState, Fragment } from "react";

import { PopupItem, HistoryResultRow } from "./types/types";

import DeleteResultPopup from "./DeleteResultPopup";
import ConfirmDeleteItemPopup from "./ConfirmDeleteItemPopup";
import Button from "../Button";
import { getPlanColor, getPlanColorOpacity } from "./utils/qItemColorData";
import { tailwindIcons } from "../../assets/icons";
import { Tooltip } from 'react-tooltip';
import { deleteQueueItem } from "./utils/apiClient";
import { PostItemRemoveResponse } from "./types/apiTypes";

import dayjs from "dayjs";


type QItemPopupProps = {
    popupItem: PopupItem;
    handleQItemPopupClose: () => void;
    isItemDeleteButtonVisible?: boolean;
    handleCopyItemClick: (name: string, kwargs: { [key: string]: any }) => void;
}
export default function QItemPopup( {popupItem, handleQItemPopupClose=()=>{}, isItemDeleteButtonVisible=true, handleCopyItemClick=()=>{} }: QItemPopupProps) {
    const [isDeleteModeVisible, setIsDeleteModeVisibile] = useState(false);
    const [areResultsVisible, setAreResultsVisible] = useState(false);
    const [response, setResponse] = useState<PostItemRemoveResponse | null>(null);
    const [isTracebackCopied, setIsTracebackCopied] = useState(false);

    //check if item is in the current queue or the history
    const isHistory = 'result' in popupItem;

    //Color settings for delete mode
    const deleteBg = 'bg-slate-300';
    const deleteBorder = 'border-slate-300';
    const deleteText = 'text-slate-400';

    const handleDeleteResponse = (data: any) => {
        setAreResultsVisible(true);
        setResponse(data);
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
        if (kwargs) {
            handleCopyItemClick(name, kwargs);
        } else {
            handleCopyItemClick(name, {}); //we only copy kwargs, not args (positional arguments). Users need to be using kwargs for their plans...
        }
        handleQItemPopupClose();
    }

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
                    {popupItem.kwargs[kwarg].map((item) => <p key={item} className={`${isDeleteModeVisible ? deleteBg : 'bg-sky-100'} mr-2 px-1 mb-2 rounded-sm`}>{item}</p>)}
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
            icon: tailwindIcons.adjustmentsVertical,
            content: popupItem.kwargs &&
                <Fragment>
                    {popupItem.kwargs && Object.keys(popupItem.kwargs).map((kwarg) => printParameter(kwarg))}
                    <div className="flex justify-center py-4"><Button text='Copy Plan' cb={()=> handleCopyClick(popupItem.name, popupItem.kwargs)} styles={`m-auto ${isDeleteModeVisible ? 'opacity-0' : ''}`}/></div>
                </Fragment>
        },
        {
            name:'UID',
            icon: tailwindIcons.fingerprint,
            content: popupItem.item_uid,
        },
        {
            name:'User',
            icon: tailwindIcons.user,
            content: popupItem.user,
        },
        {
            name:'User_Group',
            icon: tailwindIcons.users,
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

    type RowProps = {
        name: string;
        icon: JSX.Element;
        content: JSX.Element | undefined | string;
    }
    const Row = ({name, icon, content}: RowProps) => {
        if (name === 'Parameters') {
            return (
                <div key={name} className="flex pt-4">
                    <div className="w-1/6"> 
                        <div id={name+'Tooltip'} className="w-10 text-slate-400 m-auto">{icon}</div>
                        <Tooltip anchorSelect={'#' + name + 'Tooltip'} content={name} place="left" variant="info"/>
                    </div>
                    <div className={`w-4/6 rounded-md border px-2 pt-2 ${isDeleteModeVisible ? deleteBg + ' ' + deleteBorder : 'bg-white'}`}>
                        {content}
                    </div>
                    <div className="w-1/6"></div>
                </div>
            )
        }
        return(
            <div key={name} className={`${name === 'Message' || name === 'Traceback' ? 'items-start' : 'items-center'} flex`}>
                <div className="w-1/6"> 
                    <div id={name+'Tooltip'} className="w-10 text-slate-400 m-auto">{icon}</div>
                    <Tooltip anchorSelect={'#' + name + 'Tooltip'} content={name.replace('_', ' ')} place="left" variant="info"/>
                </div>
                <div className={`${name === 'Traceback' ? 'w-5/6 bg-white p-2 mr-2 rounded-md border border-slate-200' : 'w-4/6'}`}>
                    {content}
                </div>
                {name==='Traceback' ? '' : <div className="w-1/6"></div> }
            </div>
        )
    };



        return (
            <div  onClick={handleQItemPopupClose} className={`absolute top-0 left-0 w-full h-full z-40 rounded-md ${getPlanColorOpacity(popupItem.name)} flex justify-center items-center ${isDeleteModeVisible ? 'bg-red-600/40' : ''}`}>
                <div  onClick={(e)=> e.stopPropagation()} className={`z-50 relative  ${isHistory ? 'w-[90%] h-[70%] max-w-6xl max-h-[80rem]' : 'w-[75%]  h-[50%] min-h-[40rem] max-w-[40rem] max-h-[60rem]'} rounded-lg ${isDeleteModeVisible ? deleteBg : 'bg-slate-50'}`}>
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
                                            <Row name={item.name} icon={item.icon} content={item.content} key={item.name}/>
                                        :
                                            ''
                                    )
                                })}
                            </section> 
                        ) : ( 
                            ''
                        )}
                        <section  className={`${isHistory ? 'w-2/5' : 'w-full'} h-full overflow-auto flex flex-col space-y-4 py-2`}>
                            <h2 className="text-center text-xl font-semibold">Plan Information</h2>
                            {settings.map((row) => <Row key={row.name} name={row.name} icon={row.icon} content={row.content} />)}
                            <div  className={`${isItemDeleteButtonVisible ? '' : 'hidden'} flex justify-center `}>
                                <span className={` ${isDeleteModeVisible ? 'hidden' : ''} hover:cursor-pointer w-12 h-12 hover:text-red-500`} onClick={handleFirstDeleteClick}>{tailwindIcons.trash}</span>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        );
};
