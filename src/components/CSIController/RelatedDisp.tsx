import { Browsers } from "@phosphor-icons/react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useTabManagement } from "../Tabs/context/TabsContext";
import { Entry } from "./types/UIEntry";
import CSIView from "./CSIView";
import { replaceArgs } from "./utils/ArgsFill";
import { pxToEm } from "./utils/units";
import { cn } from "@/lib/utils";
import styles from "./styles.json"; // adjust path to your styles.json

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
  const { addTab } = useTabManagement();
  const handleCreateTab = (index: number) => {
    const fileNameRaw: string = fileArray![index].file.split(".")[0];
    const fileType: string = fileArray![index].file.split(".")[1];
    const fileNameClean = fileType.toLowerCase() === "opi" ? `${fileNameRaw}.bob` : fileArray![index].file;
    const fileTypeClean: string = fileType.toLowerCase() === "opi" ? 'bob' : fileType
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

  // Calculate the width needed for the longest option
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

  return (
    <>
      {fileArray?.length === 1 ? (
        <button
          onClick={() => handleCreateTab(0)}
          className={cn(`
                bg-blue-500 text-white hover:bg-blue-600
                rounded border border-slate-300 transition-colors duration-100
                focus:outline-none focus:ring-2 focus:ring-blue-300
                flex flex-col justify-center
            `, styles.styles.default.button,)}
          style={style}
        >
          {label ? (
            <span>
              <div className="flex items-center justify-center">
                {label}

              </div>
            </span>
          ) : (
            <span>
              <div className="flex items-center justify-center">
                <Browsers size="1.45em" />

              </div>
            </span>
          )}
        </button>
      ) : (
        <div
          ref={containerRef}
          className={
            "w-1/2 border bg-white border-slate-300 flex w-full max-w-64"
          }
          style={style}
        >
          <div className={`flex flex-col w-full`} onClick={handleInputClick}>
            <div
              className={cn(`bg-blue-500 text-white hover:bg-blue-600
                rounded border border-slate-300 transition-colors duration-100
                focus:outline-none focus:ring-2 focus:ring-blue-300
                flex flex-col justify-center`, styles.styles.default.button,)}
            >
              {label ? (
                <span>
                  <div className="flex items-center">
                    <Browsers size="1.45em" />
                    <div className="text-[0.85em]">{label}</div>

                  </div>
                </span>
              ) : (
                <span>
                  <div className="flex items-center justify-center">
                    <Browsers size="1.45em" />

                  </div>
                </span>
              )}
            </div>
            <span className="relative w-full">
              {dropdownVisible && (
                <ul
                  className="z-10 absolute top-0 bg-white border border-gray-300 rounded mt-1 max-h-40 overflow-auto"
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
      )}
    </>
  );
}

export default RelatedDisp;
