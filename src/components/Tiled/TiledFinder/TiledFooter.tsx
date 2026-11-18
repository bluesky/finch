import { Breadcrumb } from './types';

type TiledFooterProps = {
    breadcrumbs?: Breadcrumb[];
};
export default function TiledFooter({ breadcrumbs, ...props }: TiledFooterProps) {
    const handleClick = (cb: undefined | (() => void)) => {
        console.log('click');
        console.log({ cb });
        if (cb !== undefined) {
            console.log('about to run cb');
            cb();
        }
    };
    return (
        <div className="w-full h-8 flex-shrink-0 pl-2 overflow-x-auto" {...props}>
            <div className="flex space-x-2">
                {breadcrumbs &&
                    breadcrumbs.map((item, index) => {
                        const isLast: boolean = breadcrumbs.length - 1 === index;
                        return (
                            <div
                                className={`flex items-center max-w-32 space-x-1 ${!isLast && 'hover:cursor-pointer hover:text-slate-500'}`}
                                key={index}
                            >
                                {item.icon && (
                                    <div className="w-5 aspect-square flex-shrink-0">
                                        {item.icon}
                                    </div>
                                )}
                                <p
                                    className="truncate"
                                    onClick={!isLast ? () => handleClick(item.onClick) : () => {}}
                                >
                                    {item.label}
                                </p>
                                <p className="flex-shrink-0">
                                    {index < breadcrumbs.length - 1 && '/'}
                                </p>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}
