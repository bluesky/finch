import { Device } from "@/types/deviceControllerTypes";

export type HexapodMovePositionForm = {
    tx: number | undefined;
    ty: number | undefined;
    tz: number | undefined;
    rx: number | undefined;
    ry: number | undefined;
    rz: number | undefined;
};

export type HexapodRBVs = {
    tx: Device;
    ty: Device;
    tz: Device;
    rx: Device;
    ry: Device;
    rz: Device;
}