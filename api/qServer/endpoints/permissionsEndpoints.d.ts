import { QServerRequestOptions } from '../types/common';
import { GetPermissionsResponse, PermissionsResponse, ReloadPermissionsBody, SetPermissionsBody } from '../types/permissions';
import { QServerEndpointDescriptor } from '../types/registry';
export interface QServerPermissionsEndpoints {
    /** `GET /api/permissions/get` — current user-group permissions. */
    getPermissions(options?: QServerRequestOptions): Promise<GetPermissionsResponse>;
    /** `POST /api/permissions/set` — replace the user-group permissions. */
    setPermissions(body: SetPermissionsBody, options?: QServerRequestOptions): Promise<PermissionsResponse>;
    /** `POST /api/permissions/reload` — reload permissions and optionally plan/device lists. */
    reloadPermissions(body?: ReloadPermissionsBody, options?: QServerRequestOptions): Promise<PermissionsResponse>;
}
export declare const permissionsEndpointDescriptors: QServerEndpointDescriptor[];
//# sourceMappingURL=permissionsEndpoints.d.ts.map