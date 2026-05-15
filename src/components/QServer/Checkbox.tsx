type CheckboxProps = {
    label?: string | boolean;
    cb?: (isChecked: boolean) => void;
    isChecked?: boolean;
};
export default function Checkbox({
    label = false,
    cb = () => {},
    isChecked = false,
}: CheckboxProps) {
    //const [checked, setChecked] = useState(false);

    const handleCheckboxChange = () => {
        cb(!isChecked);
    };

    return (
        <div className="flex items-center justify-center">
            <input type="checkbox" checked={isChecked} onChange={handleCheckboxChange} />
            {label && <label onClick={handleCheckboxChange}>{label}</label>}
        </div>
    );
}
