import { Browsers } from "@phosphor-icons/react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useTabManagement } from "../Tabs/context/TabsContext";
import { Entry } from "./types/ADLEntry";
import ADLView from "./ADLView";
import { replaceArgs } from "./utils/ArgsFill";

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
    const tabContent = (
      <ADLView
        fileName={fileArray![index].file}
        {...substituteVariables(fileArray![index].args, args)}
      />
    );

    // Pass fileName and args to addTab for localStorage persistence
    addTab(
      fileArray![index].file,
      tabContent,
      fileArray![index].file,
      substituteVariables(fileArray![index].args, args)
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
      tempDiv.style.fontSize = "14px";

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
          className={`
                bg-blue-500 text-white hover:bg-blue-600
                rounded border border-slate-300 transition-all duration-100
                focus:outline-none focus:ring-2 focus:ring-blue-300
                flex flex-col justify-center
            `}
          style={style}
        >
          {label ? (
            <small className="text-xs">{label}</small>
          ) : (
            <small className="text-xs flex justify-center">
              <Browsers size={16} />
            </small>
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
              className="bg-blue-500 text-white hover:bg-blue-600
                rounded border border-slate-300 transition-all duration-100
                focus:outline-none focus:ring-2 focus:ring-blue-300
                flex flex-col justify-center"
            >
              {label ? (
                <small className="text-xs">
                  <div className="flex items-center">
                    <Browsers size={16} />
                    {label}
                  </div>
                </small>
              ) : (
                <small className="text-xs flex justify-center">
                  <Browsers size={16} />
                </small>
              )}
            </div>
            <span className="relative w-full">
              {dropdownVisible && (
                <ul
                  className="z-10 absolute top-0 bg-white border border-gray-300 rounded mt-1 max-h-40 overflow-auto"
                  style={{
                    width: dropdownWidth ? `${dropdownWidth}px` : "auto",
                    minWidth: "100%",
                  }}
                >
                  {fileArray!.map((item, index) => (
                    <li
                      key={index}
                      onClick={() => handleCreateTab(index)}
                      className={`p-2 cursor-pointer hover:bg-gray-200 whitespace-nowrap`}
                    >
                      {item.label}
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
