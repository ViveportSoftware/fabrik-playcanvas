import { Vec3 } from './Vec3';
export declare class Mat3 {
    private static DEGS_TO_RADS;
    private static RADS_TO_DEGS;
    m00: number;
    m01: number;
    m02: number;
    m10: number;
    m11: number;
    m12: number;
    m20: number;
    m21: number;
    m22: number;
    constructor(m00?: number, m01?: number, m02?: number, m10?: number, m11?: number, m12?: number, m20?: number, m21?: number, m22?: number);
    /** Zero all elements of this matrix. */
    zero(): void;
    /** Reset this matrix to identity. */
    setIdentity(): void;
    /**
     * Return a new matrix which is the transposed version of the provided matrix.
     *
     * @param	m	The matrix which we will transpose (this matrix is not modified)
     * @return		A transposed version of the provided matrix.
     */
    static transpose(m: Mat3): Mat3;
    /**
     * Create a rotation matrix from a given direction.
     * <p>
     * The reference direction is aligned to the Z-Axis. Note: The singularity is on the positive Y-Axis.
     * <p>
     * This method uses the <a href="https://gist.github.com/roxlu/3082114">Frisvad technique</a> for generating perpendicular axes.
     *
     * @param	referenceDirection	The vector to use as the Z-Axis
     * @return	The created rotation matrix.
     *
     * @see Vec3f#genPerpendicularVectorQuick(Vec3f)
     */
    static createRotationMatrix(referenceDirection: Vec3): Mat3;
    /**
     * Return whether this matrix consists of three orthogonal axes or not to within a cross-product of 0.01f.
     *
     * @return	Whether or not this matrix is orthogonal.
     */
    isOrthogonal(): boolean;
    /**
     * Multiply this matrix by another matrix (in effect, combining them) and return the result as a new Mat3f.
     * <p>
     * Neither this matrix or the provided matrix argument are modified by this process - you must assign the result to your desired
     * combined matrix.
     * <p>
     * To create a ModelView matrix using this method you would use viewMatrix.times(modelMatrix).
     * To create a ModelViewProjection matrix using this method you would use projectionMatrix.times(viewMatrix).times(modelMatrix).
     *
     * @param	m	The matrix to multiply this matrix by.
     * @return		The resulting combined matrix.
     */
    times(m: Mat3): Mat3;
    /**
     * Multiply a vector by this matrix and return the result as a new Vec3f.
     *
     * @param	source	The source vector to transform.
     * @return		The provided source vector transformed by this matrix.
     */
    timesByVec3(source: Vec3): Vec3;
    /**
     * Calculate and return the determinant of this matrix.
     *
     * @return	The determinant of this matrix.
     */
    determinant(): number;
    /**
     * Return a matrix which is the inverse of the provided matrix.
     *
     * @param	m	The matrix to invert.
     * @return		The inverse matrix of of the provided matrix argument.
     */
    static inverse(m: Mat3): Mat3;
    /**
     *  Rotate this matrix by the provided angle about the specified axis.
     *
     *  @param	angleRads		The angle to rotate the matrix, specified in radians.
     *  @param	rotationAxis	The axis to rotate this matrix about, relative to the current configuration of this matrix.
     *  @return					The rotated version of this matrix.
     */
    rotateRads(rotationAxis: Vec3, angleRads: number): Mat3;
    /**
     *  Rotate this matrix by the provided angle about the specified axis.
     *
     *  @param	angleDegs	The angle to rotate the matrix, specified in degrees.
     *  @param	localAxis	The axis to rotate this matrix about, relative to the current configuration of this matrix.
     *  @return			The rotated version of this matrix.
     *  */
    rotateDegs(angleDegs: number, localAxis: Vec3): Mat3;
    /**
     * Set the X basis of this matrix.
     *
     * @param	v	The vector to use as the X-basis of this matrix.
     */
    setXBasis(v: Vec3): void;
    /**
     * Get the X basis of this matrix.
     *
     * @return The X basis of this matrix as a Vec3f
     **/
    getXBasis(): Vec3;
    /**
     * Set the Y basis of this matrix.
     *
     * @param	v	The vector to use as the Y-basis of this matrix.
     */
    setYBasis(v: Vec3): void;
    /**
     * Get the Y basis of this matrix.
     *
     * @return The Y basis of this matrix as a Vec3f
     **/
    getYBasis(): Vec3;
    /**
     * Set the Z basis of this matrix.
     *
     * @param	v	The vector to use as the Z-basis of this matrix.
     */
    setZBasis(v: Vec3): void;
    /**
     * Get the Z basis of this matrix.
     *
     * @return The Z basis of this matrix as a Vec3f
     **/
    getZBasis(): Vec3;
    /**
     * Return this Mat3f as an array of 9 floats.
     *
     * @return	This Mat3f as an array of 9 floats.
     */
    toArray(): number[];
    toString(): string;
}
