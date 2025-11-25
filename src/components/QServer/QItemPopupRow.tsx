import { Tooltip } from 'react-tooltip';

export type RowProps = {
    name: string;
    icon: JSX.Element;
    content: JSX.Element | undefined | string;
    hideBackground?: boolean;
}

export default function QItemPopupRow({name, icon, content, hideBackground}: RowProps) {
    if (name === 'Parameters') {
        return (
            <div key={name} className="flex pt-4">
                <div className="w-1/6"> 
                    <div id={name+'Tooltip'} className="w-10 text-slate-400 m-auto">{icon}</div>
                    <Tooltip anchorSelect={'#' + name + 'Tooltip'} content={name} place="left" variant="info"/>
                </div>
                <div className={`w-4/6 rounded-md border px-2 pt-2 ${hideBackground ? 'bg-slate-300 border-slate-300' : 'bg-white'}`}>
                    {content}
                </div>
                <div className="w-1/6"></div>
            </div>
        )
    }
    return(
        <div key={name} className={`${name === 'Message' || name === 'Traceback' || name === 'Status' ? 'items-start' : 'items-center'} flex`}>
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
}