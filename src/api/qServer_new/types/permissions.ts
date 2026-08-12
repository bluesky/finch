import type { QServerSuccessResponse } from './common';

/** Allow/forbid lists are arrays of regular expressions, or `[null]` for "none". */
export interface UserGroupPermissionEntry {
    allowed_plans?: (string | null)[];
    forbidden_plans?: (string | null)[];
    allowed_devices?: (string | null)[];
    forbidden_devices?: (string | null)[];
    allowed_functions?: (string | null)[];
    forbidden_functions?: (string | null)[];
}

export interface UserGroupPermissions {
    user_groups: { [group: string]: UserGroupPermissionEntry };
    [key: string]: unknown;
}

export interface GetPermissionsResponse extends QServerSuccessResponse {
    user_group_permissions: UserGroupPermissions;
}

export interface SetPermissionsBody {
    user_group_permissions: UserGroupPermissions;
    lock_key?: string;
}

export interface ReloadPermissionsBody {
    /** Reload the plan and device lists from the startup scripts as well. */
    restore_plans_devices?: boolean;
    /** Restore permissions from the file they were loaded from. */
    restore_permissions?: boolean;
    lock_key?: string;
}

export type PermissionsResponse = QServerSuccessResponse;
