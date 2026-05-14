import { useState, Fragment } from 'react';
import { tailwindIcons } from '../../assets/icons';
import Button from '../Button';
import { PostItemAddResponse, QueueItem } from '@/api/qServer/types';

type SubmissionResultPopupProps = {
    cb: (success: boolean) => void;
    response: PostItemAddResponse;
};
export default function SubmissionResultPopup({
    cb = () => {},
    response,
}: SubmissionResultPopupProps) {
    const [isTextCopied, setIsTextCopied] = useState(false);

    const closePopup = (success = true) => {
        console.log({ success });
        cb(success);
    };

    const handleCopyClick = () => {
        const itemUid = (response.item as QueueItem)?.item_uid;
        if (itemUid) {
            navigator.clipboard
                .writeText(itemUid)
                .then(() => {
                    setIsTextCopied(true);
                })
                .catch((err) => {
                    console.error('Failed to copy: ', err);
                });
        }
    };

    const SuccessMessage = () => {
        return (
            <Fragment>
                <p className="text-lg font-semibold text-sky-900">Success</p>
                <p>
                    {response.item.item_type} type: {response.item.name}
                </p>
                <div className="flex items-center">
                    <p>Item UID: {(response.item as QueueItem)?.item_uid}</p>
                    <div
                        className={`${isTextCopied ? 'text-green-500 hover:text-green-400' : 'hover:text-black'} hover:cursor-pointer w-10 aspect-square pl-1`}
                        onClick={handleCopyClick}
                    >
                        {isTextCopied
                            ? tailwindIcons.clipBoardDocumentCheck
                            : tailwindIcons.clipBoardDocument}
                    </div>
                </div>
            </Fragment>
        );
    };

    const FailureMessage = () => {
        return (
            <Fragment>
                <p className="text-lg font-semibold text-sky-900">Submission Failed</p>
                <p className="mx-4 text-black">{response.msg}</p>
            </Fragment>
        );
    };

    return (
        <div
            onClick={() => closePopup()}
            className={` absolute z-20 top-0 h-full w-full bg-slate-100/90 flex items-center justify-center rounded-b-md`}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white z-30 rounded-lg shadow-lg w-7/12 h-64 flex flex-col items-center justify-center space-y-2 text-slate-500"
            >
                <div
                    className={`${response.success ? 'text-green-600' : 'text-red-600'} h-16 w-16`}
                >
                    {response.success === true
                        ? tailwindIcons.checkmarkInCircle
                        : tailwindIcons.exclamationTriangle}
                </div>
                {response.success ? <SuccessMessage /> : <FailureMessage />}
                <Button
                    text={response.success ? 'Continue' : 'Close'}
                    cb={() => closePopup(response.success)}
                />
            </div>
        </div>
    );
}
