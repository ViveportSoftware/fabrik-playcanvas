import { Vec3 } from './Vec3';
export declare class Utils {
    private static DEGS_TO_RADS;
    private static RADS_TO_DEGS;
    static MAX_NAME_LENGTH: number;
    static randomNextFloat(): number;
    static randomNextInt(i: number): number;
    static randRangeFloat(min: number, max: number): number;
    static randRangeInt(min: number, max: number): number;
    static approximatelyEquals(a: number, b: number, tolerance: number): boolean;
    /**
     * Determine the sign of a float value.
     *
     * @param	value	The value to return the sign of.
     * @return			1.0f if the provided float value is positive, -1.0f otherwise.
     */
    static sign(value: number): number;
    /**
     * Return the given name capped at 100 characters, if necessary.
     *
     * @param	name	The name to validate.
     * @return			The given name capped at 100 characters, if necessary.
     */
    static getValidatedName(name: string): string;
    /**
     * Validate a direction unit vector (Vec3f) to ensure that it does not have a magnitude of zero.
     * <p>
     * If the direction unit vector has a magnitude of zero then an IllegalArgumentException is thrown.
     * @param	directionUV	The direction unit vector to validate
     */
    static validateDirectionUV(directionUV: Vec3): void;
    /**
     * Validate the length of a bone to ensure that it's a positive value.
     * <p>
     * If the provided bone length is not greater than zero then an IllegalArgumentException is thrown.
     * @param	length	The length value to validate.
     */
    static validateLength(length: number): void;
    /** Ensure we have a legal line width with which to draw.
     * <p>
     * Valid line widths are between 1.0f and 32.0f pixels inclusive.
     * <p>
     * Line widths outside this range will cause an IllegalArgumentException to be thrown.
     *
     * @param	lineWidth	The width of the line we are validating.
     */
    static validateLineWidth(lineWidth: number): void;
}
