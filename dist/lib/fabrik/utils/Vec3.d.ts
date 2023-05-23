import { Vector } from './Vector';
export declare class Vec3 implements Vector<Vec3> {
    private static DEGS_TO_RADS;
    private static RADS_TO_DEGS;
    private static X_AXIS;
    private static Y_AXIS;
    private static Z_AXIS;
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    static clone(source: Vec3): Vec3;
    set(source: Vec3): void;
    approximatelyEquals(v: Vec3, tolerance: number): boolean;
    /**
     * Return whether the two provided vectors are perpendicular (to a dot-product tolerance of 0.01f).
     *
     * @param	a	The first vector.
     * @param	b	The second vector.
     * @return		Whether the two provided vectors are perpendicular (true) or not (false).
     */
    static perpendicular(a: Vec3, b: Vec3): boolean;
    /**
     * Return whether the length of this Vec3f is approximately equal to a given value to within a given tolerance.
     *
     * @param	value		The value to compare the length of this vector to.
     * @param	tolerance	The tolerance within which the values must be to return true.
     * @return				A boolean indicating whether the length of this vector is approximately the same as that of the provided value.
     */
    lengthIsApproximately(value: number, tolerance: number): boolean;
    zero(): void;
    /**
     * Negate and return this vector.
     * <p>
     * Note: It is actually <em>this</em> vector which is negated and returned, not a copy / clone.
     *
     * @return	This vector negated.
     */
    negate(): Vec3;
    negated(): Vec3;
    /**
     * Return whether two vectors are approximately equal to within a given tolerance.
     *
     * @param	a		The first vector.
     * @param	b		The second vector.
     * @param	tolerance	The value which each component of each vector must be within to be considered approximately equal.
     * @return			Whether the two provided vector arguments are approximately equal (true) or not (false).
     */
    static approximatelyEqual(a: Vec3, b: Vec3, tolerance: number): boolean;
    normalise(): Vec3;
    /**
     * Return a normalised version of this vector without modifying 'this' vector.
     *
     * @return	A normalised version of this vector.
     */
    normalised(): Vec3;
    /**
     * Return the scalar product of two vectors.
     * <p>
     * If the provided vectors are normalised then this will be the same as the dot product.
     *
     * @param	v1	The first vector.
     * @param	v2	The second vector.
     * @return		The scalar product of the two vectors.
     */
    static scalarProduct(v1: Vec3, v2: Vec3): number;
    /**
     * Return the scalar product of two vectors.
     * <p>
     * Normalised versions of the provided vectors are used in the dot product operation.
     *
     * @param	v1	The first vector.
     * @param	v2	The second vector.
     * @return		The dot product of the two vectors.
     */
    static dotProduct(v1: Vec3, v2: Vec3): number;
    /**
     * Calculate and return a vector which is the cross product of the two provided vectors.
     * <p>
     * The returned vector is not normalised.
     *
     * @param	v1	The first vector.
     * @param	v2	The second vector.
     * @return		The non-normalised cross-product of the two vectors v1-cross-v2.
     */
    static crossProduct(v1: Vec3, v2: Vec3): Vec3;
    /**
     * Calculate and return a vector which is the cross product of this vector and another vector.
     * <p>
     * The returned vector is not normalised.
     *
     * @param	v	The Vec3f with which we will cross product this Vec3f.
     * @return		The non-normalised cross product if the two vectors this-cross-v.
     */
    cross(v: Vec3): Vec3;
    /**
     * Calculate and return the distance between two points in 3D space.
     *
     * @param	v1	The first point.
     * @param	v2	The second point.
     * @return		The distance between the two points.
     */
    static distanceBetween(v1: Vec3, v2: Vec3): number;
    /**
     * Calculate and return the Manhattan distance between two Vec3f objects.
     * <p>
     * The Manhattan distance is an approximate distance between two points, but
     * can be calculated faster than the exact distance.
     * <p>
     * Further reading:
     *     http://en.wikipedia.org/wiki/floataxicab_geometry
     *     http://stackoverflow.com/questions/3693514/very-fast-3d-distance-check
     *
     * @param	v1	The first point.
     * @param	v2	The second point.
     * @return		The Manhattan distance between the two points.
     */
    static manhattanDistanceBetween(v1: Vec3, v2: Vec3): number;
    /**
     * Return whether two locations are within a given manhattan distance of each other.
     * <p>
     * The manhattan distance is an approximate distance between two points, but
     * can be calculated faster than the exact distance.
     * <p>
     * Further reading:
     *     http://en.wikipedia.org/wiki/floataxicab_geometry
     *     http://stackoverflow.com/questions/3693514/very-fast-3d-distance-check
     *
     * @param	v1	The first location vector
     * @param	v2	The second location vector
     * @return	boolean
     */
    static withinManhattanDistance(v1: Vec3, v2: Vec3, distance: number): boolean;
    length(): number;
    /**
     * Return a component-wise absolute version (i.e. all components are positive) of this vector.
     * <p>
     * Note: This vector itself is not modified - a new vector is created, each component is made positive, and the new vector is returned.
     *
     * @param	source	The vector to make absolute.
     * @return		A component-wise absolute version of this vector.
     */
    static abs(source: Vec3): Vec3;
    /**
     * Return a normalised Vec3f which is perpendicular to the vector provided.
     * <p>
     * This is a very fast method of generating a perpendicular vector that works for any vector
     * which is 5 degrees or more from vertical 'up'.
     * <p>
     * The code in this method is adapted from: http://blog.selfshadow.com/2011/10/17/perp-vectors/
     *
     * @param	u	The vector to use as the basis for generating the perpendicular vector.
     * @return		A normalised vector which is perpendicular to the provided vector argument.
     */
    static genPerpendicularVectorQuick(u: Vec3): Vec3;
    /**
     * Method to generate a vector perpendicular to another one using the Hughes-Muller method.
     * <p>
     * The returned vector is normalised.
     * <p>
     * The code in this method is adapted from: http://blog.selfshadow.com/2011/10/17/perp-vectors/
     * <p>
     * Further reading: Hughes, J. F., Muller, T., "Building an Orthonormal Basis from a Unit Vector", Journal of Graphics Tools 4:4 (1999), 33-35.
     *
     * @param	u	The vector with regard to which we will generate a perpendicular unit vector.
     * @return		A normalised vector which is perpendicular to the provided vector argument.
     */
    static genPerpendicularVectorHM(u: Vec3): Vec3;
    /**
     * Method to generate a vector perpendicular to another one using the Frisvad method.
     * <p>
     * The returned vector is normalised.
     *
     * @param	u	The vector with regard to which we will generate a perpendicular unit vector.
     * @return		A normalised vector which is perpendicular to the provided vector argument.
     */
    static genPerpendicularVectorFrisvad(u: Vec3): Vec3;
    /**
     * Return the unit vector between two provided vectors.
     *
     * @param	v1	The first vector.
     * @param	v2	The second vector.
     * @return		The unit vector between the two provided vector arguments.
     */
    static getUvBetween(v1: Vec3, v2: Vec3): Vec3;
    /**
     * Calculate and return the angle between two vectors in radians.
     * <p>
     * The result will always be a positive value between zero and pi (3.14159f) radians.
     * <p>
     * This method does not modify the provided vectors, but does use normalised versions of them in the calculations.
     *
     * @param	v1	The first vector.
     * @param	v2	The second vector.
     * @return		The angle between the vector in radians.
     */
    static getAngleBetweenRads(v1: Vec3, v2: Vec3): number;
    /**
     * Calculate and return the angle between two vectors in degrees.
     * <p>
     * The result will always be a positive value between [0..180) degrees.
     * <p>
     * This method does not modify the provided vectors, but does use normalised versions of them in the calculations.
     *
     * @param	v1	The first vector.
     * @param	v2	The second vector.
     * @return		The angle between the vector in degrees.
     */
    static getAngleBetweenDegs(v1: Vec3, v2: Vec3): number;
    /**
     * Return a signed angle between two vectors within the range -179.9f..180.0f degrees.
     *
     * @param	referenceVector	The baseline vector which we consider to be at zero degrees.
     * @param	otherVector		The vector we will use to calculate the signed angle with respect to the reference vector.
     * @param	normalVector	The normal vector (i.e. vector perpendicular to) both the reference and 'other' vectors.
     * @return					The signed angle from the reference vector to the other vector in degrees.
     **/
    static getSignedAngleBetweenDegs(referenceVector: Vec3, otherVector: Vec3, normalVector: Vec3): number;
    /**
     * Return an angle limited vector with regard to another vector.
     * <p>
     * @param	vecToLimit		The vector which we will limit to a given angle with regard to the the baseline vector.
     * @param	vecBaseline		The vector which will be used as the baseline / frame-of-reference when rotating the vecToLimit.
     * @param	angleLimitDegs	The maximum angle which the vecToLimit may be rotated away from the vecBaseline, in degrees.
     * @return					The rotated vecToLimit, which is constraint to a maximum of the angleLimitDegs argument.
     */
    static getAngleLimitedUnitVectorDegs(vecToLimit: Vec3, vecBaseline: Vec3, angleLimitDegs: number): Vec3;
    /**
       * Return the global pitch of this vector about the global X-Axis. The returned value is within the range -179.9f..180.0f
  degrees.
       *
       * @return	The pitch of the vector in degrees.
       **/
    getGlobalPitchDegs(): number;
    /**
       * Return the global yaw of this vector about the global Y-Axis. The returned value is within the range -179.9f..180.0f
  degrees.
       *
       * @return	The yaw of the vector in degrees.
       **/
    getGlobalYawDegs(): number;
    /**
     * Rotate a Vec3f about the world-space X-axis by a given angle specified in radians.
     *
     * @param	source		The vector to rotate.
     * @param	angleRads	The angle to rotate the vector in radians.
     * @return				A rotated version of the vector.
     */
    static rotateXRads(source: Vec3, angleRads: number): Vec3;
    /**
     * Rotate a Vec3f about the world-space X-axis by a given angle specified in degrees.
     *
     * @param	source		The vector to rotate.
     * @param	angleDegs	The angle to rotate the vector in degrees.
     * @return				A rotated version of the vector.
     */
    static rotateXDegs(source: Vec3, angleDegs: number): Vec3;
    /**
     * Rotate a Vec3f about the world-space Y-axis by a given angle specified in radians.
     *
     * @param	source		The vector to rotate.
     * @param	angleRads	The angle to rotate the vector in radians.
     * @return				A rotated version of the vector.
     */
    static rotateYRads(source: Vec3, angleRads: number): Vec3;
    /**
     * Rotate a Vec3f about the world-space Y-axis by a given angle specified in degrees.
     *
     * @param	source		The vector to rotate.
     * @param	angleDegs	The angle to rotate the vector in degrees.
     * @return				A rotated version of the vector.
     */
    static rotateYDegs(source: Vec3, angleDegs: number): Vec3;
    /**
     * Rotate a Vec3f about the world-space Z-axis by a given angle specified in radians.
     *
     * @param	source		The vector to rotate.
     * @param	angleRads	The angle to rotate the vector in radians.
     * @return				A rotated version of the vector.
     */
    static rotateZRads(source: Vec3, angleRads: number): Vec3;
    /**
     * Rotate a Vec3f about the world-space Z-axis by a given angle specified in degrees.
     *
     * @param	source		The vector to rotate.
     * @param	angleDegs	The angle to rotate the vector in degrees.
     * @return				A rotated version of the vector.
     */
    static rotateZDegs(source: Vec3, angleDegs: number): Vec3;
    /**
     * Rotate a source vector an amount in radians about an arbitrary axis.
     *
     * @param source		The vector to rotate.
     * @param angleRads		The amount of rotation to perform in radians.
     * @param rotationAxis	The rotation axis.
     * @return				The source vector rotated about the rotation axis.
     */
    static rotateAboutAxisRads(source: Vec3, angleRads: number, rotationAxis: Vec3): Vec3;
    /**
     * Rotate a source vector an amount in degrees about an arbitrary axis.
     *
     * @param source		The vector to rotate.
     * @param angleDegs		The amount of rotation to perform in degrees.
     * @param rotationAxis	The rotation axis.
     * @return				The source vector rotated about the rotation axis.
     */
    static rotateAboutAxisDegs(source: Vec3, angleDegs: number, rotationAxis: Vec3): Vec3;
    toString(): string;
    plus(v: Vec3): Vec3;
    minus(v: Vec3): Vec3;
    times(scale: number): Vec3;
    /**
     * Add a vector to a source vector - the source vector is modified.
     * <p>
     * This method does not perform any memory allocations - it merely adds 'other' to 'source'.
     *
     *  @param	source	The vector to which we will add a vector.
     *  @param	other	The vector we will add to the 'source' vector.
     */
    static add(source: Vec3, other: Vec3): void;
    /**
     * Subtract a vector from a source vector - the source vector is modified.
     * <p>
     * This method does not perform any memory allocations - it merely subtracts 'other' from 'source'.
     *
     *  @param	source	The vector to which we will subtract a vector.
     *  @param	other	The vector we will suctract from the 'source' vector.
     */
    static subtract(source: Vec3, other: Vec3): void;
    dividedBy(value: number): Vec3;
    /**
     * Return a vector which is the result of projecting this vector onto a plane described by the provided surface normal.
     * <p>
     * Neither the vector on which this method is called or the provided plane normal vector are modified.
     * <p>
     * If the plane surface normal has a magnitude of zero then an IllegalArgumentException is thrown.
     *
     * @param	planeNormal	The normal that describes the plane onto which we will project this vector.
     * @return				A projected version of this vector.
     */
    projectOntoPlane(planeNormal: Vec3): Vec3;
    /**
     * Calculate and return the direction unit vector from point a to point b.
     * <p>
     * If the opposite direction is required then the argument order can be swapped or the the result can simply be negated.
     *
     * @param	v1	The first location.
     * @param	v2	The second location.
     * @return		The normalised direction unit vector between point v1 and point v2.
     */
    static getDirectionUV(v1: Vec3, v2: Vec3): Vec3;
    /**
     * Randomise the components of this vector to be random values between the provided half-open range as described by the minimum and maximum value arguments.
     *
     * @param	min	The minimum value for any given component (inclusive).
     * @param	max	The maximum value for any given component (exclusive, i.e. a max of 5.0f will be assigned values up to 4.9999f or such).
     **/
    randomise(min: number, max: number): void;
    equals(obj: Object): boolean;
    static centerPoint(v1: Vec3, v2: Vec3): Vec3;
}
