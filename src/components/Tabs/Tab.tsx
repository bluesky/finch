import React from "react";
import { useTabsContext } from "./context/TabsContext";
import { TabProps } from "./types/tabs";
import { XCircle } from "@phosphor-icons/react";

export const Tab: React.FC<TabProps> = ({
  value,
  children,
  removeTab,
  mainTab,
  className = "",
<<<<<<< HEAD
  hasFileProp
=======
>>>>>>> main
}) => {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;
  return (
    <>
<<<<<<< HEAD
      <div
=======
      <button
>>>>>>> main
        onClick={() => setActiveTab(value)}
        role="tab"
        aria-selected={isActive}
        aria-controls={`panel-${value}`}
        id={`tab-${value}`}
<<<<<<< HEAD
        className="cursor-pointer"
=======
>>>>>>> main
      >
        <div
          className={`flex justify-center px-4 py-2 text-xl transition-colors duration-200 border-b-2 ${
            isActive
              ? "text-blue-400 border-blue-600 bg-white/10"
              : "text-white border-transparent hover:text-gray-400 hover:border-gray-300"
          } ${className}`}
        >
          <div className="flex flex-col justify-center">
            <div>{children}</div>
          </div>
          <div className="flex flex-col justify-center align-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeTab(value);
              }}
              className={`ml-2  transition-colors duration-200 text-4xl  ${
<<<<<<< HEAD
                mainTab && hasFileProp ? "text-gray-500" : "text-white hover:text-red-500"
=======
                mainTab ? "text-gray-500" : "text-white hover:text-red-500"
>>>>>>> main
              }`}
            >
              <XCircle size={24} />
            </button>
          </div>
        </div>
<<<<<<< HEAD
      </div>
=======
      </button>
>>>>>>> main
    </>
  );
};
