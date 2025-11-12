import {PostItemAddResponse, GetPlansAllowedResponse, GetDevicesAllowedResponse, GetHistoryResponse, GetQueueItemResponse, GetQueueResponse, GetStatusResponse, PostEnvironmentOpenResponse, PostItemExecuteResponse, PostItemRemoveResponse, GetRunsActiveResponse } from "../types/apiTypes";

export const mockGetRunsActiveResponse: GetRunsActiveResponse = {
  "success": true,
  "msg": "",
  "run_list": [
    {
      "uid": "70a5979c-6ad5-43dc-a645-3f3dc18ce5aa",
      "scan_id": 7,
      "is_open": true,
      "exit_status": null
    }
  ],
  "run_list_uid": "0caaf71f-bed6-4347-b993-24e2c4050f39"
}

export const mockGetDevicesAllowedResponse: GetDevicesAllowedResponse = {
    "success": true,
    "msg": "",
    "devices_allowed": {
        "noisy_det": {
            "is_readable": true,
            "is_movable": false,
            "is_flyable": false,
            "classname": "SynGauss",
            "module": "ophyd.sim",
            "components": {
                "val": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "SynSignal",
                    "module": "ophyd.sim"
                },
                "Imax": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "center": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "sigma": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "noise": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "EnumSignal",
                    "module": "ophyd.sim"
                },
                "noise_multiplier": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                }
            }
        },
        "motor_no_hints1": {
            "is_readable": true,
            "is_movable": true,
            "is_flyable": false,
            "classname": "SynAxisNoHints",
            "module": "ophyd.sim",
            "components": {
                "readback": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "_ReadbackSignal",
                    "module": "ophyd.sim"
                },
                "setpoint": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "_SetpointSignal",
                    "module": "ophyd.sim"
                },
                "velocity": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "acceleration": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "unused": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                }
            }
        },
        "motor1": {
            "is_readable": true,
            "is_movable": true,
            "is_flyable": false,
            "classname": "SynAxis",
            "module": "ophyd.sim",
            "components": {
                "readback": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "_ReadbackSignal",
                    "module": "ophyd.sim"
                },
                "setpoint": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "_SetpointSignal",
                    "module": "ophyd.sim"
                },
                "velocity": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "acceleration": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "unused": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                }
            }
        },
        "jittery_motor2": {
            "is_readable": true,
            "is_movable": true,
            "is_flyable": false,
            "classname": "SynAxis",
            "module": "ophyd.sim",
            "components": {
                "readback": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "_ReadbackSignal",
                    "module": "ophyd.sim"
                },
                "setpoint": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "_SetpointSignal",
                    "module": "ophyd.sim"
                },
                "velocity": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "acceleration": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "unused": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                }
            }
        },
        "det1": {
            "is_readable": true,
            "is_movable": false,
            "is_flyable": false,
            "classname": "SynGauss",
            "module": "ophyd.sim",
            "components": {
                "val": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "SynSignal",
                    "module": "ophyd.sim"
                },
                "Imax": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "center": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "sigma": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "noise": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "EnumSignal",
                    "module": "ophyd.sim"
                },
                "noise_multiplier": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                }
            }
        },
        "invariant2": {
            "is_readable": true,
            "is_movable": true,
            "is_flyable": false,
            "classname": "InvariantSignal",
            "module": "ophyd.sim"
        },
        "motor_empty_hints2": {
            "is_readable": true,
            "is_movable": true,
            "is_flyable": false,
            "classname": "SynAxisEmptyHints",
            "module": "ophyd.sim",
            "components": {
                "readback": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "_ReadbackSignal",
                    "module": "ophyd.sim"
                },
                "setpoint": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "_SetpointSignal",
                    "module": "ophyd.sim"
                },
                "velocity": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "acceleration": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "unused": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                }
            }
        },
        "img": {
            "is_readable": true,
            "is_movable": true,
            "is_flyable": false,
            "classname": "SynSignalWithRegistry",
            "module": "ophyd.sim"
        },
        "identical_det": {
            "is_readable": true,
            "is_movable": false,
            "is_flyable": false,
            "classname": "SynGauss",
            "module": "ophyd.sim",
            "components": {
                "val": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "SynSignal",
                    "module": "ophyd.sim"
                },
                "Imax": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "center": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "sigma": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "noise": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "EnumSignal",
                    "module": "ophyd.sim"
                },
                "noise_multiplier": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                }
            }
        },
        "sim_bundle_A": {
            "is_readable": true,
            "is_movable": false,
            "is_flyable": false,
            "classname": "SimBundle",
            "module": "__main__",
            "components": {
                "mtrs": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "SimStage",
                    "module": "__main__",
                    "components": {
                        "x": {
                            "is_readable": true,
                            "is_movable": true,
                            "is_flyable": false,
                            "classname": "SynAxis",
                            "module": "ophyd.sim",
                            "components": {
                                "readback": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "_ReadbackSignal",
                                    "module": "ophyd.sim"
                                },
                                "setpoint": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "_SetpointSignal",
                                    "module": "ophyd.sim"
                                },
                                "velocity": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "Signal",
                                    "module": "ophyd.signal"
                                },
                                "acceleration": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "Signal",
                                    "module": "ophyd.signal"
                                },
                                "unused": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "Signal",
                                    "module": "ophyd.signal"
                                }
                            }
                        },
                        "y": {
                            "is_readable": true,
                            "is_movable": true,
                            "is_flyable": false,
                            "classname": "SynAxis",
                            "module": "ophyd.sim",
                            "components": {
                                "readback": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "_ReadbackSignal",
                                    "module": "ophyd.sim"
                                },
                                "setpoint": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "_SetpointSignal",
                                    "module": "ophyd.sim"
                                },
                                "velocity": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "Signal",
                                    "module": "ophyd.signal"
                                },
                                "acceleration": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "Signal",
                                    "module": "ophyd.signal"
                                },
                                "unused": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "Signal",
                                    "module": "ophyd.signal"
                                }
                            }
                        },
                        "z": {
                            "is_readable": true,
                            "is_movable": true,
                            "is_flyable": false,
                            "classname": "SynAxis",
                            "module": "ophyd.sim",
                            "components": {
                                "readback": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "_ReadbackSignal",
                                    "module": "ophyd.sim"
                                },
                                "setpoint": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "_SetpointSignal",
                                    "module": "ophyd.sim"
                                },
                                "velocity": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "Signal",
                                    "module": "ophyd.signal"
                                },
                                "acceleration": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "Signal",
                                    "module": "ophyd.signal"
                                },
                                "unused": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "Signal",
                                    "module": "ophyd.signal"
                                }
                            }
                        }
                    }
                },
                "dets": {
                    "is_readable": true,
                    "is_movable": false,
                    "is_flyable": false,
                    "classname": "SimDetectors",
                    "module": "__main__",
                    "components": {
                        "det_A": {
                            "is_readable": true,
                            "is_movable": false,
                            "is_flyable": false,
                            "classname": "SynGauss",
                            "module": "ophyd.sim",
                            "components": {
                                "val": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "SynSignal",
                                    "module": "ophyd.sim"
                                },
                                "Imax": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "Signal",
                                    "module": "ophyd.signal"
                                },
                                "center": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "Signal",
                                    "module": "ophyd.signal"
                                },
                                "sigma": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "Signal",
                                    "module": "ophyd.signal"
                                },
                                "noise": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "EnumSignal",
                                    "module": "ophyd.sim"
                                },
                                "noise_multiplier": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "Signal",
                                    "module": "ophyd.signal"
                                }
                            }
                        },
                        "det_B": {
                            "is_readable": true,
                            "is_movable": false,
                            "is_flyable": false,
                            "classname": "SynGauss",
                            "module": "ophyd.sim",
                            "components": {
                                "val": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "SynSignal",
                                    "module": "ophyd.sim"
                                },
                                "Imax": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "Signal",
                                    "module": "ophyd.signal"
                                },
                                "center": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "Signal",
                                    "module": "ophyd.signal"
                                },
                                "sigma": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "Signal",
                                    "module": "ophyd.signal"
                                },
                                "noise": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "EnumSignal",
                                    "module": "ophyd.sim"
                                },
                                "noise_multiplier": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "Signal",
                                    "module": "ophyd.signal"
                                }
                            }
                        }
                    }
                }
            }
        },
        "det": {
            "is_readable": true,
            "is_movable": false,
            "is_flyable": false,
            "classname": "SynGauss",
            "module": "ophyd.sim",
            "components": {
                "val": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "SynSignal",
                    "module": "ophyd.sim"
                },
                "Imax": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "center": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "sigma": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "noise": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "EnumSignal",
                    "module": "ophyd.sim"
                },
                "noise_multiplier": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                }
            }
        },
        "trivial_flyer": {
            "is_readable": false,
            "is_movable": false,
            "is_flyable": true,
            "classname": "TrivialFlyer",
            "module": "ophyd.sim"
        },
        "rand2": {
            "is_readable": true,
            "is_movable": true,
            "is_flyable": false,
            "classname": "SynPeriodicSignal",
            "module": "ophyd.sim"
        },
        "invariant1": {
            "is_readable": true,
            "is_movable": true,
            "is_flyable": false,
            "classname": "InvariantSignal",
            "module": "ophyd.sim"
        },
        "direct_img_list": {
            "is_readable": true,
            "is_movable": false,
            "is_flyable": false,
            "classname": "DirectImage",
            "module": "ophyd.sim",
            "components": {
                "img": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "SynSignal",
                    "module": "ophyd.sim"
                }
            }
        },
        "sig": {
            "is_readable": true,
            "is_movable": true,
            "is_flyable": false,
            "classname": "Signal",
            "module": "ophyd.signal"
        },
        "sim_m1": {
            "is_readable": true,
            "is_movable": true,
            "is_flyable": false,
            "classname": "EpicsSignal",
            "module": "ophyd.signal"
        },
        "det5": {
            "is_readable": true,
            "is_movable": false,
            "is_flyable": false,
            "classname": "Syn2DGauss",
            "module": "ophyd.sim",
            "components": {
                "val": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "SynSignal",
                    "module": "ophyd.sim"
                },
                "Imax": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "center": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "sigma": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "noise": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "EnumSignal",
                    "module": "ophyd.sim"
                },
                "noise_multiplier": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                }
            }
        },
        "sim_m2": {
            "is_readable": true,
            "is_movable": true,
            "is_flyable": false,
            "classname": "EpicsSignal",
            "module": "ophyd.signal"
        },
        "custom_test_signal": {
            "is_readable": true,
            "is_movable": true,
            "is_flyable": false,
            "classname": "Signal",
            "module": "ophyd.signal"
        },
        "pseudo1x3": {
            "is_readable": true,
            "is_movable": true,
            "is_flyable": false,
            "classname": "SPseudo1x3",
            "module": "ophyd.sim",
            "components": {
                "pseudo1": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "PseudoSingle",
                    "module": "ophyd.pseudopos",
                    "components": {
                        "readback": {
                            "is_readable": true,
                            "is_movable": true,
                            "is_flyable": false,
                            "classname": "AttributeSignal",
                            "module": "ophyd.signal"
                        },
                        "setpoint": {
                            "is_readable": true,
                            "is_movable": true,
                            "is_flyable": false,
                            "classname": "AttributeSignal",
                            "module": "ophyd.signal"
                        }
                    }
                },
                "real1": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "SoftPositioner",
                    "module": "ophyd.positioner"
                },
                "real2": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "SoftPositioner",
                    "module": "ophyd.positioner"
                },
                "real3": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "SoftPositioner",
                    "module": "ophyd.positioner"
                }
            }
        },
        "ab_det": {
            "is_readable": true,
            "is_movable": false,
            "is_flyable": false,
            "classname": "ABDetector",
            "module": "ophyd.sim",
            "components": {
                "a": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "SynSignal",
                    "module": "ophyd.sim"
                },
                "b": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "SynSignal",
                    "module": "ophyd.sim"
                }
            }
        },
        "det2": {
            "is_readable": true,
            "is_movable": false,
            "is_flyable": false,
            "classname": "SynGauss",
            "module": "ophyd.sim",
            "components": {
                "val": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "SynSignal",
                    "module": "ophyd.sim"
                },
                "Imax": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "center": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "sigma": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "noise": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "EnumSignal",
                    "module": "ophyd.sim"
                },
                "noise_multiplier": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                }
            }
        },
        "custom_test_device": {
            "is_readable": true,
            "is_movable": false,
            "is_flyable": false,
            "classname": "Device",
            "module": "ophyd.device"
        },
        "direct_img": {
            "is_readable": true,
            "is_movable": false,
            "is_flyable": false,
            "classname": "DirectImage",
            "module": "ophyd.sim",
            "components": {
                "img": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "SynSignal",
                    "module": "ophyd.sim"
                }
            }
        },
        "motor_no_pos": {
            "is_readable": true,
            "is_movable": true,
            "is_flyable": false,
            "classname": "SynAxisNoPosition",
            "module": "ophyd.sim",
            "components": {
                "readback": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "_ReadbackSignal",
                    "module": "ophyd.sim"
                },
                "setpoint": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "_SetpointSignal",
                    "module": "ophyd.sim"
                },
                "velocity": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "acceleration": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "unused": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                }
            }
        },
        "motor_empty_hints1": {
            "is_readable": true,
            "is_movable": true,
            "is_flyable": false,
            "classname": "SynAxisEmptyHints",
            "module": "ophyd.sim",
            "components": {
                "readback": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "_ReadbackSignal",
                    "module": "ophyd.sim"
                },
                "setpoint": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "_SetpointSignal",
                    "module": "ophyd.sim"
                },
                "velocity": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "acceleration": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "unused": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                }
            }
        },
        "bool_sig": {
            "is_readable": true,
            "is_movable": true,
            "is_flyable": false,
            "classname": "Signal",
            "module": "ophyd.signal"
        },
        "det3": {
            "is_readable": true,
            "is_movable": false,
            "is_flyable": false,
            "classname": "SynGauss",
            "module": "ophyd.sim",
            "components": {
                "val": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "SynSignal",
                    "module": "ophyd.sim"
                },
                "Imax": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "center": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "sigma": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "noise": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "EnumSignal",
                    "module": "ophyd.sim"
                },
                "noise_multiplier": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                }
            }
        },
        "sim_m4": {
            "is_readable": true,
            "is_movable": true,
            "is_flyable": false,
            "classname": "EpicsSignal",
            "module": "ophyd.signal"
        },
        "signal": {
            "is_readable": true,
            "is_movable": true,
            "is_flyable": false,
            "classname": "SynSignal",
            "module": "ophyd.sim"
        },
        "det_with_count_time": {
            "is_readable": true,
            "is_movable": false,
            "is_flyable": false,
            "classname": "DetWithCountTime",
            "module": "ophyd.sim",
            "components": {
                "intensity": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "SynSignal",
                    "module": "ophyd.sim"
                },
                "count_time": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                }
            }
        },
        "sim_bundle_B": {
            "is_readable": true,
            "is_movable": false,
            "is_flyable": false,
            "classname": "SimBundle",
            "module": "__main__",
            "components": {
                "mtrs": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "SimStage",
                    "module": "__main__",
                    "components": {
                        "x": {
                            "is_readable": true,
                            "is_movable": true,
                            "is_flyable": false,
                            "classname": "SynAxis",
                            "module": "ophyd.sim",
                            "components": {
                                "readback": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "_ReadbackSignal",
                                    "module": "ophyd.sim"
                                },
                                "setpoint": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "_SetpointSignal",
                                    "module": "ophyd.sim"
                                },
                                "velocity": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "Signal",
                                    "module": "ophyd.signal"
                                },
                                "acceleration": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "Signal",
                                    "module": "ophyd.signal"
                                },
                                "unused": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "Signal",
                                    "module": "ophyd.signal"
                                }
                            }
                        },
                        "y": {
                            "is_readable": true,
                            "is_movable": true,
                            "is_flyable": false,
                            "classname": "SynAxis",
                            "module": "ophyd.sim",
                            "components": {
                                "readback": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "_ReadbackSignal",
                                    "module": "ophyd.sim"
                                },
                                "setpoint": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "_SetpointSignal",
                                    "module": "ophyd.sim"
                                },
                                "velocity": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "Signal",
                                    "module": "ophyd.signal"
                                },
                                "acceleration": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "Signal",
                                    "module": "ophyd.signal"
                                },
                                "unused": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "Signal",
                                    "module": "ophyd.signal"
                                }
                            }
                        },
                        "z": {
                            "is_readable": true,
                            "is_movable": true,
                            "is_flyable": false,
                            "classname": "SynAxis",
                            "module": "ophyd.sim",
                            "components": {
                                "readback": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "_ReadbackSignal",
                                    "module": "ophyd.sim"
                                },
                                "setpoint": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "_SetpointSignal",
                                    "module": "ophyd.sim"
                                },
                                "velocity": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "Signal",
                                    "module": "ophyd.signal"
                                },
                                "acceleration": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "Signal",
                                    "module": "ophyd.signal"
                                },
                                "unused": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "Signal",
                                    "module": "ophyd.signal"
                                }
                            }
                        }
                    }
                },
                "dets": {
                    "is_readable": true,
                    "is_movable": false,
                    "is_flyable": false,
                    "classname": "SimDetectors",
                    "module": "__main__",
                    "components": {
                        "det_A": {
                            "is_readable": true,
                            "is_movable": false,
                            "is_flyable": false,
                            "classname": "SynGauss",
                            "module": "ophyd.sim",
                            "components": {
                                "val": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "SynSignal",
                                    "module": "ophyd.sim"
                                },
                                "Imax": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "Signal",
                                    "module": "ophyd.signal"
                                },
                                "center": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "Signal",
                                    "module": "ophyd.signal"
                                },
                                "sigma": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "Signal",
                                    "module": "ophyd.signal"
                                },
                                "noise": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "EnumSignal",
                                    "module": "ophyd.sim"
                                },
                                "noise_multiplier": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "Signal",
                                    "module": "ophyd.signal"
                                }
                            }
                        },
                        "det_B": {
                            "is_readable": true,
                            "is_movable": false,
                            "is_flyable": false,
                            "classname": "SynGauss",
                            "module": "ophyd.sim",
                            "components": {
                                "val": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "SynSignal",
                                    "module": "ophyd.sim"
                                },
                                "Imax": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "Signal",
                                    "module": "ophyd.signal"
                                },
                                "center": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "Signal",
                                    "module": "ophyd.signal"
                                },
                                "sigma": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "Signal",
                                    "module": "ophyd.signal"
                                },
                                "noise": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "EnumSignal",
                                    "module": "ophyd.sim"
                                },
                                "noise_multiplier": {
                                    "is_readable": true,
                                    "is_movable": true,
                                    "is_flyable": false,
                                    "classname": "Signal",
                                    "module": "ophyd.signal"
                                }
                            }
                        }
                    }
                }
            }
        },
        "rand": {
            "is_readable": true,
            "is_movable": true,
            "is_flyable": false,
            "classname": "SynPeriodicSignal",
            "module": "ophyd.sim"
        },
        "pseudo3x3": {
            "is_readable": true,
            "is_movable": true,
            "is_flyable": false,
            "classname": "SPseudo3x3",
            "module": "ophyd.sim",
            "components": {
                "pseudo1": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "PseudoSingle",
                    "module": "ophyd.pseudopos",
                    "components": {
                        "readback": {
                            "is_readable": true,
                            "is_movable": true,
                            "is_flyable": false,
                            "classname": "AttributeSignal",
                            "module": "ophyd.signal"
                        },
                        "setpoint": {
                            "is_readable": true,
                            "is_movable": true,
                            "is_flyable": false,
                            "classname": "AttributeSignal",
                            "module": "ophyd.signal"
                        }
                    }
                },
                "pseudo2": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "PseudoSingle",
                    "module": "ophyd.pseudopos",
                    "components": {
                        "readback": {
                            "is_readable": true,
                            "is_movable": true,
                            "is_flyable": false,
                            "classname": "AttributeSignal",
                            "module": "ophyd.signal"
                        },
                        "setpoint": {
                            "is_readable": true,
                            "is_movable": true,
                            "is_flyable": false,
                            "classname": "AttributeSignal",
                            "module": "ophyd.signal"
                        }
                    }
                },
                "pseudo3": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "PseudoSingle",
                    "module": "ophyd.pseudopos",
                    "components": {
                        "readback": {
                            "is_readable": true,
                            "is_movable": true,
                            "is_flyable": false,
                            "classname": "AttributeSignal",
                            "module": "ophyd.signal"
                        },
                        "setpoint": {
                            "is_readable": true,
                            "is_movable": true,
                            "is_flyable": false,
                            "classname": "AttributeSignal",
                            "module": "ophyd.signal"
                        }
                    }
                },
                "real1": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "SoftPositioner",
                    "module": "ophyd.positioner"
                },
                "real2": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "SoftPositioner",
                    "module": "ophyd.positioner"
                },
                "real3": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "SoftPositioner",
                    "module": "ophyd.positioner"
                },
                "sig": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                }
            }
        },
        "motor_no_hints2": {
            "is_readable": true,
            "is_movable": true,
            "is_flyable": false,
            "classname": "SynAxisNoHints",
            "module": "ophyd.sim",
            "components": {
                "readback": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "_ReadbackSignal",
                    "module": "ophyd.sim"
                },
                "setpoint": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "_SetpointSignal",
                    "module": "ophyd.sim"
                },
                "velocity": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "acceleration": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "unused": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                }
            }
        },
        "sim_m3": {
            "is_readable": true,
            "is_movable": true,
            "is_flyable": false,
            "classname": "EpicsSignal",
            "module": "ophyd.signal"
        },
        "motor2": {
            "is_readable": true,
            "is_movable": true,
            "is_flyable": false,
            "classname": "SynAxis",
            "module": "ophyd.sim",
            "components": {
                "readback": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "_ReadbackSignal",
                    "module": "ophyd.sim"
                },
                "setpoint": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "_SetpointSignal",
                    "module": "ophyd.sim"
                },
                "velocity": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "acceleration": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "unused": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                }
            }
        },
        "jittery_motor1": {
            "is_readable": true,
            "is_movable": true,
            "is_flyable": false,
            "classname": "SynAxis",
            "module": "ophyd.sim",
            "components": {
                "readback": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "_ReadbackSignal",
                    "module": "ophyd.sim"
                },
                "setpoint": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "_SetpointSignal",
                    "module": "ophyd.sim"
                },
                "velocity": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "acceleration": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "unused": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                }
            }
        },
        "det4": {
            "is_readable": true,
            "is_movable": false,
            "is_flyable": false,
            "classname": "Syn2DGauss",
            "module": "ophyd.sim",
            "components": {
                "val": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "SynSignal",
                    "module": "ophyd.sim"
                },
                "Imax": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "center": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "sigma": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "noise": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "EnumSignal",
                    "module": "ophyd.sim"
                },
                "noise_multiplier": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                }
            }
        },
        "det_with_conf": {
            "is_readable": true,
            "is_movable": false,
            "is_flyable": false,
            "classname": "DetWithConf",
            "module": "ophyd.sim",
            "components": {
                "a": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "SynSignal",
                    "module": "ophyd.sim"
                },
                "b": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "SynSignal",
                    "module": "ophyd.sim"
                },
                "c": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "SynSignal",
                    "module": "ophyd.sim"
                },
                "d": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "SynSignal",
                    "module": "ophyd.sim"
                }
            }
        },
        "flyer1": {
            "is_readable": false,
            "is_movable": false,
            "is_flyable": true,
            "classname": "MockFlyer",
            "module": "ophyd.sim"
        },
        "motor3": {
            "is_readable": true,
            "is_movable": true,
            "is_flyable": false,
            "classname": "SynAxis",
            "module": "ophyd.sim",
            "components": {
                "readback": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "_ReadbackSignal",
                    "module": "ophyd.sim"
                },
                "setpoint": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "_SetpointSignal",
                    "module": "ophyd.sim"
                },
                "velocity": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "acceleration": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "unused": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                }
            }
        },
        "new_trivial_flyer": {
            "is_readable": false,
            "is_movable": false,
            "is_flyable": true,
            "classname": "NewTrivialFlyer",
            "module": "ophyd.sim"
        },
        "custom_test_flyer": {
            "is_readable": false,
            "is_movable": false,
            "is_flyable": true,
            "classname": "MockFlyer",
            "module": "ophyd.sim"
        },
        "flyer2": {
            "is_readable": false,
            "is_movable": false,
            "is_flyable": true,
            "classname": "MockFlyer",
            "module": "ophyd.sim"
        },
        "motor": {
            "is_readable": true,
            "is_movable": true,
            "is_flyable": false,
            "classname": "SynAxis",
            "module": "ophyd.sim",
            "components": {
                "readback": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "_ReadbackSignal",
                    "module": "ophyd.sim"
                },
                "setpoint": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "_SetpointSignal",
                    "module": "ophyd.sim"
                },
                "velocity": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "acceleration": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                },
                "unused": {
                    "is_readable": true,
                    "is_movable": true,
                    "is_flyable": false,
                    "classname": "Signal",
                    "module": "ophyd.signal"
                }
            }
        }
    },
    "devices_allowed_uid": "6c737d64-1567-42be-8d91-713dacda17cf"
};

export const mockGetPlansAllowedResponse: GetPlansAllowedResponse = {
    "success": true,
    "msg": "",
    "plans_allowed": {
        "log_scan": {
            "name": "log_scan",
            "properties": {
                "is_generator": true
            },
            "parameters": [
                {
                    "name": "detectors",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "list of 'readable' objects"
                },
                {
                    "name": "motor",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "any 'settable' object (motor, temp controller, etc.)"
                },
                {
                    "name": "start",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "starting position of motor"
                },
                {
                    "name": "stop",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "ending position of motor"
                },
                {
                    "name": "num",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "number of steps"
                },
                {
                    "name": "per_step",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "hook for customizing action of inner loop (messages per step)\nExpected signature: ``f(detectors, motor, step)``",
                    "default": "None"
                },
                {
                    "name": "md",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "metadata",
                    "default": "None"
                }
            ],
            "module": "bluesky.plans",
            "description": "Scan over one variable in log-spaced steps."
        },
        "spiral_square": {
            "name": "spiral_square",
            "properties": {
                "is_generator": true
            },
            "parameters": [
                {
                    "name": "detectors",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "list of 'readable' objects"
                },
                {
                    "name": "x_motor",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "any 'settable' object (motor, temp controller, etc.)"
                },
                {
                    "name": "y_motor",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "any 'settable' object (motor, temp controller, etc.)"
                },
                {
                    "name": "x_center",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "x center"
                },
                {
                    "name": "y_center",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "y center"
                },
                {
                    "name": "x_range",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "x width of spiral"
                },
                {
                    "name": "y_range",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "y width of spiral"
                },
                {
                    "name": "x_num",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "number of x axis points"
                },
                {
                    "name": "y_num",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "Number of y axis points."
                },
                {
                    "name": "per_step",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "hook for cutomizing action of inner loop (messages per step).\nSee docstring of :func:`bluesky.plans.one_nd_step` (the default) for\ndetails.",
                    "default": "None"
                },
                {
                    "name": "md",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "metadata",
                    "default": "None"
                }
            ],
            "module": "bluesky.plans",
            "description": "Absolute square spiral scan, centered around (x_center, y_center)"
        },
        "count": {
            "name": "count",
            "properties": {
                "is_generator": true
            },
            "parameters": [
                {
                    "name": "detectors",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "list of 'readable' objects"
                },
                {
                    "name": "num",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "number of readings to take; default is 1\n\nIf None, capture data until canceled",
                    "default": "1"
                },
                {
                    "name": "delay",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "Time delay in seconds between successive readings; default is 0.",
                    "default": "None"
                },
                {
                    "name": "per_shot",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "hook for customizing action of inner loop (messages per step)\nExpected signature ::\n\n   def f(detectors: Iterable[OphydObj]) -> Generator[Msg]:\n       ...",
                    "default": "None"
                },
                {
                    "name": "md",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "metadata",
                    "default": "None"
                }
            ],
            "module": "bluesky.plans",
            "description": "Take one or more readings from detectors."
        },
        "tune_centroid": {
            "name": "tune_centroid",
            "properties": {
                "is_generator": true
            },
            "parameters": [
                {
                    "name": "detectors",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "list of 'readable' objects"
                },
                {
                    "name": "signal",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "detector field whose output is to maximize"
                },
                {
                    "name": "motor",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "any 'settable' object (motor, temp controller, etc.)"
                },
                {
                    "name": "start",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "start of range"
                },
                {
                    "name": "stop",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "end of range, note: start < stop"
                },
                {
                    "name": "min_step",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "smallest step size to use."
                },
                {
                    "name": "num",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "number of points with each traversal, default = 10",
                    "default": "10"
                },
                {
                    "name": "step_factor",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "used in calculating new range after each pass\n\nnote: step_factor > 1.0, default = 3",
                    "default": "3.0"
                },
                {
                    "name": "snake",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "if False (default), always scan from start to stop",
                    "default": "False"
                },
                {
                    "name": "md",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "metadata",
                    "default": "None"
                }
            ],
            "module": "bluesky.plans",
            "description": "plan: tune a motor to the centroid of signal(motor)"
        },
        "rel_grid_scan": {
            "name": "rel_grid_scan",
            "properties": {
                "is_generator": true
            },
            "parameters": [
                {
                    "name": "detectors",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "list of 'readable' objects"
                },
                {
                    "name": "args",
                    "kind": {
                        "name": "VAR_POSITIONAL",
                        "value": 2
                    }
                },
                {
                    "name": "snake_axes",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "which axes should be snaked, either ``False`` (do not snake any axes),\n``True`` (snake all axes) or a list of axes to snake. \"Snaking\" an axis\nis defined as following snake-like, winding trajectory instead of a\nsimple left-to-right trajectory. The elements of the list are motors\nthat are listed in `args`. The list must not contain the slowest\n(first) motor, since it can't be snaked.",
                    "default": "None"
                },
                {
                    "name": "per_step",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "hook for customizing action of inner loop (messages per step).\nSee docstring of :func:`bluesky.plan_stubs.one_nd_step` (the default)\nfor details.",
                    "default": "None"
                },
                {
                    "name": "md",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "metadata",
                    "default": "None"
                }
            ],
            "module": "bluesky.plans",
            "description": "Scan over a mesh relative to current position."
        },
        "count_bundle_test": {
            "name": "count_bundle_test",
            "properties": {
                "is_generator": true
            },
            "parameters": [
                {
                    "name": "detectors",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "annotation": {
                        "type": "typing.List[DetList]",
                        "devices": {
                            "DetList": [
                                "det",
                                "det1",
                                "det2",
                                "det3",
                                "sim_bundle_A",
                                "sim_bundle_A.dets",
                                "sim_bundle_A.dets.det_A",
                                "sim_bundle_A.dets.det_A.center",
                                "sim_bundle_A.dets.det_A.Imax",
                                "sim_bundle_A.dets.det_A.noise",
                                "sim_bundle_A.dets.det_A.noise_multiplier",
                                "sim_bundle_A.dets.det_A.sigma",
                                "sim_bundle_A.dets.det_A.val",
                                "sim_bundle_A.dets.det_B",
                                "sim_bundle_A.dets.det_B.center",
                                "sim_bundle_A.dets.det_B.Imax",
                                "sim_bundle_A.dets.det_B.noise",
                                "sim_bundle_A.dets.det_B.noise_multiplier",
                                "sim_bundle_A.dets.det_B.sigma",
                                "sim_bundle_A.dets.det_B.val",
                                "sim_bundle_A.mtrs",
                                "sim_bundle_A.mtrs.x",
                                "sim_bundle_A.mtrs.x.acceleration",
                                "sim_bundle_A.mtrs.x.readback",
                                "sim_bundle_A.mtrs.x.setpoint",
                                "sim_bundle_A.mtrs.x.unused",
                                "sim_bundle_A.mtrs.x.velocity",
                                "sim_bundle_A.mtrs.y",
                                "sim_bundle_A.mtrs.y.acceleration",
                                "sim_bundle_A.mtrs.y.readback",
                                "sim_bundle_A.mtrs.y.setpoint",
                                "sim_bundle_A.mtrs.y.unused",
                                "sim_bundle_A.mtrs.y.velocity",
                                "sim_bundle_A.mtrs.z",
                                "sim_bundle_A.mtrs.z.acceleration",
                                "sim_bundle_A.mtrs.z.readback",
                                "sim_bundle_A.mtrs.z.setpoint",
                                "sim_bundle_A.mtrs.z.unused",
                                "sim_bundle_A.mtrs.z.velocity",
                                "sim_bundle_B",
                                "sim_bundle_B.dets",
                                "sim_bundle_B.dets.det_A",
                                "sim_bundle_B.dets.det_A.center",
                                "sim_bundle_B.dets.det_A.Imax",
                                "sim_bundle_B.dets.det_A.noise",
                                "sim_bundle_B.dets.det_A.noise_multiplier",
                                "sim_bundle_B.dets.det_A.sigma",
                                "sim_bundle_B.dets.det_A.val",
                                "sim_bundle_B.dets.det_B",
                                "sim_bundle_B.dets.det_B.center",
                                "sim_bundle_B.dets.det_B.Imax",
                                "sim_bundle_B.dets.det_B.noise",
                                "sim_bundle_B.dets.det_B.noise_multiplier",
                                "sim_bundle_B.dets.det_B.sigma",
                                "sim_bundle_B.dets.det_B.val",
                                "sim_bundle_B.mtrs",
                                "sim_bundle_B.mtrs.x",
                                "sim_bundle_B.mtrs.x.acceleration",
                                "sim_bundle_B.mtrs.x.readback",
                                "sim_bundle_B.mtrs.x.setpoint",
                                "sim_bundle_B.mtrs.x.unused",
                                "sim_bundle_B.mtrs.x.velocity",
                                "sim_bundle_B.mtrs.y",
                                "sim_bundle_B.mtrs.y.acceleration",
                                "sim_bundle_B.mtrs.y.readback",
                                "sim_bundle_B.mtrs.y.setpoint",
                                "sim_bundle_B.mtrs.y.unused",
                                "sim_bundle_B.mtrs.y.velocity",
                                "sim_bundle_B.mtrs.z",
                                "sim_bundle_B.mtrs.z.acceleration",
                                "sim_bundle_B.mtrs.z.readback",
                                "sim_bundle_B.mtrs.z.setpoint",
                                "sim_bundle_B.mtrs.z.unused",
                                "sim_bundle_B.mtrs.z.velocity"
                            ]
                        }
                    }
                },
                {
                    "name": "num",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "default": "1"
                },
                {
                    "name": "delay",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "default": "None"
                },
                {
                    "name": "per_shot",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "default": "None"
                },
                {
                    "name": "md",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "default": "None"
                }
            ],
            "module": "__main__"
        },
        "sim_multirun_plan_nested": {
            "name": "sim_multirun_plan_nested",
            "properties": {
                "is_generator": true
            },
            "parameters": [
                {
                    "name": "npts",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "The number of measurements in the outer run. Inner run will contain 'npts+1' measurements.",
                    "annotation": {
                        "type": "int"
                    }
                },
                {
                    "name": "delay",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "Delay between measurements.",
                    "annotation": {
                        "type": "float"
                    },
                    "default": "1.0"
                }
            ],
            "module": "__main__",
            "description": "Simulated multi-run plan: two nested runs. The plan is included for testing purposes only."
        },
        "rel_spiral": {
            "name": "rel_spiral",
            "properties": {
                "is_generator": true
            },
            "parameters": [
                {
                    "name": "detectors",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    }
                },
                {
                    "name": "x_motor",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "any 'settable' object (motor, temp controller, etc.)"
                },
                {
                    "name": "y_motor",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "any 'settable' object (motor, temp controller, etc.)"
                },
                {
                    "name": "x_range",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "x width of spiral"
                },
                {
                    "name": "y_range",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "y width of spiral"
                },
                {
                    "name": "dr",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "Delta radius along the minor axis of the ellipse."
                },
                {
                    "name": "nth",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "Number of theta steps"
                },
                {
                    "name": "dr_y",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "Delta radius along the major axis of the ellipse. If None, it\ndefaults to dr.",
                    "default": "None"
                },
                {
                    "name": "tilt",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "Tilt angle in radians, default 0.0",
                    "default": "0.0"
                },
                {
                    "name": "per_step",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "hook for customizing action of inner loop (messages per step).\nSee docstring of :func:`bluesky.plan_stubs.one_nd_step` (the default)\nfor details.",
                    "default": "None"
                },
                {
                    "name": "md",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "metadata",
                    "default": "None"
                }
            ],
            "module": "bluesky.plans",
            "description": "Relative spiral scan"
        },
        "scan": {
            "name": "scan",
            "properties": {
                "is_generator": true
            },
            "parameters": [
                {
                    "name": "detectors",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "list of 'readable' objects"
                },
                {
                    "name": "args",
                    "kind": {
                        "name": "VAR_POSITIONAL",
                        "value": 2
                    },
                    "description": "For one dimension, ``motor, start, stop``.\nIn general:\n\n.. code-block:: python\n\n    motor1, start1, stop1,\n    motor2, start2, stop2,\n    ...,\n    motorN, startN, stopN\n\nMotors can be any 'settable' object (motor, temp controller, etc.)"
                },
                {
                    "name": "num",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "number of points",
                    "default": "None"
                },
                {
                    "name": "per_step",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "hook for customizing action of inner loop (messages per step).\nSee docstring of :func:`bluesky.plan_stubs.one_nd_step` (the default)\nfor details.",
                    "default": "None"
                },
                {
                    "name": "md",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "metadata",
                    "default": "None"
                }
            ],
            "module": "bluesky.plans",
            "description": "Scan over one multi-motor trajectory."
        },
        "marked_up_count": {
            "name": "marked_up_count",
            "properties": {
                "is_generator": true
            },
            "parameters": [
                {
                    "name": "detectors",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "annotation": {
                        "type": "typing.List[typing.Any]"
                    }
                },
                {
                    "name": "num",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "annotation": {
                        "type": "int"
                    },
                    "default": "1"
                },
                {
                    "name": "delay",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "annotation": {
                        "type": "typing.Optional[float]"
                    },
                    "default": "None"
                },
                {
                    "name": "md",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "annotation": {
                        "type": "typing.Optional[typing.Dict[str, typing.Any]]"
                    },
                    "default": "None"
                }
            ],
            "module": "__main__"
        },
        "fly": {
            "name": "fly",
            "properties": {
                "is_generator": true
            },
            "parameters": [
                {
                    "name": "flyers",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "objects that support the flyer interface"
                },
                {
                    "name": "md",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "metadata",
                    "default": "None"
                }
            ],
            "module": "bluesky.plans",
            "description": "Perform a fly scan with one or more 'flyers'."
        },
        "inner_product_scan": {
            "name": "inner_product_scan",
            "properties": {
                "is_generator": true
            },
            "parameters": [
                {
                    "name": "detectors",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    }
                },
                {
                    "name": "num",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    }
                },
                {
                    "name": "args",
                    "kind": {
                        "name": "VAR_POSITIONAL",
                        "value": 2
                    }
                },
                {
                    "name": "per_step",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "default": "None"
                },
                {
                    "name": "md",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "default": "None"
                }
            ],
            "module": "bluesky.plans"
        },
        "spiral_fermat": {
            "name": "spiral_fermat",
            "properties": {
                "is_generator": true
            },
            "parameters": [
                {
                    "name": "detectors",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "list of 'readable' objects"
                },
                {
                    "name": "x_motor",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "any 'settable' object (motor, temp controller, etc.)"
                },
                {
                    "name": "y_motor",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "any 'settable' object (motor, temp controller, etc.)"
                },
                {
                    "name": "x_start",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "x center"
                },
                {
                    "name": "y_start",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "y center"
                },
                {
                    "name": "x_range",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "x width of spiral"
                },
                {
                    "name": "y_range",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "y width of spiral"
                },
                {
                    "name": "dr",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "delta radius"
                },
                {
                    "name": "factor",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "radius gets divided by this"
                },
                {
                    "name": "dr_y",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "Delta radius along the major axis of the ellipse, if not specifed\ndefaults to dr.",
                    "default": "None"
                },
                {
                    "name": "tilt",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "Tilt angle in radians, default 0.0",
                    "default": "0.0"
                },
                {
                    "name": "per_step",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "hook for customizing action of inner loop (messages per step).\nSee docstring of :func:`bluesky.plan_stubs.one_nd_step` (the default)\nfor details.",
                    "default": "None"
                },
                {
                    "name": "md",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "metadata",
                    "default": "None"
                }
            ],
            "module": "bluesky.plans",
            "description": "Absolute fermat spiral scan, centered around (x_start, y_start)"
        },
        "rel_spiral_fermat": {
            "name": "rel_spiral_fermat",
            "properties": {
                "is_generator": true
            },
            "parameters": [
                {
                    "name": "detectors",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "list of 'readable' objects"
                },
                {
                    "name": "x_motor",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "any 'settable' object (motor, temp controller, etc.)"
                },
                {
                    "name": "y_motor",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "any 'settable' object (motor, temp controller, etc.)"
                },
                {
                    "name": "x_range",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "x width of spiral"
                },
                {
                    "name": "y_range",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "y width of spiral"
                },
                {
                    "name": "dr",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "delta radius"
                },
                {
                    "name": "factor",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "radius gets divided by this"
                },
                {
                    "name": "dr_y",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "Delta radius along the major axis of the ellipse, if not specifed\ndefaults to dr",
                    "default": "None"
                },
                {
                    "name": "tilt",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "Tilt angle in radians, default 0.0",
                    "default": "0.0"
                },
                {
                    "name": "per_step",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "hook for customizing action of inner loop (messages per step).\nSee docstring of :func:`bluesky.plan_stubs.one_nd_step` (the default)\nfor details.",
                    "default": "None"
                },
                {
                    "name": "md",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "metadata",
                    "default": "None"
                }
            ],
            "module": "bluesky.plans",
            "description": "Relative fermat spiral scan"
        },
        "adaptive_scan": {
            "name": "adaptive_scan",
            "properties": {
                "is_generator": true
            },
            "parameters": [
                {
                    "name": "detectors",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "list of 'readable' objects"
                },
                {
                    "name": "target_field",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "data field whose output is the focus of the adaptive tuning"
                },
                {
                    "name": "motor",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "any 'settable' object (motor, temp controller, etc.)"
                },
                {
                    "name": "start",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "starting position of motor"
                },
                {
                    "name": "stop",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "ending position of motor"
                },
                {
                    "name": "min_step",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "smallest step for fast-changing regions"
                },
                {
                    "name": "max_step",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "largest step for slow-chaning regions"
                },
                {
                    "name": "target_delta",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "desired fractional change in detector signal between steps"
                },
                {
                    "name": "backstep",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "whether backward steps are allowed -- this is concern with some motors"
                },
                {
                    "name": "threshold",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "threshold for going backward and rescanning a region, default is 0.8",
                    "default": "0.8"
                },
                {
                    "name": "md",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "metadata",
                    "default": "None"
                }
            ],
            "module": "bluesky.plans",
            "description": "Scan over one variable with adaptively tuned step size."
        },
        "rel_scan": {
            "name": "rel_scan",
            "properties": {
                "is_generator": true
            },
            "parameters": [
                {
                    "name": "detectors",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "list of 'readable' objects"
                },
                {
                    "name": "args",
                    "kind": {
                        "name": "VAR_POSITIONAL",
                        "value": 2
                    },
                    "description": "For one dimension, ``motor, start, stop``.\nIn general:\n\n.. code-block:: python\n\n    motor1, start1, stop1,\n    motor2, start2, start2,\n    ...,\n    motorN, startN, stopN,\n\nMotors can be any 'settable' object (motor, temp controller, etc.)"
                },
                {
                    "name": "num",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "number of points",
                    "default": "None"
                },
                {
                    "name": "per_step",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "hook for customizing action of inner loop (messages per step).\nSee docstring of :func:`bluesky.plan_stubs.one_nd_step` (the default)\nfor details.",
                    "default": "None"
                },
                {
                    "name": "md",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "metadata",
                    "default": "None"
                }
            ],
            "module": "bluesky.plans",
            "description": "Scan over one multi-motor trajectory relative to current position."
        },
        "tweak": {
            "name": "tweak",
            "properties": {
                "is_generator": true
            },
            "parameters": [
                {
                    "name": "detector",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    }
                },
                {
                    "name": "target_field",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "data field whose output is the focus of the adaptive tuning"
                },
                {
                    "name": "motor",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    }
                },
                {
                    "name": "step",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "initial suggestion for step size"
                },
                {
                    "name": "md",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "metadata",
                    "default": "None"
                }
            ],
            "module": "bluesky.plans",
            "description": "Move and motor and read a detector with an interactive prompt."
        },
        "ramp_plan": {
            "name": "ramp_plan",
            "properties": {
                "is_generator": true
            },
            "parameters": [
                {
                    "name": "go_plan",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "plan to start the ramp.  This will be run inside of a open/close\nrun.\n\nThis plan must return a `ophyd.StatusBase` object."
                },
                {
                    "name": "monitor_sig",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    }
                },
                {
                    "name": "inner_plan_func",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "generator which takes no input\n\nThis will be called for every data point.  This should create\none or more events."
                },
                {
                    "name": "take_pre_data",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "If True, add a pre data at beginning",
                    "default": "True"
                },
                {
                    "name": "timeout",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "If not None, the maximum time the ramp can run.\n\nIn seconds",
                    "default": "None"
                },
                {
                    "name": "period",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "If not None, take data no faster than this.  If None, take\ndata as fast as possible\n\nIf running the inner plan takes longer than `period` than take\ndata with no dead time.\n\nIn seconds.",
                    "default": "None"
                },
                {
                    "name": "md",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "default": "None"
                }
            ],
            "module": "bluesky.plans",
            "description": "Take data while ramping one or more positioners."
        },
        "grid_scan": {
            "name": "grid_scan",
            "properties": {
                "is_generator": true
            },
            "parameters": [
                {
                    "name": "detectors",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "list of 'readable' objects"
                },
                {
                    "name": "args",
                    "kind": {
                        "name": "VAR_POSITIONAL",
                        "value": 2
                    }
                },
                {
                    "name": "snake_axes",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "which axes should be snaked, either ``False`` (do not snake any axes),\n``True`` (snake all axes) or a list of axes to snake. \"Snaking\" an axis\nis defined as following snake-like, winding trajectory instead of a\nsimple left-to-right trajectory. The elements of the list are motors\nthat are listed in `args`. The list must not contain the slowest\n(first) motor, since it can't be snaked.",
                    "default": "None"
                },
                {
                    "name": "per_step",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "hook for customizing action of inner loop (messages per step).\nSee docstring of :func:`bluesky.plan_stubs.one_nd_step` (the default)\nfor details.",
                    "default": "None"
                },
                {
                    "name": "md",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "metadata",
                    "default": "None"
                }
            ],
            "module": "bluesky.plans",
            "description": "Scan over a mesh; each motor is on an independent trajectory."
        },
        "plan_test_progress_bars": {
            "name": "plan_test_progress_bars",
            "properties": {
                "is_generator": true
            },
            "parameters": [
                {
                    "name": "n_progress_bars",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "The number of progress bars to display.",
                    "annotation": {
                        "type": "int"
                    },
                    "default": "1"
                }
            ],
            "module": "__main__",
            "description": "Test visualization of progress bars."
        },
        "spiral": {
            "name": "spiral",
            "properties": {
                "is_generator": true
            },
            "parameters": [
                {
                    "name": "detectors",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    }
                },
                {
                    "name": "x_motor",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "any 'settable' object (motor, temp controller, etc.)"
                },
                {
                    "name": "y_motor",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "any 'settable' object (motor, temp controller, etc.)"
                },
                {
                    "name": "x_start",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "x center"
                },
                {
                    "name": "y_start",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "y center"
                },
                {
                    "name": "x_range",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "x width of spiral"
                },
                {
                    "name": "y_range",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "y width of spiral"
                },
                {
                    "name": "dr",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "Delta radius along the minor axis of the ellipse."
                },
                {
                    "name": "nth",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "Number of theta steps"
                },
                {
                    "name": "dr_y",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "Delta radius along the major axis of the ellipse. If None, defaults to\ndr.",
                    "default": "None"
                },
                {
                    "name": "tilt",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "Tilt angle in radians, default 0.0",
                    "default": "0.0"
                },
                {
                    "name": "per_step",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "hook for customizing action of inner loop (messages per step).\nSee docstring of :func:`bluesky.plan_stubs.one_nd_step` (the default)\nfor details.",
                    "default": "None"
                },
                {
                    "name": "md",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "metadata",
                    "default": "None"
                }
            ],
            "module": "bluesky.plans",
            "description": "Spiral scan, centered around (x_start, y_start)"
        },
        "rel_log_scan": {
            "name": "rel_log_scan",
            "properties": {
                "is_generator": true
            },
            "parameters": [
                {
                    "name": "detectors",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "list of 'readable' objects"
                },
                {
                    "name": "motor",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "any 'settable' object (motor, temp controller, etc.)"
                },
                {
                    "name": "start",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "starting position of motor"
                },
                {
                    "name": "stop",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "ending position of motor"
                },
                {
                    "name": "num",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "number of steps"
                },
                {
                    "name": "per_step",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "hook for customizing action of inner loop (messages per step)\nExpected signature: ``f(detectors, motor, step)``",
                    "default": "None"
                },
                {
                    "name": "md",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "metadata",
                    "default": "None"
                }
            ],
            "module": "bluesky.plans",
            "description": "Scan over one variable in log-spaced steps relative to current position."
        },
        "move_then_count": {
            "name": "move_then_count",
            "properties": {
                "is_generator": true
            },
            "parameters": [
                {
                    "name": "motors",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "List of motors to be moved into specified positions before the measurement",
                    "annotation": {
                        "type": "typing.List[Motors]",
                        "devices": {
                            "Motors": [
                                "motor1",
                                "motor2"
                            ]
                        }
                    }
                },
                {
                    "name": "detectors",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "Detectors to use for measurement.",
                    "annotation": {
                        "type": "typing.List[Detectors]",
                        "devices": {
                            "Detectors": [
                                "det1",
                                "det2",
                                "det3"
                            ]
                        }
                    },
                    "default": "['det1', 'det2']",
                    "default_defined_in_decorator": true
                },
                {
                    "name": "positions",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "Motor positions. The number of positions must be equal to the number of the motors.",
                    "annotation": {
                        "type": "typing.List[float]"
                    },
                    "default": "None",
                    "min": "-10",
                    "max": "10",
                    "step": "0.01"
                }
            ],
            "module": "__main__",
            "description": "Move motors into positions; then count dets."
        },
        "list_grid_scan": {
            "name": "list_grid_scan",
            "properties": {
                "is_generator": true
            },
            "parameters": [
                {
                    "name": "detectors",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "list of 'readable' objects"
                },
                {
                    "name": "args",
                    "kind": {
                        "name": "VAR_POSITIONAL",
                        "value": 2
                    },
                    "description": "patterned like (``motor1, position_list1,``\n                ``motor2, position_list2,``\n                ``motor3, position_list3,``\n                ``...,``\n                ``motorN, position_listN``)\n\nThe first motor is the \"slowest\", the outer loop. ``position_list``'s\nare lists of positions, all lists must have the same length. Motors\ncan be any 'settable' object (motor, temp controller, etc.)."
                },
                {
                    "name": "snake_axes",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "which axes should be snaked, either ``False`` (do not snake any axes),\n``True`` (snake all axes) or a list of axes to snake. \"Snaking\" an axis\nis defined as following snake-like, winding trajectory instead of a\nsimple left-to-right trajectory.The elements of the list are motors\nthat are listed in `args`. The list must not contain the slowest\n(first) motor, since it can't be snaked.",
                    "default": "False"
                },
                {
                    "name": "per_step",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "hook for customizing action of inner loop (messages per step).\nSee docstring of :func:`bluesky.plan_stubs.one_nd_step` (the default)\nfor details.",
                    "default": "None"
                },
                {
                    "name": "md",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "metadata",
                    "default": "None"
                }
            ],
            "module": "bluesky.plans",
            "description": "Scan over a mesh; each motor is on an independent trajectory."
        },
        "x2x_scan": {
            "name": "x2x_scan",
            "properties": {
                "is_generator": true
            },
            "parameters": [
                {
                    "name": "detectors",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "list of 'readable' objects"
                },
                {
                    "name": "motor1",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "The second motor will move half as much as the first"
                },
                {
                    "name": "motor2",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "The second motor will move half as much as the first"
                },
                {
                    "name": "start",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "The relative limits of the first motor.  The second motor\nwill move between ``start / 2`` and ``stop / 2``"
                },
                {
                    "name": "stop",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "The relative limits of the first motor.  The second motor\nwill move between ``start / 2`` and ``stop / 2``"
                },
                {
                    "name": "num",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    }
                },
                {
                    "name": "per_step",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "hook for cutomizing action of inner loop (messages per step).\nSee docstring of :func:`bluesky.plan_stubs.one_nd_step` (the default)\nfor details.",
                    "default": "None"
                },
                {
                    "name": "md",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "metadata",
                    "default": "None"
                }
            ],
            "module": "bluesky.plans",
            "description": "Relatively scan over two motors in a 2:1 ratio"
        },
        "rel_adaptive_scan": {
            "name": "rel_adaptive_scan",
            "properties": {
                "is_generator": true
            },
            "parameters": [
                {
                    "name": "detectors",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "list of 'readable' objects"
                },
                {
                    "name": "target_field",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "data field whose output is the focus of the adaptive tuning"
                },
                {
                    "name": "motor",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "any 'settable' object (motor, temp controller, etc.)"
                },
                {
                    "name": "start",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "starting position of motor"
                },
                {
                    "name": "stop",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "ending position of motor"
                },
                {
                    "name": "min_step",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "smallest step for fast-changing regions"
                },
                {
                    "name": "max_step",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "largest step for slow-chaning regions"
                },
                {
                    "name": "target_delta",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "desired fractional change in detector signal between steps"
                },
                {
                    "name": "backstep",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "whether backward steps are allowed -- this is concern with some motors"
                },
                {
                    "name": "threshold",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "threshold for going backward and rescanning a region, default is 0.8",
                    "default": "0.8"
                },
                {
                    "name": "md",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "metadata",
                    "default": "None"
                }
            ],
            "module": "bluesky.plans",
            "description": "Relative scan over one variable with adaptively tuned step size."
        },
        "rel_spiral_square": {
            "name": "rel_spiral_square",
            "properties": {
                "is_generator": true
            },
            "parameters": [
                {
                    "name": "detectors",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "list of 'readable' objects"
                },
                {
                    "name": "x_motor",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "any 'settable' object (motor, temp controller, etc.)"
                },
                {
                    "name": "y_motor",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "any 'settable' object (motor, temp controller, etc.)"
                },
                {
                    "name": "x_range",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "x width of spiral"
                },
                {
                    "name": "y_range",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "y width of spiral"
                },
                {
                    "name": "x_num",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "number of x axis points"
                },
                {
                    "name": "y_num",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "Number of y axis points."
                },
                {
                    "name": "per_step",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "hook for cutomizing action of inner loop (messages per step).\nSee docstring of :func:`bluesky.plans.one_nd_step` (the default) for\ndetails.",
                    "default": "None"
                },
                {
                    "name": "md",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "metadata",
                    "default": "None"
                }
            ],
            "module": "bluesky.plans",
            "description": "Relative square spiral scan, centered around current (x, y) position."
        },
        "relative_inner_product_scan": {
            "name": "relative_inner_product_scan",
            "properties": {
                "is_generator": true
            },
            "parameters": [
                {
                    "name": "detectors",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    }
                },
                {
                    "name": "num",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    }
                },
                {
                    "name": "args",
                    "kind": {
                        "name": "VAR_POSITIONAL",
                        "value": 2
                    }
                },
                {
                    "name": "per_step",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "default": "None"
                },
                {
                    "name": "md",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "default": "None"
                }
            ],
            "module": "bluesky.plans"
        },
        "rel_list_scan": {
            "name": "rel_list_scan",
            "properties": {
                "is_generator": true
            },
            "parameters": [
                {
                    "name": "detectors",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "list of 'readable' objects"
                },
                {
                    "name": "args",
                    "kind": {
                        "name": "VAR_POSITIONAL",
                        "value": 2
                    },
                    "description": "For one dimension, ``motor, [point1, point2, ....]``.\nIn general:\n\n.. code-block:: python\n\n    motor1, [point1, point2, ...],\n    motor2, [point1, point2, ...],\n    ...,\n    motorN, [point1, point2, ...]\n\nMotors can be any 'settable' object (motor, temp controller, etc.)\npoint1, point2 etc are relative to the current location."
                },
                {
                    "name": "per_step",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "hook for customizing action of inner loop (messages per step)\nExpected signature: ``f(detectors, motor, step)``",
                    "default": "None"
                },
                {
                    "name": "md",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "metadata",
                    "default": "None"
                }
            ],
            "module": "bluesky.plans",
            "description": "Scan over one variable in steps relative to current position."
        },
        "rel_list_grid_scan": {
            "name": "rel_list_grid_scan",
            "properties": {
                "is_generator": true
            },
            "parameters": [
                {
                    "name": "detectors",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "list of 'readable' objects"
                },
                {
                    "name": "args",
                    "kind": {
                        "name": "VAR_POSITIONAL",
                        "value": 2
                    },
                    "description": "patterned like (``motor1, position_list1,``\n                ``motor2, position_list2,``\n                ``motor3, position_list3,``\n                ``...,``\n                ``motorN, position_listN``)\n\nThe first motor is the \"slowest\", the outer loop. ``position_list``'s\nare lists of positions, all lists must have the same length. Motors\ncan be any 'settable' object (motor, temp controller, etc.)."
                },
                {
                    "name": "snake_axes",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "which axes should be snaked, either ``False`` (do not snake any axes),\n``True`` (snake all axes) or a list of axes to snake. \"Snaking\" an axis\nis defined as following snake-like, winding trajectory instead of a\nsimple left-to-right trajectory.The elements of the list are motors\nthat are listed in `args`. The list must not contain the slowest\n(first) motor, since it can't be snaked.",
                    "default": "False"
                },
                {
                    "name": "per_step",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "hook for customizing action of inner loop (messages per step).\nSee docstring of :func:`bluesky.plan_stubs.one_nd_step` (the default)\nfor details.",
                    "default": "None"
                },
                {
                    "name": "md",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "metadata",
                    "default": "None"
                }
            ],
            "module": "bluesky.plans",
            "description": "Scan over a mesh; each motor is on an independent trajectory. Each point is\nrelative to the current position."
        },
        "scan_nd": {
            "name": "scan_nd",
            "properties": {
                "is_generator": true
            },
            "parameters": [
                {
                    "name": "detectors",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    }
                },
                {
                    "name": "cycler",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "cycler.Cycler object mapping movable interfaces to positions"
                },
                {
                    "name": "per_step",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "hook for customizing action of inner loop (messages per step).\nSee docstring of :func:`bluesky.plan_stubs.one_nd_step` (the default)\nfor details.",
                    "default": "None"
                },
                {
                    "name": "md",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "metadata",
                    "default": "None"
                }
            ],
            "module": "bluesky.plans",
            "description": "Scan over an arbitrary N-dimensional trajectory."
        },
        "list_scan": {
            "name": "list_scan",
            "properties": {
                "is_generator": true
            },
            "parameters": [
                {
                    "name": "detectors",
                    "kind": {
                        "name": "POSITIONAL_OR_KEYWORD",
                        "value": 1
                    },
                    "description": "list of 'readable' objects"
                },
                {
                    "name": "args",
                    "kind": {
                        "name": "VAR_POSITIONAL",
                        "value": 2
                    },
                    "description": "For one dimension, ``motor, [point1, point2, ....]``.\nIn general:\n\n.. code-block:: python\n\n    motor1, [point1, point2, ...],\n    motor2, [point1, point2, ...],\n    ...,\n    motorN, [point1, point2, ...]\n\nMotors can be any 'settable' object (motor, temp controller, etc.)"
                },
                {
                    "name": "per_step",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "hook for customizing action of inner loop (messages per step)\nExpected signature:\n``f(detectors, motor, step) -> plan (a generator)``",
                    "default": "None"
                },
                {
                    "name": "md",
                    "kind": {
                        "name": "KEYWORD_ONLY",
                        "value": 3
                    },
                    "description": "metadata",
                    "default": "None"
                }
            ],
            "module": "bluesky.plans",
            "description": "Scan over one or more variables in steps simultaneously (inner product)."
        }
    },
    "plans_allowed_uid": "a2fea229-75eb-496f-a776-d2405d7f24a3"
};

export const mockGetQueueItemResponse = {
    "success": true,
    "msg": "",
    "item": {
        "name": "count",
        "kwargs": {
            "detectors": [
                "jittery_motor2"
            ]
        },
        "item_type": "plan",
        "user": "UNAUTHENTICATED_SINGLE_USER",
        "user_group": "primary",
        "item_uid": "070d4e21-8408-43f9-a418-20afb411449f"
    }  
};

export const mockDeleteQueueItemResponse = {
    "success": true,
    "msg": "",
    "item": {
      "name": "count",
      "kwargs": {
        "detectors": [
          "ab_det",
          "custom_test_flyer"
        ],
        "num": 10
      },
      "item_type": "plan",
      "user": "UNAUTHENTICATED_SINGLE_USER",
      "user_group": "primary",
      "item_uid": "1c5e0e17-5452-426c-9959-aa3e51f0e1d8"
    },
    "qsize": 0
};

export const mockAddItemSuccessResponse:PostItemAddResponse = {
    "success": true,
    "msg": "",
    "qsize": 2,
    "item": {
        "name": "count",
        "kwargs": {
            "detectors": [
                "det1",
                "det2"
            ],
            "num": 10,
            "delay": 1
        },
        "item_type": "plan",
        "user": "UNAUTHENTICATED_SINGLE_USER",
        "user_group": "primary",
        "item_uid": "466700c8-9a8a-4818-919a-26831954951e"
    }
};

export const mockAddItemSuccessArgsResponse = {
    "success": true,
    "msg": "",
    "qsize": 1,
    "item": {
        "name": "count",
        "args": [
            [
                "det1",
                "det2"
            ]
        ],
        "item_type": "plan",
        "user": "UNAUTHENTICATED_SINGLE_USER",
        "user_group": "primary",
        "item_uid": "d6a274e8-2e84-4785-ac8e-c34149b4806b"
    }
};

export const mockAddItemFailResponse:PostItemAddResponse = {
    "success": false,
    "msg": "Failed to add an item: Plan validation failed: Plan 'countttt' is not in the list of allowed plans.\nPlan: {'name': 'countttt',\n 'kwargs': {'detectors': ['det1', 'det2'], 'num': 10, 'delay': 1},\n 'item_type': 'plan'}",
    "qsize": null,
    "item": {
        "name": "countttt",
        "kwargs": {
            "detectors": [
                "det1",
                "det2"
            ],
            "num": 10,
            "delay": 1
        },
        "item_type": "plan",
    }
};

export const mockExecuteItemResponse: PostItemExecuteResponse = {
    "success": true,
    "msg": "",
    "qsize": 1,
    "item": {
        "name": "count",
        "args": [
            [
                "det1",
                "det2"
            ]
        ],
        "item_type": "plan",
        "user": "UNAUTHENTICATED_SINGLE_USER",
        "user_group": "primary",
        "item_uid": "f9429eb7-56e0-431e-89bf-449aabf5bb55"
    }
};

export const sampleQueueData = [
    {
        "name": "count",
        "args": [
            [
                "det1",
                "det2"
            ]
        ],
        "kwargs": {
            "num": 10,
            "delay": 1
        },
        "item_type": "plan",
        "user": "qserver-cli",
        "user_group": "primary",
        "item_uid": "eb0c43a7-3227-450a-bbb1-260f1ee7a4dc"
    },
    {
        "name": "count",
        "args": [
            [
                "det1",
                "det2"
            ]
        ],
        "kwargs": {
            "num": 10,
            "delay": 1
        },
        "item_type": "plan",
        "user": "qserver-cli",
        "user_group": "primary",
        "item_uid": "0462793a-b2ff-4d0f-94fe-9f496c179ec1"
    },
    {
        "name": "spiral_count",
        "args": [
            [
                "det1",
                "det2"
            ]
        ],
        "kwargs": {
            "num": 10,
            "delay": 1
        },
        "item_type": "plan",
        "user": "qserver-cli",
        "user_group": "primary",
        "item_uid": "1462793a-b2ff-4d0f-94fe-9f496c179ec1"
    }
];

export const mockGetQueueResponse = {
    "success": true,
    "msg": "",
    "items": sampleQueueData,
    "plan_queue_uid": "a2fea229-75eb-496f-a776-d2405d7f24a3",
    "running_item": {}
};

export const mockGetHistoryResponse: GetHistoryResponse = {
    "success": true,
    "msg": "",
    "items": [
        {
            "name": "count",
            "kwargs": {
                "detectors": [
                    "ab_det"
                ]
            },
            "item_type": "plan",
            "user": "UNAUTHENTICATED_SINGLE_USER",
            "user_group": "primary",
            "item_uid": "418393b5-ea17-434d-8899-190a1b7b3f9a",
            "result": {
                "exit_status": "completed",
                "run_uids": [
                    "70701cd4-80f8-4559-ae31-685ee8bd5e8f"
                ],
                "scan_ids": [
                    1
                ],
                "time_start": 1721942455.82465,
                "time_stop": 1721942456.559789,
                "msg": "",
                "traceback": ""
            }
        },
        {
            "name": "count",
            "kwargs": {
                "detectors": [
                    "bool_sig"
                ]
            },
            "item_type": "plan",
            "user": "UNAUTHENTICATED_SINGLE_USER",
            "user_group": "primary",
            "item_uid": "cd103773-ffe6-412a-879b-a02b3610c2fc",
            "result": {
                "exit_status": "completed",
                "run_uids": [
                    "7bc5a727-43d1-455d-a8af-fc1d92743183"
                ],
                "scan_ids": [
                    2
                ],
                "time_start": 1721942682.8607092,
                "time_stop": 1721942683.549676,
                "msg": "",
                "traceback": ""
            }
        },
        {
            "name": "count",
            "kwargs": {
                "detectors": [
                    "det1",
                    "det2"
                ],
                "num": 1,
                "delay": 2.5
            },
            "item_type": "plan",
            "user": "UNAUTHENTICATED_SINGLE_USER",
            "user_group": "primary",
            "item_uid": "41e9df16-1e70-47ad-af6a-5f63097ba8ce",
            "result": {
                "exit_status": "completed",
                "run_uids": [
                    "1cc6bb7c-7722-4076-8bee-7fe1375ab995"
                ],
                "scan_ids": [
                    3
                ],
                "time_start": 1722016112.13761,
                "time_stop": 1722016115.2865431,
                "msg": "",
                "traceback": ""
            }
        },
        {
            "name": "count",
            "kwargs": {
                "detectors": [
                    "det1",
                    "det2"
                ],
                "num": 1,
                "delay": 2.5
            },
            "item_type": "plan",
            "user": "UNAUTHENTICATED_SINGLE_USER",
            "user_group": "primary",
            "item_uid": "152e0f09-6d1b-430c-8e7b-16218e620cdf",
            "result": {
                "exit_status": "completed",
                "run_uids": [
                    "27618434-7757-44a3-9bf1-fee1ab94eae2"
                ],
                "scan_ids": [
                    4
                ],
                "time_start": 1722016185.598372,
                "time_stop": 1722016188.725067,
                "msg": "",
                "traceback": ""
            }
        },
        {
            "name": "count",
            "kwargs": {
                "detectors": [
                    "det4",
                    "det5"
                ]
            },
            "item_type": "plan",
            "user": "UNAUTHENTICATED_SINGLE_USER",
            "user_group": "primary",
            "item_uid": "be4e5f8e-0e5b-4205-ba7e-2f18beb7277e",
            "result": {
                "exit_status": "completed",
                "run_uids": [
                    "8f79ca7a-3e10-43a5-959a-182034df8c23"
                ],
                "scan_ids": [
                    5
                ],
                "time_start": 1722022266.688672,
                "time_stop": 1722022267.322738,
                "msg": "",
                "traceback": ""
            }
        },
        {
            "name": "count",
            "kwargs": {
                "detectors": [
                    "det5"
                ]
            },
            "item_type": "plan",
            "user": "UNAUTHENTICATED_SINGLE_USER",
            "user_group": "primary",
            "item_uid": "bd1785ef-048b-4ed3-8233-9558c0824c63",
            "result": {
                "exit_status": "completed",
                "run_uids": [
                    "eef29ab1-3023-419b-9dc6-0ae3e99c88ee"
                ],
                "scan_ids": [
                    6
                ],
                "time_start": 1722276783.66215,
                "time_stop": 1722276783.942198,
                "msg": "",
                "traceback": ""
            }
        },
        {
            "name": "count",
            "kwargs": {
                "detectors": [
                    "det4"
                ]
            },
            "item_type": "plan",
            "user": "UNAUTHENTICATED_SINGLE_USER",
            "user_group": "primary",
            "item_uid": "aa92d368-dd62-4318-a50b-1274c818318c",
            "result": {
                "exit_status": "completed",
                "run_uids": [
                    "183ad2f2-df80-49e8-aa09-deaa01ca128c"
                ],
                "scan_ids": [
                    7
                ],
                "time_start": 1722276783.945943,
                "time_stop": 1722276784.444797,
                "msg": "",
                "traceback": ""
            }
        },
        {
            "name": "count",
            "kwargs": {
                "detectors": [
                    "det_with_conf"
                ]
            },
            "item_type": "plan",
            "user": "UNAUTHENTICATED_SINGLE_USER",
            "user_group": "primary",
            "item_uid": "e0fbb0c1-ab59-4157-b87f-6d21a68c3eeb",
            "result": {
                "exit_status": "completed",
                "run_uids": [
                    "081e290f-44d5-4ebb-a141-8e8903ca8df0"
                ],
                "scan_ids": [
                    8
                ],
                "time_start": 1722276784.4499671,
                "time_stop": 1722276784.9466538,
                "msg": "",
                "traceback": ""
            }
        },
        {
            "name": "count",
            "kwargs": {
                "detectors": [
                    "signal"
                ]
            },
            "item_type": "plan",
            "user": "UNAUTHENTICATED_SINGLE_USER",
            "user_group": "primary",
            "item_uid": "0ea71931-c3ba-4589-9d80-04aa0c9116e8",
            "result": {
                "exit_status": "completed",
                "run_uids": [
                    "bf8f850b-2302-4cbb-9751-1ab659b430be"
                ],
                "scan_ids": [
                    9
                ],
                "time_start": 1722276784.9501922,
                "time_stop": 1722276785.4483159,
                "msg": "",
                "traceback": ""
            }
        },
        {
            "name": "count",
            "kwargs": {
                "detectors": [
                    "motor_no_pos"
                ]
            },
            "item_type": "plan",
            "user": "UNAUTHENTICATED_SINGLE_USER",
            "user_group": "primary",
            "item_uid": "047763e0-5a74-4a7c-984a-9f4156f3ef18",
            "result": {
                "exit_status": "completed",
                "run_uids": [
                    "7bc0261f-4c18-470e-82c1-b4cba05546c1"
                ],
                "scan_ids": [
                    10
                ],
                "time_start": 1722276785.452348,
                "time_stop": 1722276785.952163,
                "msg": "",
                "traceback": ""
            }
        },
        {
            "name": "count",
            "kwargs": {
                "detectors": [
                    "pseudo3x3"
                ]
            },
            "item_type": "plan",
            "user": "UNAUTHENTICATED_SINGLE_USER",
            "user_group": "primary",
            "item_uid": "31905ed0-835a-407c-9c7e-3ddb0753eb16",
            "result": {
                "exit_status": "completed",
                "run_uids": [
                    "d895fa89-f477-4180-9094-bf13f99ad940"
                ],
                "scan_ids": [
                    11
                ],
                "time_start": 1722276785.955349,
                "time_stop": 1722276786.454935,
                "msg": "",
                "traceback": ""
            }
        },
        {
            "name": "count",
            "kwargs": {
                "detectors": [
                    "det4"
                ]
            },
            "item_type": "plan",
            "user": "UNAUTHENTICATED_SINGLE_USER",
            "user_group": "primary",
            "item_uid": "57e90772-b4a9-4115-af56-7ff95265a1cf",
            "result": {
                "exit_status": "completed",
                "run_uids": [
                    "affa4994-0f71-4bb5-872a-39ee05608cb6"
                ],
                "scan_ids": [
                    12
                ],
                "time_start": 1722282088.6331751,
                "time_stop": 1722282089.25177,
                "msg": "",
                "traceback": ""
            }
        },
        {
            "name": "scan",
            "kwargs": {
                "detectors": [
                    "det4"
                ]
            },
            "item_type": "plan",
            "user": "UNAUTHENTICATED_SINGLE_USER",
            "user_group": "primary",
            "item_uid": "0bc1a0aa-1a04-478b-81fb-818d5382a761",
            "result": {
                "exit_status": "failed",
                "run_uids": [],
                "scan_ids": [],
                "time_start": 1722292139.9085598,
                "time_stop": 1722292140.208694,
                "msg": "Plan failed: The number of points to scan must be provided as the last positional argument or as keyword argument 'num'.",
                "traceback": "Traceback (most recent call last):\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky_queueserver/manager/worker.py\", line 304, in _execute_plan\n    result = func()\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky_queueserver/manager/worker.py\", line 497, in start_plan_func\n    return self._RE(g, **plan_meta)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/run_engine.py\", line 903, in __call__\n    plan_return = self._resume_task(init_func=_build_task)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/run_engine.py\", line 1042, in _resume_task\n    raise exc\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/run_engine.py\", line 1672, in _run\n    raise err\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/run_engine.py\", line 1532, in _run\n    msg = self._plan_stack[-1].send(resp)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 408, in subs_wrapper\n    return (yield from finalize_wrapper(_inner_plan(),\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 535, in finalize_wrapper\n    ret = yield from plan\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 406, in _inner_plan\n    return (yield from plan)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/plans.py\", line 1068, in scan\n    raise ValueError(\"The number of points to scan must be provided \"\nValueError: The number of points to scan must be provided as the last positional argument or as keyword argument 'num'.\n"
            }
        },
        {
            "name": "scan",
            "kwargs": {
                "detectors": [
                    "det4"
                ]
            },
            "item_type": "plan",
            "user": "UNAUTHENTICATED_SINGLE_USER",
            "user_group": "primary",
            "item_uid": "7cb3f8e3-6b6d-492f-ad64-a6fa859bcfd9",
            "result": {
                "exit_status": "failed",
                "run_uids": [],
                "scan_ids": [],
                "time_start": 1722292343.0057778,
                "time_stop": 1722292343.12445,
                "msg": "Plan failed: The number of points to scan must be provided as the last positional argument or as keyword argument 'num'.",
                "traceback": "Traceback (most recent call last):\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky_queueserver/manager/worker.py\", line 304, in _execute_plan\n    result = func()\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky_queueserver/manager/worker.py\", line 497, in start_plan_func\n    return self._RE(g, **plan_meta)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/run_engine.py\", line 903, in __call__\n    plan_return = self._resume_task(init_func=_build_task)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/run_engine.py\", line 1042, in _resume_task\n    raise exc\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/run_engine.py\", line 1672, in _run\n    raise err\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/run_engine.py\", line 1532, in _run\n    msg = self._plan_stack[-1].send(resp)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 408, in subs_wrapper\n    return (yield from finalize_wrapper(_inner_plan(),\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 535, in finalize_wrapper\n    ret = yield from plan\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 406, in _inner_plan\n    return (yield from plan)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/plans.py\", line 1068, in scan\n    raise ValueError(\"The number of points to scan must be provided \"\nValueError: The number of points to scan must be provided as the last positional argument or as keyword argument 'num'.\n"
            }
        },
        {
            "name": "scan",
            "kwargs": {
                "detectors": [
                    "det4"
                ]
            },
            "item_type": "plan",
            "user": "UNAUTHENTICATED_SINGLE_USER",
            "user_group": "primary",
            "item_uid": "1fdca4f5-633f-408c-93d1-0d4ff0bfa9a4",
            "result": {
                "exit_status": "failed",
                "run_uids": [],
                "scan_ids": [],
                "time_start": 1722293372.3601868,
                "time_stop": 1722293372.795773,
                "msg": "Plan failed: The number of points to scan must be provided as the last positional argument or as keyword argument 'num'.",
                "traceback": "Traceback (most recent call last):\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky_queueserver/manager/worker.py\", line 304, in _execute_plan\n    result = func()\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky_queueserver/manager/worker.py\", line 497, in start_plan_func\n    return self._RE(g, **plan_meta)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/run_engine.py\", line 903, in __call__\n    plan_return = self._resume_task(init_func=_build_task)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/run_engine.py\", line 1042, in _resume_task\n    raise exc\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/run_engine.py\", line 1672, in _run\n    raise err\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/run_engine.py\", line 1532, in _run\n    msg = self._plan_stack[-1].send(resp)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 408, in subs_wrapper\n    return (yield from finalize_wrapper(_inner_plan(),\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 535, in finalize_wrapper\n    ret = yield from plan\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 406, in _inner_plan\n    return (yield from plan)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/plans.py\", line 1068, in scan\n    raise ValueError(\"The number of points to scan must be provided \"\nValueError: The number of points to scan must be provided as the last positional argument or as keyword argument 'num'.\n"
            }
        },
        {
            "name": "scan",
            "kwargs": {
                "detectors": [
                    "det4"
                ]
            },
            "item_type": "plan",
            "user": "UNAUTHENTICATED_SINGLE_USER",
            "user_group": "primary",
            "item_uid": "0619a710-bd69-4db7-a75d-d83ddecd5e51",
            "result": {
                "exit_status": "failed",
                "run_uids": [],
                "scan_ids": [],
                "time_start": 1722293430.3920588,
                "time_stop": 1722293430.537136,
                "msg": "Plan failed: The number of points to scan must be provided as the last positional argument or as keyword argument 'num'.",
                "traceback": "Traceback (most recent call last):\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky_queueserver/manager/worker.py\", line 304, in _execute_plan\n    result = func()\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky_queueserver/manager/worker.py\", line 497, in start_plan_func\n    return self._RE(g, **plan_meta)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/run_engine.py\", line 903, in __call__\n    plan_return = self._resume_task(init_func=_build_task)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/run_engine.py\", line 1042, in _resume_task\n    raise exc\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/run_engine.py\", line 1672, in _run\n    raise err\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/run_engine.py\", line 1532, in _run\n    msg = self._plan_stack[-1].send(resp)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 408, in subs_wrapper\n    return (yield from finalize_wrapper(_inner_plan(),\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 535, in finalize_wrapper\n    ret = yield from plan\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 406, in _inner_plan\n    return (yield from plan)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/plans.py\", line 1068, in scan\n    raise ValueError(\"The number of points to scan must be provided \"\nValueError: The number of points to scan must be provided as the last positional argument or as keyword argument 'num'.\n"
            }
        },
        {
            "name": "scan",
            "kwargs": {
                "detectors": [
                    "det5"
                ]
            },
            "item_type": "plan",
            "user": "UNAUTHENTICATED_SINGLE_USER",
            "user_group": "primary",
            "item_uid": "de89aa92-4cfe-4dd1-8b75-2001dee07488",
            "result": {
                "exit_status": "failed",
                "run_uids": [],
                "scan_ids": [],
                "time_start": 1722379233.1787038,
                "time_stop": 1722379233.417322,
                "msg": "Plan failed: The number of points to scan must be provided as the last positional argument or as keyword argument 'num'.",
                "traceback": "Traceback (most recent call last):\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky_queueserver/manager/worker.py\", line 304, in _execute_plan\n    result = func()\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky_queueserver/manager/worker.py\", line 497, in start_plan_func\n    return self._RE(g, **plan_meta)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/run_engine.py\", line 903, in __call__\n    plan_return = self._resume_task(init_func=_build_task)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/run_engine.py\", line 1042, in _resume_task\n    raise exc\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/run_engine.py\", line 1672, in _run\n    raise err\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/run_engine.py\", line 1532, in _run\n    msg = self._plan_stack[-1].send(resp)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 408, in subs_wrapper\n    return (yield from finalize_wrapper(_inner_plan(),\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 535, in finalize_wrapper\n    ret = yield from plan\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 406, in _inner_plan\n    return (yield from plan)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/plans.py\", line 1068, in scan\n    raise ValueError(\"The number of points to scan must be provided \"\nValueError: The number of points to scan must be provided as the last positional argument or as keyword argument 'num'.\n"
            }
        },
        {
            "name": "rel_list_grid_scan",
            "kwargs": {
                "detectors": [
                    "det5"
                ]
            },
            "item_type": "plan",
            "user": "UNAUTHENTICATED_SINGLE_USER",
            "user_group": "primary",
            "item_uid": "42d35428-dfd7-4afe-913e-7a54bec5658a",
            "result": {
                "exit_status": "failed",
                "run_uids": [],
                "scan_ids": [],
                "time_start": 1722454528.8340302,
                "time_stop": 1722454529.184476,
                "msg": "Plan failed: reduce() of empty iterable with no initial value",
                "traceback": "Traceback (most recent call last):\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky_queueserver/manager/worker.py\", line 304, in _execute_plan\n    result = func()\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky_queueserver/manager/worker.py\", line 497, in start_plan_func\n    return self._RE(g, **plan_meta)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/run_engine.py\", line 903, in __call__\n    plan_return = self._resume_task(init_func=_build_task)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/run_engine.py\", line 1042, in _resume_task\n    raise exc\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/run_engine.py\", line 1672, in _run\n    raise err\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/run_engine.py\", line 1532, in _run\n    msg = self._plan_stack[-1].send(resp)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 408, in subs_wrapper\n    return (yield from finalize_wrapper(_inner_plan(),\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 535, in finalize_wrapper\n    ret = yield from plan\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 406, in _inner_plan\n    return (yield from plan)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/plans.py\", line 365, in rel_list_grid_scan\n    return (yield from inner_relative_list_grid_scan())\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/utils/__init__.py\", line 1203, in dec_inner\n    return (yield from plan)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 1163, in reset_positions_wrapper\n    return (yield from finalize_wrapper(plan_mutator(plan, insert_reads),\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 535, in finalize_wrapper\n    ret = yield from plan\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 173, in plan_mutator\n    raise ex\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 126, in plan_mutator\n    msg = plan_stack[-1].send(ret)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/utils/__init__.py\", line 1203, in dec_inner\n    return (yield from plan)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 1119, in relative_set_wrapper\n    return (yield from plan)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 238, in msg_mutator\n    msg = plan.send(None)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 173, in plan_mutator\n    raise ex\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 126, in plan_mutator\n    msg = plan_stack[-1].send(ret)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/plans.py\", line 362, in inner_relative_list_grid_scan\n    return (yield from list_grid_scan(detectors, *args,\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/plans.py\", line 276, in list_grid_scan\n    full_cycler = plan_patterns.outer_list_product(args, snake_axes)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/plan_patterns.py\", line 356, in outer_list_product\n    return snake_cyclers(cyclers, snaking)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/utils/__init__.py\", line 618, in snake_cyclers\n    return reduce(operator.mul, cyclers)\nTypeError: reduce() of empty iterable with no initial value\n"
            }
        },
        {
            "name": "rel_list_grid_scan",
            "kwargs": {
                "detectors": [
                    "det5"
                ]
            },
            "item_type": "plan",
            "user": "UNAUTHENTICATED_SINGLE_USER",
            "user_group": "primary",
            "item_uid": "3f97b797-e788-4b8e-952e-63600389759a",
            "result": {
                "exit_status": "failed",
                "run_uids": [],
                "scan_ids": [],
                "time_start": 1722459856.971958,
                "time_stop": 1722459857.17078,
                "msg": "Plan failed: reduce() of empty iterable with no initial value",
                "traceback": "Traceback (most recent call last):\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky_queueserver/manager/worker.py\", line 304, in _execute_plan\n    result = func()\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky_queueserver/manager/worker.py\", line 497, in start_plan_func\n    return self._RE(g, **plan_meta)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/run_engine.py\", line 903, in __call__\n    plan_return = self._resume_task(init_func=_build_task)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/run_engine.py\", line 1042, in _resume_task\n    raise exc\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/run_engine.py\", line 1672, in _run\n    raise err\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/run_engine.py\", line 1532, in _run\n    msg = self._plan_stack[-1].send(resp)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 408, in subs_wrapper\n    return (yield from finalize_wrapper(_inner_plan(),\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 535, in finalize_wrapper\n    ret = yield from plan\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 406, in _inner_plan\n    return (yield from plan)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/plans.py\", line 365, in rel_list_grid_scan\n    return (yield from inner_relative_list_grid_scan())\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/utils/__init__.py\", line 1203, in dec_inner\n    return (yield from plan)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 1163, in reset_positions_wrapper\n    return (yield from finalize_wrapper(plan_mutator(plan, insert_reads),\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 535, in finalize_wrapper\n    ret = yield from plan\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 173, in plan_mutator\n    raise ex\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 126, in plan_mutator\n    msg = plan_stack[-1].send(ret)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/utils/__init__.py\", line 1203, in dec_inner\n    return (yield from plan)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 1119, in relative_set_wrapper\n    return (yield from plan)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 238, in msg_mutator\n    msg = plan.send(None)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 173, in plan_mutator\n    raise ex\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 126, in plan_mutator\n    msg = plan_stack[-1].send(ret)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/plans.py\", line 362, in inner_relative_list_grid_scan\n    return (yield from list_grid_scan(detectors, *args,\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/plans.py\", line 276, in list_grid_scan\n    full_cycler = plan_patterns.outer_list_product(args, snake_axes)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/plan_patterns.py\", line 356, in outer_list_product\n    return snake_cyclers(cyclers, snaking)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/utils/__init__.py\", line 618, in snake_cyclers\n    return reduce(operator.mul, cyclers)\nTypeError: reduce() of empty iterable with no initial value\n"
            }
        },
        {
            "name": "rel_list_scan",
            "kwargs": {
                "detectors": [
                    "det_with_conf"
                ]
            },
            "item_type": "plan",
            "user": "UNAUTHENTICATED_SINGLE_USER",
            "user_group": "primary",
            "item_uid": "963a94bc-c602-48b6-824a-ef1bcee5cbb8",
            "result": {
                "exit_status": "failed",
                "run_uids": [],
                "scan_ids": [],
                "time_start": 1722462344.691751,
                "time_stop": 1722462345.128257,
                "msg": "Plan failed: unsupported operand type(s) for -: 'NoneType' and 'int'",
                "traceback": "Traceback (most recent call last):\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky_queueserver/manager/worker.py\", line 304, in _execute_plan\n    result = func()\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky_queueserver/manager/worker.py\", line 497, in start_plan_func\n    return self._RE(g, **plan_meta)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/run_engine.py\", line 903, in __call__\n    plan_return = self._resume_task(init_func=_build_task)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/run_engine.py\", line 1042, in _resume_task\n    raise exc\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/run_engine.py\", line 1672, in _run\n    raise err\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/run_engine.py\", line 1532, in _run\n    msg = self._plan_stack[-1].send(resp)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 408, in subs_wrapper\n    return (yield from finalize_wrapper(_inner_plan(),\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 535, in finalize_wrapper\n    ret = yield from plan\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 406, in _inner_plan\n    return (yield from plan)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/plans.py\", line 234, in rel_list_scan\n    return (yield from inner_relative_list_scan())\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/utils/__init__.py\", line 1203, in dec_inner\n    return (yield from plan)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 1163, in reset_positions_wrapper\n    return (yield from finalize_wrapper(plan_mutator(plan, insert_reads),\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 535, in finalize_wrapper\n    ret = yield from plan\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 173, in plan_mutator\n    raise ex\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 126, in plan_mutator\n    msg = plan_stack[-1].send(ret)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/utils/__init__.py\", line 1203, in dec_inner\n    return (yield from plan)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 1119, in relative_set_wrapper\n    return (yield from plan)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 238, in msg_mutator\n    msg = plan.send(None)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 173, in plan_mutator\n    raise ex\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 126, in plan_mutator\n    msg = plan_stack[-1].send(ret)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/plans.py\", line 232, in inner_relative_list_scan\n    return (yield from list_scan(detectors, *args, per_step=per_step,\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/plans.py\", line 152, in list_scan\n    'num_intervals': length - 1,\nTypeError: unsupported operand type(s) for -: 'NoneType' and 'int'\n"
            }
        },
        {
            "name": "count",
            "kwargs": {
                "detectors": [
                    "det5"
                ]
            },
            "item_type": "plan",
            "user": "UNAUTHENTICATED_SINGLE_USER",
            "user_group": "primary",
            "item_uid": "586c9bc1-b21a-47d3-8136-3b0a6534984c",
            "result": {
                "exit_status": "completed",
                "run_uids": [
                    "f63139c4-c0e3-41e4-b054-2577aec9f201"
                ],
                "scan_ids": [
                    13
                ],
                "time_start": 1722542596.121071,
                "time_stop": 1722542596.454433,
                "msg": "",
                "traceback": ""
            }
        },
        {
            "name": "count",
            "kwargs": {
                "detectors": [
                    "det4"
                ]
            },
            "item_type": "plan",
            "user": "UNAUTHENTICATED_SINGLE_USER",
            "user_group": "primary",
            "item_uid": "76cf9e21-4f50-432a-8d3a-8fa97e56d060",
            "result": {
                "exit_status": "completed",
                "run_uids": [
                    "dba24d18-dd6f-4e3e-a5f9-bcbfebbe564b"
                ],
                "scan_ids": [
                    14
                ],
                "time_start": 1722542821.48771,
                "time_stop": 1722542822.001365,
                "msg": "",
                "traceback": ""
            }
        },
        {
            "name": "scan",
            "kwargs": {
                "detectors": [
                    "det4"
                ]
            },
            "item_type": "plan",
            "user": "UNAUTHENTICATED_SINGLE_USER",
            "user_group": "primary",
            "item_uid": "4c6ebf28-1d2b-4644-9021-ad1be3334f49",
            "result": {
                "exit_status": "failed",
                "run_uids": [],
                "scan_ids": [],
                "time_start": 1722542822.006978,
                "time_stop": 1722542822.503486,
                "msg": "Plan failed: The number of points to scan must be provided as the last positional argument or as keyword argument 'num'.",
                "traceback": "Traceback (most recent call last):\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky_queueserver/manager/worker.py\", line 304, in _execute_plan\n    result = func()\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky_queueserver/manager/worker.py\", line 497, in start_plan_func\n    return self._RE(g, **plan_meta)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/run_engine.py\", line 903, in __call__\n    plan_return = self._resume_task(init_func=_build_task)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/run_engine.py\", line 1042, in _resume_task\n    raise exc\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/run_engine.py\", line 1672, in _run\n    raise err\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/run_engine.py\", line 1532, in _run\n    msg = self._plan_stack[-1].send(resp)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 408, in subs_wrapper\n    return (yield from finalize_wrapper(_inner_plan(),\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 535, in finalize_wrapper\n    ret = yield from plan\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/preprocessors.py\", line 406, in _inner_plan\n    return (yield from plan)\n  File \"/Users/seij/miniconda3/envs/queue_server/lib/python3.10/site-packages/bluesky/plans.py\", line 1068, in scan\n    raise ValueError(\"The number of points to scan must be provided \"\nValueError: The number of points to scan must be provided as the last positional argument or as keyword argument 'num'.\n"
            }
        },
        {
            "name": "count",
            "kwargs": {
                "detectors": [
                    "det1",
                    "det2"
                ],
                "num": 10,
                "delay": 1
            },
            "item_type": "plan",
            "user": "UNAUTHENTICATED_SINGLE_USER",
            "user_group": "primary",
            "item_uid": "474f4644-0475-4281-938e-a1772da79ee4",
            "result": {
                "exit_status": "completed",
                "run_uids": [
                    "cdbb23e3-9285-40ab-8f1b-d92280b6b34c"
                ],
                "scan_ids": [
                    15
                ],
                "time_start": 1722543419.725246,
                "time_stop": 1722543430.231056,
                "msg": "",
                "traceback": ""
            }
        },
    ],
    "plan_history_uid": "a87195b7-65f7-4d49-bdb2-71370691d649"
};

export const mockGetStatusResponse: GetStatusResponse = {
    "msg": "RE Manager v0.0.19",
    "items_in_queue": 0,
    "items_in_history": 119,
    "running_item_uid": null,
    "manager_state": "idle",
    "queue_stop_pending": false,
    "queue_autostart_enabled": false,
    "worker_environment_exists": false,
    "worker_environment_state": "closed",
    "worker_background_tasks": 0,
    "re_state": null,
    "ip_kernel_state": null,
    "ip_kernel_captured": null,
    "pause_pending": false,
    "run_list_uid": "36e0a461-2339-4558-944f-c71f3ad4857e",
    "plan_queue_uid": "013b92ca-6403-4764-a433-b1e1eec478a5",
    "plan_history_uid": "a87195b7-65f7-4d49-bdb2-71370691d649",
    "devices_existing_uid": "f2c7c412-59d0-4c45-b5c7-4576215b8010",
    "plans_existing_uid": "c6616804-d5ef-497d-acd6-6964e45f8ddd",
    "devices_allowed_uid": "26903d13-3553-4b2b-bccd-7a2daac22195",
    "plans_allowed_uid": "a4136bdb-0c7b-4bff-a261-20a63f9b252d",
    "plan_queue_mode": {
        "loop": false,
        "ignore_failures": false
    },
    "task_results_uid": "13168f35-37cf-469e-81f5-5addf5ca26da",
    "lock_info_uid": "59e09e4b-25f4-4ba3-9543-608143815557",
    "lock": {
        "environment": false,
        "queue": false
    }
};

export const mockEnvironmentOpenResponse: PostEnvironmentOpenResponse = {
    success: true,
    msg: ""
};

export const mockRemoveQueueItemResponse: PostItemRemoveResponse = {
    "success": true,
    "msg": "",
    "item": {
        "name": "count",
        "args": [
            [
                "det1",
                "det2"
            ]
        ],
        "item_type": "plan",
        "user": "UNAUTHENTICATED_SINGLE_USER",
        "user_group": "primary",
        "item_uid": "6e447e8d-00c3-44ee-875f-ba12ccdf4ec4"
    },
    "qsize": 0
}

