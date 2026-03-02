interface LoadingSpinnerProps {
    fullPage?: boolean;
    message?: string;
    size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-[3px]',
};

const LoadingSpinner = ({ fullPage = false, message, size = 'md' }: LoadingSpinnerProps) => {
    const spinner = (
        <div className="flex flex-col items-center justify-center gap-3">
            <div
                className={`${sizeMap[size]} border-slate-200 border-t-indigo-600 rounded-full animate-spin`}
            />
            {message && (
                <p className="text-sm text-slate-500 font-medium animate-pulse text-center max-w-xs">
                    {message}
                </p>
            )}
        </div>
    );

    if (fullPage) {
        return (
            <div className="flex items-center justify-center min-h-[400px] w-full">
                {spinner}
            </div>
        );
    }

    return spinner;
};

export default LoadingSpinner;
