import { useState } from "react";

export type PresentationLayerProps = {
  onSubmit: (fileName: string, P: string, R: string) => void;
};

const PresentationLayer = ({ onSubmit }: PresentationLayerProps) => {

  const [pValue, setPValue] = useState("");
  const [rValue, setRValue] = useState("");

  const availableFiles = [
    "ADBase.adl",
    "ADBase.bob",
    "simDetector.adl",
    "simDetector.bob",
  ];
  const [selectedFileName, setSelectedFileName] = useState(availableFiles[0]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFileName && pValue && rValue) {
      onSubmit(selectedFileName, pValue, rValue);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Configure ReactEDM</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fileName" className="block text-sm font-medium text-gray-700 mb-1">
            Choose from our UI files...
          </label>
          <select
            id="fileName"
            value={selectedFileName}
            onChange={(e) => setSelectedFileName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            {availableFiles.map((file) => (
              <option key={file} value={file}>
                {file}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="pValue" className="block text-sm font-medium text-gray-700 mb-1">
            P Value:
          </label>
          <input
            type="text"
            id="pValue"
            value={pValue}
            onChange={(e) => setPValue(e.target.value)}
            placeholder="e.g., 13SIM1"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="rValue" className="block text-sm font-medium text-gray-700 mb-1">
            R Value:
          </label>
          <input
            type="text"
            id="rValue"
            value={rValue}
            onChange={(e) => setRValue(e.target.value)}
            placeholder="e.g., cam1"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Open ReactEDM
        </button>
      </form>
    </div>
  );
};

export default PresentationLayer;