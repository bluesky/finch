type ToggleSliderProps = {
    isToggleOn: boolean;
    handleToggleClick: () => void;
};
export default function ToggleSlider({ isToggleOn, handleToggleClick }: ToggleSliderProps) {
    return (
        <div className="flex flex-grow text-right flex-col items-center space-y-2 absolute right-2">
            <p
                className={`${isToggleOn ? 'text-green-600' : 'text-gray-500'} transition-colors duration-500`}
            >
                ON
            </p>
            <button
                onClick={handleToggleClick}
                className={`w-6 h-16 flex items-center justify-center bg-gray-400 rounded-full cursor-pointer ${
                    isToggleOn ? 'bg-green-600' : 'bg-gray-300'
                }`}
            >
                <div
                    className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                        isToggleOn ? 'translate-y-[-1rem]' : 'translate-y-4'
                    }`}
                ></div>
            </button>
            <p
                className={`${isToggleOn ? 'text-gray-500' : 'text-grey-600'} transition-colors duration-500`}
            >
                OFF
            </p>
        </div>
    );
}
