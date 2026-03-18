type LinuxMonitorProps = {
    /** URL of the Linux monitor */
    url?: string;
};

export default function LinuxMonitor({ url = "http://localhost:7681/" }: LinuxMonitorProps) {
    return (
        <div className="w-full h-full flex justify-center items-center">
            <iframe
                src={url}
                title="Linux Monitor Terminal"
                className="w-full h-[80vh] border border-gray-300 rounded-sm shadow-lg"
                allow="fullscreen"
            />
        </div>
    );
}