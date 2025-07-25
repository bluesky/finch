import { useState, useEffect, useId } from "react";
import PresentationLayer from "./PresentationLayer";
import CSIControllerTabs from "./CSIControllerTabs";
import { MockProvider } from "./MockContext";
import { VariantProvider } from "./VariantContext";

export type CSIControllerProps = {
  className?: string;
  fileName?: string;
  P?: string;
  R?: string;
  mock?: boolean;
  variant?: string;
};

// if tab data is in localstorage, load that instead
const getConfigFromLocalStorage = (instanceId: string) => {
  try {
    const storageKey = `csi-tabs-${instanceId}`;
    const csiTabsData = localStorage.getItem(storageKey);
    if (csiTabsData) {
      const tabs = JSON.parse(csiTabsData);
      if (Array.isArray(tabs) && tabs.length > 0) {
        // Find the main tab or use the first tab
        const mainTab = tabs.find(tab => tab.isMainTab) || tabs[0];

        if (mainTab && mainTab.fileName && mainTab.args && mainTab.args.P && mainTab.args.R) {
          return {
            fileName: mainTab.fileName,
            P: mainTab.args.P,
            R: mainTab.args.R
          };
        }
      }
    }
    return null;
  } catch (error) {
    console.error('Error parsing csi-tabs from localStorage:', error);
    return null;
  }
};

export default function CSIController({
  className,
  fileName,
  P,
  R,
  mock = false,
  variant = "default"
}: CSIControllerProps) {
  const instanceId = useId();
  const [configuredProps, setConfiguredProps] = useState<{
    fileName: string;
    P: string;
    R: string;

  } | null>(null);

  const [hasCheckedLocalStorage, setHasCheckedLocalStorage] = useState(false);

  // Check localStorage for existing csi-tabs configuration
  useEffect(() => {
    if (!hasCheckedLocalStorage) {
      const existingConfig = getConfigFromLocalStorage(instanceId);

      // If props are provided and they differ from localStorage, clear localStorage
      if (fileName && P && R && existingConfig) {
        if (existingConfig.fileName !== fileName ||
          existingConfig.P !== P ||
          existingConfig.R !== R) {
          // Clear localStorage when props differ
          try {
            const storageKey = `csi-tabs-${instanceId}`;
            const activeTabKey = `csi-active-tab-${instanceId}`;
            localStorage.removeItem(storageKey);
            localStorage.removeItem(activeTabKey);
          } catch (error) {
            console.error('Error clearing localStorage:', error);
          }
          // Don't set configuredProps, let the component use the passed props
          setConfiguredProps(null);
        } else {
          // Props match localStorage, use localStorage
          setConfiguredProps(existingConfig);
        }
      } else if (existingConfig && !fileName && !P && !R) {
        // No props provided, use localStorage
        setConfiguredProps(existingConfig);
      }

      setHasCheckedLocalStorage(true);
    }
  }, [hasCheckedLocalStorage, instanceId, fileName, P, R]);

  // Use configured props if available, otherwise use the passed props
  const finalFileName = configuredProps?.fileName || fileName;
  const finalP = configuredProps?.P || P;
  const finalR = configuredProps?.R || R;

  // Show loading state while checking localStorage
  if (!hasCheckedLocalStorage) {
    return <div>Loading...</div>;
  }

  // If any required props are missing, render the dialog
  if (!finalFileName || !finalP || !finalR) {
    return (
      <PresentationLayer
        onSubmit={(fileName, P, R) => {
          setConfiguredProps({ fileName, P, R });
        }}
      />
    );
  }

  // Once we have all props, render the actual controller
  return (
    <VariantProvider variant={variant}>
      <MockProvider mock={mock}>
        <CSIControllerTabs
          className={className}
          fileName={finalFileName}
          oldFileName={fileName} // Pass the original fileName as oldFileName
          P={finalP}
          R={finalR}
          instanceId={instanceId}
        />
      </MockProvider>
    </VariantProvider>
  );
}