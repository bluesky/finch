import { TiledAuthProvider } from './types';
import { Question } from '@phosphor-icons/react';
import { Tooltip } from 'react-tooltip';

export type LoginSelectProviderProps = {
    handleClick: (provider: TiledAuthProvider) => void;
    providers: TiledAuthProvider[];
};

export default function LoginSelectProvider({ handleClick, providers }: LoginSelectProviderProps) {
    return (
        <ul className="w-full flex justify-center flex-col mt-12 space-y-4 mb-4">
            <h2 className="text-center text-2xl text-slate-600 mb-4 font-light">
                {' '}
                Select Login Provider{' '}
            </h2>
            {providers.map((provider) => (
                <li key={provider.provider} className="flex m-auto items-center space-x-2">
                    <button
                        className="border border-slate-200 rounded-md w-72 min-w-fit text-lg py-1 hover:bg-slate-50 text-sky-700"
                        onClick={() => handleClick(provider)}
                    >
                        LOG IN WITH {provider.provider.toLocaleUpperCase()}
                    </button>
                    <Question
                        size={24}
                        data-tooltip-id={`provider-tooltip-${provider.provider}`}
                        data-tooltip-content={JSON.stringify(provider, null, 2)}
                        className="cursor-help text-slate-500 hover:text-slate-700"
                    />
                    <Tooltip
                        id={`provider-tooltip-${provider.provider}`}
                        place="right"
                        clickable={true}
                        style={{
                            backgroundColor: '#1f2937',
                            color: '#f9fafb',
                            maxWidth: '400px',
                            width: '400px',
                            whiteSpace: 'normal',
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            padding: '12px',
                            borderRadius: '6px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            cursor: 'text',
                            userSelect: 'text',
                            overflow: 'hidden',
                        }}
                        render={({ content }) => (
                            <div style={{ width: '100%' }}>
                                <div
                                    style={{
                                        marginBottom: '8px',
                                        fontSize: '11px',
                                        color: '#9ca3af',
                                    }}
                                >
                                    Provider Information from Tiled
                                </div>
                                <div
                                    style={{
                                        maxHeight: '300px',
                                        overflowY: 'auto',
                                        overflowX: 'auto',
                                        backgroundColor: '#111827',
                                        padding: '8px',
                                        borderRadius: '4px',
                                        border: '1px solid #374151',
                                    }}
                                >
                                    <pre
                                        style={{
                                            margin: 0,
                                            fontFamily: 'monospace',
                                            fontSize: '10px',
                                            lineHeight: '1.4',
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-all',
                                            overflowWrap: 'anywhere',
                                        }}
                                    >
                                        {content}
                                    </pre>
                                </div>
                            </div>
                        )}
                    />
                </li>
            ))}
        </ul>
    );
}
