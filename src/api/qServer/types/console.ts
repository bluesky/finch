import type { QServerSuccessResponse } from './common';

export interface ConsoleOutputBody {
    /** Number of trailing lines to return. */
    nlines?: number;
}

export interface GetConsoleOutputResponse extends QServerSuccessResponse {
    text: string;
}

export interface GetConsoleOutputUidResponse extends QServerSuccessResponse {
    console_output_uid: string;
}

export interface ConsoleOutputUpdateBody {
    /** Uid of the last message already seen; the server returns everything after it. */
    last_msg_uid?: string;
}

export interface ConsoleOutputMessage {
    time: number;
    msg: string;
    [key: string]: unknown;
}

export interface GetConsoleOutputUpdateResponse extends QServerSuccessResponse {
    last_msg_uid: string;
    console_output_msgs: ConsoleOutputMessage[];
}
