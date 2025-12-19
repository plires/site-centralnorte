const GlobalWarningsBanner = ({ warnings, title, subtitle }) => {
    return (
        <div className="mb-6 border-l-4 border-red-500 bg-red-50 p-4">
            <div className="flex">
                <div className="ml-3">
                    {title && <h3 className="text-sm font-medium text-red-800">{title}</h3>}
                    {subtitle && <span className="text-xs text-red-800">{subtitle}</span>}
                    <div className="mt-2 text-sm text-red-700">
                        <ul className="list-disc space-y-1 pl-5">
                            {warnings.map((w, index) => (
                                <li key={index}>{w.message}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalWarningsBanner;
