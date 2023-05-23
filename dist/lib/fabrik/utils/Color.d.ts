export declare class Color {
    private static MIN_COMPONENT_VALUE;
    private static MAX_COMPONENT_VALUE;
    r: number;
    g: number;
    b: number;
    a: number;
    constructor(r?: number, g?: number, b?: number, a?: number);
    private static clamp;
    set(source: Color): void;
    addRGB(r: number, g: number, b: number): Color;
    subtractRGB(r: number, g: number, b: number): Color;
    lighten(amount: number): Color;
    darken(amount: number): Color;
    toArray(): number[];
    toString(): string;
    static randomOpaqueColour(): Color;
    equals(obj: Object): boolean;
}
