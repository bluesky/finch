/* eslint-disable react-refresh/only-export-components --
 * A Runner has to live beside its descriptor; see `infoQueries.tsx` for the reasoning.
 */
import {
    useTiledCloseStreamMutation,
    useTiledCreateApiKeyMutation,
    useTiledDeleteRevisionMutation,
    useTiledDeleteWebhookMutation,
    useTiledLoginMutation,
    useTiledLogoutMutation,
    useTiledPutDataSourceMutation,
    useTiledRefreshSessionMutation,
    useTiledRegisterMutation,
    useTiledRegisterWebhookMutation,
    useTiledRevokeApiKeyMutation,
    useTiledRevokeSessionMutation,
} from '@/api/tiled';
import type {
    PostMetadataRequest,
    PutDataSourceRequest,
    WebhookRegistrationRequest,
} from '@/api/tiled';
import MutationResultPanel from '../MutationResultPanel';
import { json, num, str, type MutationDescriptor, type MutationRunnerProps } from '../types';

/**
 * Registration, revisions, streams, webhooks and auth.
 *
 * The auth six are the ones to expect failures from: their URLs are resolved at call time from
 * `About.authentication.links`, which is `null` on a server with authentication disabled. A
 * `TiledApiError` saying exactly that is the correct outcome there, not a bug — the connection bar
 * says so in its status line when it applies.
 */

const NODE_PATH = {
    name: 'path',
    kind: 'path',
    label: 'path',
    required: true,
    defaultValue: '',
} as const;

const hasPath = (values: Record<string, unknown>) => str(values, 'path').length > 0;

function RegisterRunner({ values, confirm, requestOptions }: MutationRunnerProps) {
    const mutation = useTiledRegisterMutation(undefined, requestOptions);
    const body = json<PostMetadataRequest>(values, 'body');
    return (
        <MutationResultPanel
            result={mutation}
            resultKind="json"
            hookName="useTiledRegisterMutation"
            canRun={body !== undefined}
            onRun={() =>
                body &&
                confirm(`Register data in "${str(values, 'parentPath') || '(root)'}"`) &&
                mutation.mutate({ parentPath: str(values, 'parentPath'), body })
            }
        />
    );
}

function PutDataSourceRunner({ values, confirm, requestOptions }: MutationRunnerProps) {
    const mutation = useTiledPutDataSourceMutation(undefined, requestOptions);
    const body = json<PutDataSourceRequest>(values, 'body');
    return (
        <MutationResultPanel
            result={mutation}
            resultKind="json"
            hookName="useTiledPutDataSourceMutation"
            canRun={body !== undefined && hasPath(values)}
            onRun={() =>
                body &&
                confirm(`Replace the data source of "${str(values, 'path')}"`) &&
                mutation.mutate({
                    path: str(values, 'path'),
                    body,
                    patch_shape: str(values, 'patch_shape') || undefined,
                    patch_offset: str(values, 'patch_offset') || undefined,
                })
            }
        />
    );
}

function DeleteRevisionRunner({ values, confirm, requestOptions }: MutationRunnerProps) {
    const mutation = useTiledDeleteRevisionMutation(undefined, requestOptions);
    const hasNumber = values.number !== undefined;
    return (
        <MutationResultPanel
            result={mutation}
            resultKind="json"
            hookName="useTiledDeleteRevisionMutation"
            canRun={hasPath(values) && hasNumber}
            onRun={() =>
                confirm(`Delete revision ${num(values, 'number')} of "${str(values, 'path')}"`) &&
                mutation.mutate({ path: str(values, 'path'), number: num(values, 'number') })
            }
        />
    );
}

function CloseStreamRunner({ values, confirm, requestOptions }: MutationRunnerProps) {
    const mutation = useTiledCloseStreamMutation(undefined, requestOptions);
    return (
        <MutationResultPanel
            result={mutation}
            resultKind="json"
            hookName="useTiledCloseStreamMutation"
            canRun={hasPath(values)}
            onRun={() =>
                confirm(`Close the stream at "${str(values, 'path')}"`) &&
                mutation.mutate({ path: str(values, 'path') })
            }
        />
    );
}

function RegisterWebhookRunner({ values, confirm, requestOptions }: MutationRunnerProps) {
    const mutation = useTiledRegisterWebhookMutation(undefined, requestOptions);
    const body = json<WebhookRegistrationRequest>(values, 'body');
    return (
        <MutationResultPanel
            result={mutation}
            resultKind="json"
            hookName="useTiledRegisterWebhookMutation"
            canRun={body !== undefined && hasPath(values)}
            onRun={() =>
                body &&
                confirm(`Register a webhook on "${str(values, 'path')}"`) &&
                mutation.mutate({ path: str(values, 'path'), body })
            }
        />
    );
}

function DeleteWebhookRunner({ values, confirm, requestOptions }: MutationRunnerProps) {
    const mutation = useTiledDeleteWebhookMutation(undefined, requestOptions);
    const hasId = values.webhookId !== undefined;
    return (
        <MutationResultPanel
            result={mutation}
            resultKind="json"
            hookName="useTiledDeleteWebhookMutation"
            canRun={hasId}
            onRun={() =>
                confirm(`Delete webhook ${num(values, 'webhookId')}`) &&
                mutation.mutate({ webhookId: num(values, 'webhookId') })
            }
        />
    );
}

// #region auth

function LoginRunner({ values, requestOptions }: MutationRunnerProps) {
    const mutation = useTiledLoginMutation(undefined, requestOptions);
    return (
        <>
            <MutationResultPanel
                result={mutation}
                resultKind="json"
                hookName="useTiledLoginMutation"
                canRun={str(values, 'username').length > 0}
                onRun={() =>
                    mutation.mutate({
                        username: str(values, 'username'),
                        password: str(values, 'password'),
                        url: str(values, 'url') || undefined,
                    })
                }
            />
            <p className="text-xs text-slate-500">
                Resolves <code className="font-mono">null</code> on a wrong password rather than
                rejecting — so a failed login shows as success with a null body, not as an error.
            </p>
        </>
    );
}

function LogoutRunner({ confirm, requestOptions }: MutationRunnerProps) {
    const mutation = useTiledLogoutMutation(undefined, requestOptions);
    return (
        <>
            <MutationResultPanel
                result={mutation}
                resultKind="json"
                hookName="useTiledLogoutMutation"
                onRun={() => confirm('Log out') && mutation.mutate()}
            />
            <p className="text-xs text-slate-500">
                Clears local credentials even when it rejects — including on a server that
                advertises no logout endpoint.
            </p>
        </>
    );
}

function CreateApiKeyRunner({ values, requestOptions }: MutationRunnerProps) {
    const mutation = useTiledCreateApiKeyMutation(undefined, requestOptions);
    return (
        <>
            <MutationResultPanel
                result={mutation}
                resultKind="json"
                hookName="useTiledCreateApiKeyMutation"
                onRun={() =>
                    mutation.mutate({
                        note: str(values, 'note') || undefined,
                        expires_in:
                            values.expires_in === undefined ? undefined : num(values, 'expires_in'),
                    })
                }
            />
            <p className="text-xs text-slate-500">
                The secret comes back <strong>once</strong>. Copy it from the result; nothing will
                tell you what it was afterwards.
            </p>
        </>
    );
}

function RevokeApiKeyRunner({ values, confirm, requestOptions }: MutationRunnerProps) {
    const mutation = useTiledRevokeApiKeyMutation(undefined, requestOptions);
    return (
        <MutationResultPanel
            result={mutation}
            resultKind="json"
            hookName="useTiledRevokeApiKeyMutation"
            canRun={str(values, 'firstEight').length > 0}
            onRun={() =>
                confirm(`Revoke the key starting ${str(values, 'firstEight')}`) &&
                mutation.mutate({ firstEight: str(values, 'firstEight') })
            }
        />
    );
}

function RefreshSessionRunner({ requestOptions }: MutationRunnerProps) {
    const mutation = useTiledRefreshSessionMutation(undefined, requestOptions);
    return (
        <>
            <MutationResultPanel
                result={mutation}
                resultKind="json"
                hookName="useTiledRefreshSessionMutation"
                onRun={() => mutation.mutate()}
            />
            <p className="text-xs text-slate-500">
                Rarely needed — the client refreshes on a 401 by itself, single-flight, and retries
                the original request. Put a refresh token in the connection bar first.
            </p>
        </>
    );
}

function RevokeSessionRunner({ values, confirm, requestOptions }: MutationRunnerProps) {
    const mutation = useTiledRevokeSessionMutation(undefined, requestOptions);
    return (
        <MutationResultPanel
            result={mutation}
            resultKind="json"
            hookName="useTiledRevokeSessionMutation"
            canRun={str(values, 'sessionId').length > 0}
            onRun={() =>
                confirm(`Revoke session ${str(values, 'sessionId')}`) &&
                mutation.mutate({ sessionId: str(values, 'sessionId') })
            }
        />
    );
}

// #endregion

export const managementMutationDescriptors: readonly MutationDescriptor[] = [
    {
        id: 'management.register',
        kind: 'mutation',
        group: 'management',
        hookName: 'useTiledRegisterMutation',
        summary: 'Register data already on disk. Addresses the parent container.',
        fields: [
            {
                name: 'parentPath',
                kind: 'path',
                label: 'parentPath',
                description: 'the container to register INSIDE',
                defaultValue: '',
            },
            { name: 'body', kind: 'json', label: 'body', required: true },
        ],
        resultKind: 'json',
        Runner: RegisterRunner,
    },
    {
        id: 'management.putDataSource',
        kind: 'mutation',
        group: 'management',
        hookName: 'useTiledPutDataSourceMutation',
        summary: "Replace a node's data source.",
        destructive: true,
        fields: [
            NODE_PATH,
            { name: 'body', kind: 'json', label: 'body', required: true },
            { name: 'patch_shape', kind: 'text', label: 'patch_shape' },
            { name: 'patch_offset', kind: 'text', label: 'patch_offset' },
        ],
        resultKind: 'json',
        Runner: PutDataSourceRunner,
    },
    {
        id: 'management.deleteRevision',
        kind: 'mutation',
        group: 'management',
        hookName: 'useTiledDeleteRevisionMutation',
        summary: 'Drop one metadata revision by number. Not undoable.',
        destructive: true,
        fields: [NODE_PATH, { name: 'number', kind: 'number', label: 'number', required: true }],
        resultKind: 'json',
        Runner: DeleteRevisionRunner,
    },
    {
        id: 'management.closeStream',
        kind: 'mutation',
        group: 'management',
        hookName: 'useTiledCloseStreamMutation',
        summary: "Mark an append-only node complete. Emits the 'stream-closed' event.",
        destructive: true,
        fields: [NODE_PATH],
        resultKind: 'json',
        Runner: CloseStreamRunner,
    },
    {
        id: 'webhooks.register',
        kind: 'mutation',
        group: 'webhooks',
        hookName: 'useTiledRegisterWebhookMutation',
        summary: "Register a webhook for a node's events.",
        fields: [
            NODE_PATH,
            {
                name: 'body',
                kind: 'json',
                label: 'body',
                required: true,
                defaultValue: {
                    url: 'https://example.org/hook',
                    events: ['container-child-created'],
                },
            },
        ],
        resultKind: 'json',
        Runner: RegisterWebhookRunner,
    },
    {
        id: 'webhooks.delete',
        kind: 'mutation',
        group: 'webhooks',
        hookName: 'useTiledDeleteWebhookMutation',
        summary: 'Deactivate and remove a webhook.',
        destructive: true,
        fields: [{ name: 'webhookId', kind: 'number', label: 'webhookId', required: true }],
        resultKind: 'json',
        Runner: DeleteWebhookRunner,
    },
    {
        id: 'auth.login',
        kind: 'mutation',
        group: 'auth',
        hookName: 'useTiledLoginMutation',
        summary: 'Log in with a username and password. Resolves null on a wrong password.',
        fields: [
            { name: 'username', kind: 'text', label: 'username', required: true },
            { name: 'password', kind: 'text', label: 'password' },
            { name: 'url', kind: 'text', label: 'url', description: 'server override' },
        ],
        resultKind: 'json',
        Runner: LoginRunner,
    },
    {
        id: 'auth.logout',
        kind: 'mutation',
        group: 'auth',
        hookName: 'useTiledLogoutMutation',
        summary: 'Log out, then drop every local credential.',
        destructive: true,
        fields: [],
        resultKind: 'json',
        Runner: LogoutRunner,
    },
    {
        id: 'auth.createApiKey',
        kind: 'mutation',
        group: 'auth',
        hookName: 'useTiledCreateApiKeyMutation',
        summary: 'Mint an API key. The secret is returned once and never again.',
        fields: [
            { name: 'note', kind: 'text', label: 'note', defaultValue: 'playground' },
            { name: 'expires_in', kind: 'number', label: 'expires_in', description: 'seconds' },
        ],
        resultKind: 'json',
        Runner: CreateApiKeyRunner,
    },
    {
        id: 'auth.revokeApiKey',
        kind: 'mutation',
        group: 'auth',
        hookName: 'useTiledRevokeApiKeyMutation',
        summary: 'Revoke an API key by its first eight characters.',
        destructive: true,
        fields: [{ name: 'firstEight', kind: 'text', label: 'firstEight', required: true }],
        resultKind: 'json',
        Runner: RevokeApiKeyRunner,
    },
    {
        id: 'auth.refreshSession',
        kind: 'mutation',
        group: 'auth',
        hookName: 'useTiledRefreshSessionMutation',
        summary: 'Exchange the stored refresh token for a new access token.',
        fields: [],
        resultKind: 'json',
        Runner: RefreshSessionRunner,
    },
    {
        id: 'auth.revokeSession',
        kind: 'mutation',
        group: 'auth',
        hookName: 'useTiledRevokeSessionMutation',
        summary: 'Revoke one session by id.',
        destructive: true,
        fields: [{ name: 'sessionId', kind: 'text', label: 'sessionId', required: true }],
        resultKind: 'json',
        Runner: RevokeSessionRunner,
    },
];
