type SelectIntegerProps = {
    value: number;
    min?: number;
    max: number;
    onChange: (value: number) => void;
    label?: string;
    showTotal?: boolean;
    className?: string;
};

export default function SelectInteger({
    value,
    min = 0,
    max,
    onChange,
    label,
    showTotal = true,
    className = '',
}: SelectIntegerProps) {
    const handleDecrement = () => {
        const newValue = Math.max(min, value - 1);
        onChange(newValue);
    };

    const handleIncrement = () => {
        const newValue = Math.min(max, value + 1);
        onChange(newValue);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = parseInt(e.target.value);
        if (!isNaN(inputValue) && inputValue >= min && inputValue <= max) {
            onChange(inputValue);
        }
    };

    return (
        <div className={`flex items-center ${className}`}>
            <div className="flex-1 text-right pr-4">
                {label && <span className="text-sm font-medium text-gray-700">{label}:</span>}
            </div>

            <div className="flex gap-2">
                <button
                    onClick={handleDecrement}
                    disabled={value === min}
                    className="flex items-center justify-center w-8 h-8 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed rounded"
                >
                    ←
                </button>

                <input
                    type="number"
                    min={min}
                    max={max}
                    value={value}
                    onChange={handleInputChange}
                    className="w-16 px-2 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                    onClick={handleIncrement}
                    disabled={value === max}
                    className="flex items-center justify-center w-8 h-8 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed rounded"
                >
                    →
                </button>
            </div>

            <div className="flex-1 text-left pl-4">
                {showTotal && <span className="text-xs text-gray-500">of {max}</span>}
            </div>
        </div>
    );
}
