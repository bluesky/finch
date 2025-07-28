import { Browsers } from "@phosphor-icons/react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useTabManagement } from "../../Tabs/context/TabsContext";
import { Entry } from "../types/UIEntry";
import CSIView from "../CSIView";
import { replaceArgs } from "../utils/ArgsFill";
import { pxToEm } from "../utils/units";
import { cn } from "@/lib/utils";
import styles from "../styles.json";
import { useVariant } from "../context/VariantContext";

type RelatedDispProps = {
  label?: string;
  style?: CSSProperties;
  fileArray: Entry["display"];
  [key: string]: any;
};

function RelatedDisp({
  fileArray,
  label = "",
  style,
  ...args
}: RelatedDispProps) {

  // helper function for converting $(P) into 13SIM1, so it takes the original (target) args, which 
  // have $(P) and $(R), and replaced those with the source args (13SIM1 and cam1)
  function substituteVariables(
    targetArgs: Record<string, any>,
    sourceArgs: Record<string, any>
  ): Record<string, any> {
    const result = { ...targetArgs };

    for (const [key, value] of Object.entries(result)) {
      if (typeof value === "string") {
        result[key] = replaceArgs(value, sourceArgs);
      }
    }

    return result;
  }
  // variant of the component using the variant context (for styles)
  const { variant } = useVariant();

  const { addTab } = useTabManagement();
  const handleCreateTab = (index: number) => {
    const fileNameRaw: string = fileArray![index].file.split(".")[0];
    const fileType: string = fileArray![index].file.split(".")[1];

    // clean version of the filename, which just means if the file type was opi, make it bob instead (since we don't support OPI files atm)
    // P.S. The reason we would even have an OPI file show up is because they're in bob that were converted from ADL
    // P.S.S. OPI file is a boy file
    const fileNameClean = fileType.toLowerCase() === "opi" ? `${fileNameRaw}.bob` : fileArray![index].file;

    const scale = 0.85
    const tabContent = (
      <CSIView
        fileName={fileNameClean}
        {...substituteVariables(fileArray![index].args, args)}
      />
    );

    // Pass fileName and args to addTab for localStorage persistence
    addTab(
      fileNameClean,
      tabContent,
      fileNameClean,
      substituteVariables(fileArray![index].args, args),
      scale
    );
  };

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownWidth, setDropdownWidth] = useState<number | undefined>(
    undefined
  );
  const containerRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: { target: any }) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Calculate the width (of the dropdown) needed for the longest option
  useEffect(() => {
    if (fileArray && fileArray.length > 1) {
      const tempDiv = document.createElement("div");
      tempDiv.style.position = "absolute";
      tempDiv.style.visibility = "hidden";
      tempDiv.style.whiteSpace = "nowrap";
      tempDiv.style.padding = "8px";
      tempDiv.style.fontSize = "0.85em";

      document.body.appendChild(tempDiv);

      let maxWidth = 0;
      fileArray.forEach((item) => {
        tempDiv.textContent = item.label;
        const width = tempDiv.offsetWidth;
        if (width > maxWidth) {
          maxWidth = width;
        }
      });

      document.body.removeChild(tempDiv);
      setDropdownWidth(maxWidth + 16); // Add some padding
    }
  }, [fileArray]);

  const handleInputClick = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const fileArrayLength = fileArray?.length;
  const buttonStyles = cn(`
    bg-blue-500 text-white hover:brightness-90
    rounded transition-colors duration-100
    focus:outline-none focus:ring-2 focus:ring-blue-300
    flex flex-col justify-center
  `, styles.variants[variant as keyof typeof styles.variants].related_disp);

  if (fileArrayLength === 1) {
    return (
      <button
        onClick={() => handleCreateTab(0)}
        className={buttonStyles}
        style={style}
      >
        <span>
          <div className="flex items-center justify-center">
            {label ? <>{label}</> : <Browsers size="1.45em" />}
          </div>
        </span>
      </button>
    );
  }

  return (
    <div
      ref={containerRef}
      className={
        "w-1/2 flex w-full max-w-64"
      }
      style={style}
    >
      <div className={`flex flex-col w-full`} onClick={handleInputClick}>
        <div
          className={buttonStyles}
        >
          <span>
            <div className="flex items-center justify-center">
              <Browsers size="1.45em" />
              {label && <div className="text-[0.85em]">{label}</div>}
            </div>
          </span>

        </div>
        <span className="relative w-full">
          {dropdownVisible && (
            <ul
              className="z-50 absolute top-0 bg-white border border-gray-300 rounded mt-1 max-h-40 overflow-auto"
              style={{
                width: dropdownWidth ? pxToEm(dropdownWidth) : "auto",
                minWidth: "100%",
              }}
            >
              {fileArray!.map((item, index) => (
                <li
                  key={index}
                  onClick={() => handleCreateTab(index)}
                  className={`p-2 cursor-pointer hover:bg-gray-200 whitespace-nowrap`}
                >
                  <p className='text-[0.85em]'>{item.label}</p>
                </li>
              ))}
            </ul>
          )}
        </span>
      </div>
    </div>
  );
}

export default RelatedDisp;
