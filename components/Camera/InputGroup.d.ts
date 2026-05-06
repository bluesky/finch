import { DetectorInput } from './types/cameraTypes';
import { Devices } from '../../types/deviceControllerTypes';
type InputGroupProps = {
    /** Settings group descriptor containing a display title, an optional PV sub-prefix, and a list of detector inputs. */
    settingsGroup: {
        title: string;
        prefix: string | null;
        inputs: DetectorInput[];
    };
    /** EPICS PV prefix prepended (with the group sub-prefix) when constructing full PV names for each input. */
    prefix: string;
    /** Map of full PV names to live device objects forwarded to each `InputField`. */
    cameraSettingsPVs: Devices;
    /** Callback invoked when the user submits a new value for any PV in the group. */
    onSubmit: (pv: string, value: string | boolean | number) => void;
};
export default function InputGroup({ settingsGroup, prefix, cameraSettingsPVs, onSubmit }: InputGroupProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=InputGroup.d.ts.map