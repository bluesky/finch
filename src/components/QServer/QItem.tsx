import { tailwindIcons } from '../../assets/icons';
import { getPlanColor } from './utils/qItemColorData';
import { BaseQueueItem, QueueItem, HistoryItem, RunningQueueItem } from '@/api/qServer/types';
import { ParameterInput } from './types/types';

type QItemProps = {
    item: BaseQueueItem | QueueItem | HistoryItem | RunningQueueItem | null;
    label?: string;
    text?: string;
    styles?: string;
    handleClick?: () => void;
    type: 'history' | 'current' | 'blank';
};
export default function QItem({
    item = null,
    label = '',
    text = '',
    styles = '',
    handleClick = () => {},
    type = 'current',
}: QItemProps) {
    const commonStyles =
        'w-32 rounded-md mx-2  hover:shadow-lg hover:shadow-gray-500 list-none overflow-auto';

    if (!item) {
        if (type === 'blank') {
            return (
                <div className="flex flex-col items-center pb-2">
                    <li
                        className={`${commonStyles} hover:shadow-none h-16 border border-dashed border-slate-500 min-w-32 bg-slate-400 ${styles}`}
                    >
                        <p className="text-center text-slate-400">{text}</p>
                    </li>
                </div>
            );
        }
    }

    const displayKwarg = (value: unknown | [] | string | ParameterInput) => {
        //value may be an Array, String, or Object
        if (Array.isArray(value)) {
            return value.toString().replaceAll(',', ', ');
        } else if (typeof value === 'string') {
            return value;
        } else {
            return JSON.stringify(value);
        }
    };

    //todo: refactor this to remove the redundant jsx, create components for the md text, kwarg text, and item body
    if (item !== null && Object.keys(item).length > 0) {
        if (type === 'history') {
            //Queue History
            const historyItem = item as HistoryItem;
            const failed = historyItem.result.exit_status === 'failed';
            return (
                <div
                    className={`${failed ? 'mt-12' : 'mt-6'} flex flex-col items-center relative h-20`}
                >
                    {failed ? (
                        <div className="text-red-500 absolute left-1/2 transform -translate-x-1/2 -translate-y-full aspect-square h-6">
                            {tailwindIcons.exclamationTriangle}
                        </div>
                    ) : (
                        ''
                    )}
                    <li
                        className={`${commonStyles} hover:cursor-pointer border ${historyItem.result.exit_status === 'failed' ? 'border-red-600 border-2' : 'border-slate-500'}  bg-slate-100 overflow-clip rounded-t-md h-16 ${styles}`}
                        onClick={handleClick}
                    >
                        <span
                            className={`${getPlanColor(item.name)} flex items-center justify-around rounded-t-md opacity-80 overflow-x-hidden`}
                        >
                            <p className={` text-white text-center `}>{historyItem.name}</p>
                        </span>

                        <div className="text-xs ml-2 flex-grow overflow-hidden">
                            {historyItem?.kwargs?.md ? (
                                <>
                                    {Object.entries(historyItem.kwargs.md).map(([key, value]) => {
                                        return (
                                            <div className="flex flex-wrap" key={key}>
                                                <p>{key}</p>
                                                <p>:</p>
                                                <p>{String(value)}</p>
                                            </div>
                                        );
                                    })}
                                    {Object.entries(historyItem.kwargs).map(([kwarg, value]) => {
                                        return (
                                            <div className="flex flex-wrap" key={kwarg}>
                                                <p className="text-black">{kwarg} </p>
                                                <p>:</p>
                                                <p className="ml-2 text-wrap text-clip">
                                                    {displayKwarg(value)}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </>
                            ) : item?.kwargs ? (
                                Object.entries(item.kwargs).map(([kwarg, value]) => {
                                    return (
                                        <div className="flex flex-wrap" key={kwarg}>
                                            <p className="text-black">{kwarg} </p>
                                            <p>:</p>
                                            <p className="ml-2 text-wrap text-clip">
                                                {displayKwarg(value)}
                                            </p>
                                        </div>
                                    );
                                })
                            ) : (
                                ''
                            )}
                        </div>
                    </li>
                    <p className="text-slate-700 font-bold text-xs mt-1">{label}</p>
                </div>
            );
        } else {
            //Current Queue Item
            const currentItem = item as QueueItem;
            return (
                <div className="flex flex-col items-center rounded-t-md h-20">
                    <li
                        className={`${commonStyles} hover:cursor-pointer h-16 border border-slate-500 bg-white overflow-clip rounded-t-md ${styles}`}
                        onClick={handleClick}
                    >
                        <p
                            className={`${getPlanColor(currentItem.name)} text-white text-center rounded-t-md overflow-hidden`}
                        >
                            {currentItem.name}
                        </p>
                        <div className="text-xs ml-2 flex-grow overflow-hidden">
                            {currentItem?.kwargs?.md ? (
                                <>
                                    {Object.entries(currentItem.kwargs.md).map(([key, value]) => {
                                        return (
                                            <div className="flex flex-wrap" key={key}>
                                                <p>{key}</p>
                                                <p>:</p>
                                                <p>{String(value)}</p>
                                            </div>
                                        );
                                    })}
                                    {Object.entries(currentItem.kwargs).map(([kwarg, value]) => {
                                        return (
                                            <div className="flex flex-wrap" key={kwarg}>
                                                <p className="text-black">{kwarg} </p>
                                                <p>:</p>
                                                <p className="ml-2 text-wrap text-clip">
                                                    {displayKwarg(value)}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </>
                            ) : currentItem?.kwargs ? (
                                Object.entries(currentItem.kwargs).map(([kwarg, value]) => {
                                    return (
                                        <div className="flex flex-wrap" key={kwarg}>
                                            <p className="text-black">{kwarg} </p>
                                            <p>:</p>
                                            <p className="ml-2 text-wrap text-clip">
                                                {displayKwarg(value)}
                                            </p>
                                        </div>
                                    );
                                })
                            ) : (
                                <p>0 kwargs</p>
                            )}
                        </div>
                    </li>
                    <p className="text-slate-600 font-bold text-xs">{label}</p>
                </div>
            );
        }
    }
}
