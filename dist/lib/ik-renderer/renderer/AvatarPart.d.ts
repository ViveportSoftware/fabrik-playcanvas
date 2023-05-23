export declare enum AvatarPart {
    Hips = "1",
    Spine = "2",
    Chest = "3",
    UpperChest = "4",
    Neck = "5",
    Head = "6",
    RightEye = "7",
    LeftEye = "8",
    RightShoulder = "9",
    RightUpperArm = "10",
    RightLowerArm = "11",
    RightHand = "12",
    RightMiddle1 = "13",
    LeftShoulder = "14",
    LeftUpperArm = "15",
    LeftLowerArm = "16",
    LeftHand = "17",
    LeftMiddle1 = "18",
    RightHip = "19",
    RightUpperLeg = "20",
    RightLowerLeg = "21",
    RightFoot = "22",
    RightToeBase = "23",
    LeftHip = "24",
    LeftUpperLeg = "25",
    LeftLowerLeg = "26",
    LeftFoot = "27",
    LeftToeBase = "28"
}
export declare class AvatarPartMap {
    private static partMap;
    static set(part: AvatarPart, name: string): void;
    static get Hips(): string;
    static get Spine(): string;
    static get UpperChest(): string;
    static get Chest(): string;
    static get Neck(): string;
    static get Head(): string;
    static get RightEye(): string;
    static get LeftEye(): string;
    static get RightShoulder(): string;
    static get RightUpperArm(): string;
    static get RightLowerArm(): string;
    static get RightHand(): string;
    static get RightMiddle1(): string;
    static get LeftShoulder(): string;
    static get LeftUpperArm(): string;
    static get LeftLowerArm(): string;
    static get LeftHand(): string;
    static get LeftMiddle1(): string;
    static get RightHip(): string;
    static get RightUpperLeg(): string;
    static get RightLowerLeg(): string;
    static get RightFoot(): string;
    static get RightToeBase(): string;
    static get LeftHip(): string;
    static get LeftUpperLeg(): string;
    static get LeftLowerLeg(): string;
    static get LeftFoot(): string;
    static get LeftToeBase(): string;
}
