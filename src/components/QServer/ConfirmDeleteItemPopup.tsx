import { tailwindIcons } from '../../assets/icons';
import Button from '../Button';
export default function ConfirmDeleteItemPopup({
    handleDelete = () => {},
    handleCancel = () => {},
}) {
    return (
        <div
            className={` absolute z-20 top-0 h-full w-full bg-slate-100/60 flex items-center justify-center rounded-lg`}
        >
            <div className="bg-white/40 z-30 rounded-lg shadow-lg w-full h-full flex flex-col items-center justify-end space-y-3 text-slate-500 pb-8">
                <div className={`text-yellow-600 h-20 w-20`}>
                    {tailwindIcons.exclamationTriangle}
                </div>
                <p className="text-lg font-bold text-black">Remove this item from the Queue?</p>
                <div className="flex items-center justify-center space-x-8">
                    <Button
                        text="Cancel"
                        cb={handleCancel}
                        className="bg-white over:bg-slate-200 text-black border border-slate-400"
                    />
                    <Button
                        text="Delete"
                        cb={handleDelete}
                        className="bg-red-600 hover:bg-red-400"
                    />
                </div>
            </div>
        </div>
    );
}
