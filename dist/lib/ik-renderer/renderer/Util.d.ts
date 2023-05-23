import * as pc from 'playcanvas';
export declare class Util {
    static vec3LookRotation(forward: pc.Vec3, up: pc.Vec3): pc.Quat;
    static rotateAlign(v1: pc.Vec3, v2: pc.Vec3): pc.Mat3;
}
