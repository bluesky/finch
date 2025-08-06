import { useMemo, useCallback, useState, useEffect } from "react";
import useOphydSocket from "@/hooks/useOphydSocket";
import useMockSocket from "@/hooks/useMockSocket"; // Import the mock socket hook
import { ADLParser } from "./ADLParse";
import { parseCustomFormat } from "./ADLtoJSON";
import { createDeviceNameArray } from "./CreateDeviceNameArray";
import { fetchFile } from "./fetchFile";
import { Entry } from "../types/UIEntry";
import { parseXMLToEntries } from "./BobParser";

export interface UseUIDataOptions {
  fileName?: string;
  children?: Entry[];
  mock: boolean;
  args: { [key: string]: any };
}

export interface UseUIDataReturn {
  UIData: Entry[] | null;
  loading: boolean;
  error: string | null;
  devices: any;
  onSubmitSettings: (deviceName: string, value: any) => void;
}

export function useUIData({
  fileName,
  children,
  mock,
  args,
}: UseUIDataOptions): UseUIDataReturn {
  const [UIData, setUIData] = useState<Entry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If children are provided directly, use them
    if (children) {
      setUIData(children);
      return;
    }

    // If no fileName, nothing to load
    if (!fileName) {
      setUIData(null);
      return;
    }

    const loadUIFile = async () => {
      setLoading(true);
      setError(null);
      const fileType: string = fileName.split(".")[1];
      
      try {
        
        const UIContent = await fetchFile(fileName, "nicholasmanha", `AD_${fileType.toUpperCase()}_files`);

        if (!UIContent) {
          setError(`${fileName} not found`);
          return;
        }
        let parsedData: Entry[]
        switch (fileType.toLowerCase()) {
          case "bob":
            parsedData = parseXMLToEntries(UIContent)
            break;
          case "adl":
            parsedData = ADLParser(parseCustomFormat(UIContent));
            break;
          default:
            parsedData = []
            break;
        }
        setUIData(parsedData);

      } catch (err) {
        setError(`Error loading ${fileName}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadUIFile();
  }, [fileName, children]);

  // Memoize deviceNames to prevent unnecessary websocket reconnections
  const deviceNames = useMemo(() => {
    if (!UIData) return [];
    return createDeviceNameArray(UIData, args);
  }, [UIData, JSON.stringify(args)]);

  // Conditionally use mock or real socket based on mock flag
  const ophydSocketResult = useOphydSocket(deviceNames);
  const mockSocketResult = useMockSocket(deviceNames);
  
  const { devices, handleSetValueRequest } = mock ? mockSocketResult : ophydSocketResult;
  
  const onSubmitSettings = useCallback(handleSetValueRequest, [
    handleSetValueRequest,
  ]);

  return {
    UIData,
    loading,
    error,
    devices,
    onSubmitSettings,
  };
}