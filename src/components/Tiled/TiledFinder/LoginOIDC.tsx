import { useState, useEffect, useRef } from 'react';
import Button from './ui/Button';
import { CircleNotch } from '@phosphor-icons/react';
import { TiledAuthProvider } from './types';

export type LoginOIDCProps = {
    handleCancel: () => void;
    provider: TiledAuthProvider;
    onSuccess: () => void;
    oidcRedirectUrl?: string;
};

export default function LoginOIDC({
    handleCancel,
    provider,
    onSuccess,
    oidcRedirectUrl,
}: LoginOIDCProps) {
    const [status, setStatus] = useState<
        'waiting' | 'checking' | 'success' | 'error' | 'errorMissingToken'
    >('waiting');
    const popupRef = useRef<Window | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const defaultLoginUrl = provider.links.auth_endpoint;
    const loginUrl = oidcRedirectUrl
        ? `${defaultLoginUrl}${defaultLoginUrl.includes('?') ? '&' : '?'}state=${oidcRedirectUrl}`
        : defaultLoginUrl;

    const cleanup = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (popupRef.current && !popupRef.current.closed) {
            popupRef.current.close();
        }
    };

    useEffect(() => {
        const openLoginWindow = () => {
            // Open the popup window
            popupRef.current = window.open(
                loginUrl,
                'Tiled OIDC Login',
                'width=600,height=700,scrollbars=yes,resizable=yes',
            );

            if (!popupRef.current) {
                setStatus('error');
                return;
            }

            setStatus('checking');

            // Poll the popup window to check for URL changes
            intervalRef.current = setInterval(() => {
                try {
                    if (!popupRef.current || popupRef.current.closed) {
                        // User closed the popup
                        cleanup();
                        setStatus('waiting');
                        return;
                    }

                    // Check if we can access the URL (same origin)
                    const currentUrl = popupRef.current.location.href;

                    // Check if we're back on our domain or a callback URL
                    if (
                        currentUrl.includes('access_token') ||
                        currentUrl.includes('code=') ||
                        currentUrl.includes('/callback')
                    ) {
                        console.log('Callback URL detected (token extraction in progress)');

                        // Extract tokens from URL
                        const urlParams = new URLSearchParams(currentUrl.split('?')[1] || '');
                        const accessToken = urlParams.get('access_token');
                        const refreshToken = urlParams.get('refresh_token');
                        const code = urlParams.get('code');

                        if (accessToken || code) {
                            if (accessToken) {
                                // Direct token response
                                localStorage.setItem('tiledAccessToken', accessToken);
                                setStatus('success');
                                if (refreshToken) {
                                    localStorage.setItem('tiledRefreshToken', refreshToken);
                                }
                                onSuccess();
                            } else if (code) {
                                // Authorization code was found, but no direct token. Tiled issue
                                console.log(
                                    'Missing access_token from redirect url after attempted login. Ensure Tiled is configured properly. Only received Tiled authorization code:',
                                    code,
                                );
                                setStatus('errorMissingToken');
                            }
                            cleanup();
                        }
                    }
                } catch {
                    // Cross-origin error - popup is on different domain
                    // This is expected during the OIDC flow
                    console.log('Cross-origin access (expected during OIDC flow)');
                }
            }, 1000);
        };
        openLoginWindow();

        // Cleanup on component unmount
        return cleanup;
    }, [loginUrl, onSuccess]);

    const handleCancelClick = () => {
        cleanup();
        handleCancel();
    };

    return (
        <section className="mt-8 flex flex-col items-center space-y-6">
            <h2 className="text-3xl text-slate-700 font-light">
                {status === 'waiting' && 'Waiting for you to authenticate'}
                {status === 'checking' && 'Checking authentication...'}
                {status === 'success' && 'Authentication successful!'}
                {status === 'error' && 'Authentication failed'}
                {status === 'errorMissingToken' &&
                    'Authentication failed, missing access token in redirect URL. Check Tiled configuration.'}
            </h2>

            {status === 'waiting' && (
                <p>Please log in to the provider and return to this page when complete.</p>
            )}

            {(status === 'waiting' || status === 'checking') && (
                <CircleNotch className="text-slate-500 mt-4 animate-spin" size={72} />
            )}

            <p className="w-full px-12 text-wrap">
                Having trouble finding the popup? Try going directly to{' '}
                <a
                    className="text-blue-500 underline"
                    href={loginUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    this link
                </a>{' '}
                in a new window.
            </p>

            <Button isSecondary={true} cb={handleCancelClick} text="Cancel" />
        </section>
    );
}
