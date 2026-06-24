import { Fragment } from 'react';
import { tailwindIcons } from '../../assets/icons';
import Button from '../Button';
import { PostItemRemoveResponse } from '@/api/qServer/types';
type DeleteResultPopupProps = {
    handleCloseClick: () => void;
    response: PostItemRemoveResponse | null;
};
export default function DeleteResultPopup({
    handleCloseClick = () => {},
    response,
}: DeleteResultPopupProps) {
    if (response === null) return;

    const closePopup = () => {
        handleCloseClick();
    };
    const SuccessMessage = () => {
        return (
            <Fragment>
                <p className="text-lg font-semibold text-sky-900">Success</p>
                <p>Deleted item from queue</p>
                <p>UID: {response.item.item_uid}</p>
            </Fragment>
        );
    };
    const FailureMessage = () => {
        return (
            <Fragment>
                <p className="text-lg font-semibold text-sky-900">Delete request failed</p>
                <p className="mx-4 text-black">{response.msg}</p>
            </Fragment>
        );
    };

    return (
        <div
            className={` absolute z-20 top-0 h-full w-full bg-slate-100/90 flex items-center justify-center rounded-lg`}
        >
            <div className="bg-white z-30 rounded-lg shadow-lg w-full h-full flex flex-col items-center justify-center space-y-3 text-slate-500">
                <div
                    className={`${response.success ? 'text-green-600' : 'text-red-600'} h-16 w-16`}
                >
                    {response.success
                        ? tailwindIcons.checkmarkInCircle
                        : tailwindIcons.exclamationTriangle}
                </div>
                {response.success ? <SuccessMessage /> : <FailureMessage />}
                <Button text={'Close'} cb={closePopup} />
            </div>
        </div>
    );
}
