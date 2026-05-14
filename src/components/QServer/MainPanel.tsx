import Widget from './Widget';
import { Children, isValidElement } from 'react';

type MainPanelProps = {
    minimizeAllWidgets?: boolean;
    expandPanel: (bool: boolean) => void;
    children: React.ReactNode;
};
export default function MainPanel({
    minimizeAllWidgets = false,
    expandPanel = () => {},
    children,
}: MainPanelProps) {
    return (
        <div className="w-full h-full px-4 py-4 flex flex-col space-y-3 overflow-auto">
            {Children.map(children, (child, index) => {
                if (isValidElement(child)) {
                    const childProps = child.props;

                    return (
                        <Widget
                            key={index}
                            title={childProps.title}
                            icon={childProps.icon}
                            expandedHeight={childProps.expandedHeight}
                            defaultHeight={childProps.defaultHeight}
                            maxHeight={childProps.maxHeight}
                            minimizeAllWidgets={minimizeAllWidgets}
                            expandPanel={expandPanel}
                        >
                            {child}
                        </Widget>
                    );
                }
            })}
        </div>
    );
}
