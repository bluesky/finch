type AddQueueItemButtonProps = {
    cb: () => void;
    text: string;
    styles?: string;
    isButtonEnabled?: boolean;
};
export default function AddQueueItemButton({
    cb,
    text,
    styles = '',
    isButtonEnabled = true,
}: AddQueueItemButtonProps) {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        cb();
    };
    return (
        <button
            className={`${isButtonEnabled ? 'bg-sky-500 hover:bg-sky-600 hover:cursor-pointer' : 'bg-slate-500 hover:cursor-not-allowed'} rounded-md text-white px-2 py-1 font-medium w-fit ${styles}`}
            onClick={handleClick}
        >
            {text}
        </button>
    );
}
