import {Mat3} from './Mat3';
import {Utils} from './Utils';
import {Vector} from './Vector';

export class Vec3 implements Vector<Vec3> {
  private static DEGS_TO_RADS = Math.PI / 180.0;
  private static RADS_TO_DEGS = 180.0 / Math.PI;

  private static X_AXIS: Vec3 = new Vec3(1.0, 0.0, 0.0);
  private static Y_AXIS: Vec3 = new Vec3(0.0, 1.0, 0.0);
  private static Z_AXIS: Vec3 = new Vec3(0.0, 0.0, 1.0);

  public x: number;
  public y: number;
  public z: number;

  constructor(x: number = 0, y: number = 0, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public static clone(source: Vec3): Vec3 {
    return new Vec3(source.x, source.y, source.z);
  }

  public set(source: Vec3): void {
    this.x = source.x;
    this.y = source.y;
    this.z = source.z;
  }

  public approximatelyEquals(v: Vec3, tolerance: number): boolean {
    if (tolerance < 0) {
      throw new Error(
        'Equality threshold must be greater than or equal to 0.0f'
      );
    }

    // Get the absolute differences between the components
    const xDiff = Math.abs(this.x - v.x);
    const yDiff = Math.abs(this.y - v.y);
    const zDiff = Math.abs(this.z - v.z);

    // Return true or false
    return xDiff < tolerance && yDiff < tolerance && zDiff < tolerance;
  }

  /**
   * Return whether the two provided vectors are perpendicular (to a dot-product tolerance of 0.01f).
   *
   * @param	a	The first vector.
   * @param	b	The second vector.
   * @return		Whether the two provided vectors are perpendicular (true) or not (false).
   */
  public static perpendicular(a: Vec3, b: Vec3): boolean {
    return Utils.approximatelyEquals(Vec3.dotProduct(a, b), 0.0, 0.01)
      ? true
      : false;
  }

  /**
   * Return whether the length of this Vec3f is approximately equal to a given value to within a given tolerance.
   *
   * @param	value		The value to compare the length of this vector to.
   * @param	tolerance	The tolerance within which the values must be to return true.
   * @return				A boolean indicating whether the length of this vector is approximately the same as that of the provided value.
   */
  public lengthIsApproximately(value: number, tolerance: number): boolean {
    // Check for a valid tolerance
    if (tolerance < 0.0) {
      throw new Error('Comparison tolerance cannot be less than zero.');
    }

    if (Math.abs(this.length() - value) < tolerance) {
      return true;
    }

    return false;
  }

  public zero(): void {
    this.x = this.y = this.z = 0.0;
  }

  /**
   * Negate and return this vector.
   * <p>
   * Note: It is actually <em>this</em> vector which is negated and returned, not a copy / clone.
   *
   * @return	This vector negated.
   */
  public negate(): Vec3 {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;

    // Return this for chaining
    return this;
  }

  public negated(): Vec3 {
    return new Vec3(-this.x, -this.y, -this.z);
  }

  /**
   * Return whether two vectors are approximately equal to within a given tolerance.
   *
   * @param	a		The first vector.
   * @param	b		The second vector.
   * @param	tolerance	The value which each component of each vector must be within to be considered approximately equal.
   * @return			Whether the two provided vector arguments are approximately equal (true) or not (false).
   */
  public static approximatelyEqual(
    a: Vec3,
    b: Vec3,
    tolerance: number
  ): boolean {
    if (
      Math.abs(a.x - b.x) < tolerance &&
      Math.abs(a.y - b.y) < tolerance &&
      Math.abs(a.z - b.z) < tolerance
    ) {
      return true;
    }

    return false;
  }

  public normalise(): Vec3 {
    // Calculate the magnitude of our vector
    const magnitude = Math.sqrt(
      this.x * this.x + this.y * this.y + this.z * this.z
    );

    // As long as the magnitude is greater then zero, divide each element by the
    // magnitude to get the normalised value between -1 and +1.
    // Note: If the vector has a magnitude of zero we simply return it - we
    // could instead throw a RuntimeException here... but it's better to continue.
    if (magnitude > 0.0) {
      this.x /= magnitude;
      this.y /= magnitude;
      this.z /= magnitude;
    }

    // Return this for chaining
    return this;
  }

  /**
   * Return a normalised version of this vector without modifying 'this' vector.
   *
   * @return	A normalised version of this vector.
   */
  public normalised(): Vec3 {
    return new Vec3(this.x, this.y, this.z).normalise();
  }

  /**
   * Return the scalar product of two vectors.
   * <p>
   * If the provided vectors are normalised then this will be the same as the dot product.
   *
   * @param	v1	The first vector.
   * @param	v2	The second vector.
   * @return		The scalar product of the two vectors.
   */
  public static scalarProduct(v1: Vec3, v2: Vec3): number {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  }

  /**
   * Return the scalar product of two vectors.
   * <p>
   * Normalised versions of the provided vectors are used in the dot product operation.
   *
   * @param	v1	The first vector.
   * @param	v2	The second vector.
   * @return		The dot product of the two vectors.
   */
  public static dotProduct(v1: Vec3, v2: Vec3): number {
    const v1Norm = v1.normalised();
    const v2Norm = v2.normalised();

    return v1Norm.x * v2Norm.x + v1Norm.y * v2Norm.y + v1Norm.z * v2Norm.z;
  }

  /**
   * Calculate and return a vector which is the cross product of the two provided vectors.
   * <p>
   * The returned vector is not normalised.
   *
   * @param	v1	The first vector.
   * @param	v2	The second vector.
   * @return		The non-normalised cross-product of the two vectors v1-cross-v2.
   */
  public static crossProduct(v1: Vec3, v2: Vec3): Vec3 {
    return new Vec3(
      v1.y * v2.z - v1.z * v2.y,
      v1.z * v2.x - v1.x * v2.z,
      v1.x * v2.y - v1.y * v2.x
    );
  }

  /**
   * Calculate and return a vector which is the cross product of this vector and another vector.
   * <p>
   * The returned vector is not normalised.
   *
   * @param	v	The Vec3f with which we will cross product this Vec3f.
   * @return		The non-normalised cross product if the two vectors this-cross-v.
   */
  public cross(v: Vec3): Vec3 {
    return new Vec3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }

  /**
   * Calculate and return the distance between two points in 3D space.
   *
   * @param	v1	The first point.
   * @param	v2	The second point.
   * @return		The distance between the two points.
   */
  public static distanceBetween(v1: Vec3, v2: Vec3): number {
    const dx = v2.x - v1.x;
    const dy = v2.y - v1.y;
    const dz = v2.z - v1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

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
  public static manhattanDistanceBetween(v1: Vec3, v2: Vec3): number {
    return (
      Math.abs(v2.x - v1.x) + Math.abs(v2.y - v1.y) + Math.abs(v2.z - v1.z)
    );
  }

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
  public static withinManhattanDistance(
    v1: Vec3,
    v2: Vec3,
    distance: number
  ): boolean {
    if (Math.abs(v2.x - v1.x) > distance) return false; // Too far in x direction
    if (Math.abs(v2.y - v1.y) > distance) return false; // Too far in y direction
    if (Math.abs(v2.z - v1.z) > distance) return false; // Too far in z direction
    return true;
  }

  public length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  /**
   * Return a component-wise absolute version (i.e. all components are positive) of this vector.
   * <p>
   * Note: This vector itself is not modified - a new vector is created, each component is made positive, and the new vector is returned.
   *
   * @param	source	The vector to make absolute.
   * @return		A component-wise absolute version of this vector.
   */
  public static abs(source: Vec3): Vec3 {
    const absVector = new Vec3();

    if (source.x < 0.0) {
      absVector.x = -source.x;
    } else {
      absVector.x = source.x;
    }
    if (source.y < 0.0) {
      absVector.y = -source.y;
    } else {
      absVector.y = source.y;
    }
    if (source.z < 0.0) {
      absVector.z = -source.z;
    } else {
      absVector.z = source.z;
    }

    return absVector;
  }

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
  public static genPerpendicularVectorQuick(u: Vec3): Vec3 {
    let perp: Vec3;

    if (Math.abs(u.y) < 0.99) {
      perp = new Vec3(-u.z, 0.0, u.x); // cross(u, UP)
    } else {
      perp = new Vec3(0.0, u.z, -u.y); // cross(u, RIGHT)
    }

    return perp.normalise();
  }

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
  public static genPerpendicularVectorHM(u: Vec3): Vec3 {
    // Get the absolute source vector
    const a = Vec3.abs(u);

    if (a.x <= a.y && a.x <= a.z) {
      return new Vec3(0.0, -u.z, u.y).normalise();
    } else if (a.y <= a.x && a.y <= a.z) {
      return new Vec3(-u.z, 0.0, u.x).normalise();
    } else {
      return new Vec3(-u.y, u.x, 0.0).normalise();
    }
  }

  //TODO: Test if better than Quick version and document.
  /**
   * Method to generate a vector perpendicular to another one using the Frisvad method.
   * <p>
   * The returned vector is normalised.
   *
   * @param	u	The vector with regard to which we will generate a perpendicular unit vector.
   * @return		A normalised vector which is perpendicular to the provided vector argument.
   */
  public static genPerpendicularVectorFrisvad(u: Vec3): Vec3 {
    if (u.z < -0.9999999) {
      // Handle the singularity
      return new Vec3(0.0, -1.0, 0.0);
      //b2 = Vec3f(-1.0f,  0.0f, 0.0f);
      //return;
    }

    const a = 1.0 / (1.0 + u.z);
    //float b = -n.x*n.y*a;
    return new Vec3(1.0 - u.x * u.x * a, -u.x * u.y * a, -u.x).normalised();
    //b2 = Vec3f(b, 1.0f - n.y*n.y*a, -n.y);
  }

  /**
   * Return the unit vector between two provided vectors.
   *
   * @param	v1	The first vector.
   * @param	v2	The second vector.
   * @return		The unit vector between the two provided vector arguments.
   */
  public static getUvBetween(v1: Vec3, v2: Vec3): Vec3 {
    return new Vec3(v2.minus(v1).x, v2.minus(v1).y, v2.minus(v1).z).normalise();
  }

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
  public static getAngleBetweenRads(v1: Vec3, v2: Vec3): number {
    // Note: a and b are normalised within the dotProduct method.
    return Math.acos(Vec3.dotProduct(v1, v2));
  }

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
  public static getAngleBetweenDegs(v1: Vec3, v2: Vec3): number {
    return Vec3.getAngleBetweenRads(v1, v2) * Vec3.RADS_TO_DEGS;
  }

  /**
   * Return a signed angle between two vectors within the range -179.9f..180.0f degrees.
   *
   * @param	referenceVector	The baseline vector which we consider to be at zero degrees.
   * @param	otherVector		The vector we will use to calculate the signed angle with respect to the reference vector.
   * @param	normalVector	The normal vector (i.e. vector perpendicular to) both the reference and 'other' vectors.
   * @return					The signed angle from the reference vector to the other vector in degrees.
   **/
  public static getSignedAngleBetweenDegs(
    referenceVector: Vec3,
    otherVector: Vec3,
    normalVector: Vec3
  ): number {
    const unsignedAngle = Vec3.getAngleBetweenDegs(
      referenceVector,
      otherVector
    );
    const sign = Utils.sign(
      Vec3.dotProduct(
        Vec3.crossProduct(referenceVector, otherVector),
        normalVector
      )
    );
    return unsignedAngle * sign;
  }

  /**
   * Return an angle limited vector with regard to another vector.
   * <p>
   * @param	vecToLimit		The vector which we will limit to a given angle with regard to the the baseline vector.
   * @param	vecBaseline		The vector which will be used as the baseline / frame-of-reference when rotating the vecToLimit.
   * @param	angleLimitDegs	The maximum angle which the vecToLimit may be rotated away from the vecBaseline, in degrees.
   * @return					The rotated vecToLimit, which is constraint to a maximum of the angleLimitDegs argument.
   */
  public static getAngleLimitedUnitVectorDegs(
    vecToLimit: Vec3,
    vecBaseline: Vec3,
    angleLimitDegs: number
  ): Vec3 {
    // Get the angle between the two vectors
    // Note: This will ALWAYS be a positive value between 0 and 180 degrees.
    const angleBetweenVectorsDegs = Vec3.getAngleBetweenDegs(
      vecBaseline,
      vecToLimit
    );

    if (angleBetweenVectorsDegs > angleLimitDegs) {
      // The axis which we need to rotate around is the one perpendicular to the two vectors - so we're
      // rotating around the vector which is the cross-product of our two vectors.
      // Note: We do not have to worry about both vectors being the same or pointing in opposite directions
      // because if they bones are the same direction they will not have an angle greater than the angle limit,
      // and if they point opposite directions we will approach but not quite reach the precise max angle
      // limit of 180.0f (I believe).
      const correctionAxis = Vec3.crossProduct(
        vecBaseline.normalised(),
        vecToLimit.normalised()
      ).normalise();

      // Our new vector is the baseline vector rotated by the max allowable angle about the correction axis
      return Vec3.rotateAboutAxisDegs(
        vecBaseline,
        angleLimitDegs,
        correctionAxis
      ).normalised();
    } // Angle not greater than limit? Just return a normalised version of the vecToLimit
    else {
      // This may already BE normalised, but we have no way of knowing without calcing the length, so best be safe and normalise.
      // TODO: If performance is an issue, then I could get the length, and if it's not approx. 1.0f THEN normalise otherwise just return as is.
      return vecToLimit.normalised();
    }
  }

  /**
	 * Return the global pitch of this vector about the global X-Axis. The returned value is within the range -179.9f..180.0f 
degrees.
	 *
	 * @return	The pitch of the vector in degrees.
	 **/
  public getGlobalPitchDegs(): number {
    const xProjected = this.projectOntoPlane(Vec3.X_AXIS);
    const pitch = Vec3.getAngleBetweenDegs(Vec3.Z_AXIS.negated(), xProjected);
    return xProjected.y < 0.0 ? -pitch : pitch;
  }

  /**
	 * Return the global yaw of this vector about the global Y-Axis. The returned value is within the range -179.9f..180.0f 
degrees.
	 *
	 * @return	The yaw of the vector in degrees.
	 **/
  public getGlobalYawDegs(): number {
    const yProjected = this.projectOntoPlane(Vec3.Y_AXIS);
    const yaw = Vec3.getAngleBetweenDegs(Vec3.Z_AXIS.negated(), yProjected);
    return yProjected.x < 0.0 ? -yaw : yaw;
  }

  /**
   * Rotate a Vec3f about the world-space X-axis by a given angle specified in radians.
   *
   * @param	source		The vector to rotate.
   * @param	angleRads	The angle to rotate the vector in radians.
   * @return				A rotated version of the vector.
   */
  public static rotateXRads(source: Vec3, angleRads: number): Vec3 {
    // Rotation about the x-axis:
    // x' = x
    // y' = y*cos q - z*sin q
    // z' = y*sin q + z*cos q

    const cosTheta = Math.cos(angleRads);
    const sinTheta = Math.sin(angleRads);

    return new Vec3(
      source.x,
      source.y * cosTheta - source.z * sinTheta,
      source.y * sinTheta + source.z * cosTheta
    );
  }

  /**
   * Rotate a Vec3f about the world-space X-axis by a given angle specified in degrees.
   *
   * @param	source		The vector to rotate.
   * @param	angleDegs	The angle to rotate the vector in degrees.
   * @return				A rotated version of the vector.
   */
  public static rotateXDegs(source: Vec3, angleDegs: number): Vec3 {
    return Vec3.rotateXRads(source, angleDegs * Vec3.DEGS_TO_RADS);
  }

  /**
   * Rotate a Vec3f about the world-space Y-axis by a given angle specified in radians.
   *
   * @param	source		The vector to rotate.
   * @param	angleRads	The angle to rotate the vector in radians.
   * @return				A rotated version of the vector.
   */
  public static rotateYRads(source: Vec3, angleRads: number): Vec3 {
    // Rotation about the y axis:
    // x' = z*sin q + x*cos q
    // y' = y
    // z' = z*cos q - x*sin q

    const cosTheta = Math.cos(angleRads);
    const sinTheta = Math.sin(angleRads);

    return new Vec3(
      source.z * sinTheta + source.x * cosTheta,
      source.y,
      source.z * cosTheta - source.x * sinTheta
    );
  }

  /**
   * Rotate a Vec3f about the world-space Y-axis by a given angle specified in degrees.
   *
   * @param	source		The vector to rotate.
   * @param	angleDegs	The angle to rotate the vector in degrees.
   * @return				A rotated version of the vector.
   */
  public static rotateYDegs(source: Vec3, angleDegs: number): Vec3 {
    return Vec3.rotateYRads(source, angleDegs * Vec3.DEGS_TO_RADS);
  }

  /**
   * Rotate a Vec3f about the world-space Z-axis by a given angle specified in radians.
   *
   * @param	source		The vector to rotate.
   * @param	angleRads	The angle to rotate the vector in radians.
   * @return				A rotated version of the vector.
   */
  public static rotateZRads(source: Vec3, angleRads: number): Vec3 {
    // Rotation about the z-axis:
    // x' = x*cos q - y*sin q
    // y' = x*sin q + y*cos q
    // z' = z

    const cosTheta = Math.cos(angleRads);
    const sinTheta = Math.sin(angleRads);

    return new Vec3(
      source.x * cosTheta - source.y * sinTheta,
      source.x * sinTheta + source.y * cosTheta,
      source.z
    );
  }

  /**
   * Rotate a Vec3f about the world-space Z-axis by a given angle specified in degrees.
   *
   * @param	source		The vector to rotate.
   * @param	angleDegs	The angle to rotate the vector in degrees.
   * @return				A rotated version of the vector.
   */
  public static rotateZDegs(source: Vec3, angleDegs: number): Vec3 {
    return Vec3.rotateZRads(source, angleDegs * Vec3.DEGS_TO_RADS);
  }

  /**
   * Rotate a source vector an amount in radians about an arbitrary axis.
   *
   * @param source		The vector to rotate.
   * @param angleRads		The amount of rotation to perform in radians.
   * @param rotationAxis	The rotation axis.
   * @return				The source vector rotated about the rotation axis.
   */
  public static rotateAboutAxisRads(
    source: Vec3,
    angleRads: number,
    rotationAxis: Vec3
  ): Vec3 {
    const rotationMatrix = new Mat3();

    const sinTheta = Math.sin(angleRads);
    const cosTheta = Math.cos(angleRads);
    const oneMinusCosTheta = 1.0 - cosTheta;

    // It's quicker to pre-calc these and reuse than calculate x * y, then y * x later (same thing).
    const xyOne = rotationAxis.x * rotationAxis.y * oneMinusCosTheta;
    const xzOne = rotationAxis.x * rotationAxis.z * oneMinusCosTheta;
    const yzOne = rotationAxis.y * rotationAxis.z * oneMinusCosTheta;

    // Calculate rotated x-axis
    rotationMatrix.m00 =
      rotationAxis.x * rotationAxis.x * oneMinusCosTheta + cosTheta;
    rotationMatrix.m01 = xyOne + rotationAxis.z * sinTheta;
    rotationMatrix.m02 = xzOne - rotationAxis.y * sinTheta;

    // Calculate rotated y-axis
    rotationMatrix.m10 = xyOne - rotationAxis.z * sinTheta;
    rotationMatrix.m11 =
      rotationAxis.y * rotationAxis.y * oneMinusCosTheta + cosTheta;
    rotationMatrix.m12 = yzOne + rotationAxis.x * sinTheta;

    // Calculate rotated z-axis
    rotationMatrix.m20 = xzOne + rotationAxis.y * sinTheta;
    rotationMatrix.m21 = yzOne - rotationAxis.x * sinTheta;
    rotationMatrix.m22 =
      rotationAxis.z * rotationAxis.z * oneMinusCosTheta + cosTheta;

    // Multiply the source by the rotation matrix we just created to perform the rotation
    return rotationMatrix.timesByVec3(source);
  }

  /**
   * Rotate a source vector an amount in degrees about an arbitrary axis.
   *
   * @param source		The vector to rotate.
   * @param angleDegs		The amount of rotation to perform in degrees.
   * @param rotationAxis	The rotation axis.
   * @return				The source vector rotated about the rotation axis.
   */
  public static rotateAboutAxisDegs(
    source: Vec3,
    angleDegs: number,
    rotationAxis: Vec3
  ): Vec3 {
    return Vec3.rotateAboutAxisRads(
      source,
      angleDegs * Vec3.DEGS_TO_RADS,
      rotationAxis
    );
  }

  public toString(): string {
    return `x: ${this.x}, y: ${this.y}, z: ${this.z}`;
  }

  public plus(v: Vec3): Vec3 {
    return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  public minus(v: Vec3): Vec3 {
    return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  public times(scale: number): Vec3 {
    return new Vec3(this.x * scale, this.y * scale, this.z * scale);
  }

  /**
   * Add a vector to a source vector - the source vector is modified.
   * <p>
   * This method does not perform any memory allocations - it merely adds 'other' to 'source'.
   *
   *  @param	source	The vector to which we will add a vector.
   *  @param	other	The vector we will add to the 'source' vector.
   */
  public static add(source: Vec3, other: Vec3): void {
    source.x += other.x;
    source.y += other.y;
    source.z += other.z;
  }

  /**
   * Subtract a vector from a source vector - the source vector is modified.
   * <p>
   * This method does not perform any memory allocations - it merely subtracts 'other' from 'source'.
   *
   *  @param	source	The vector to which we will subtract a vector.
   *  @param	other	The vector we will suctract from the 'source' vector.
   */
  public static subtract(source: Vec3, other: Vec3): void {
    source.x -= other.x;
    source.y -= other.y;
    source.z -= other.z;
  }

  public dividedBy(value: number): Vec3 {
    return new Vec3(this.x / value, this.y / value, this.z / value);
  }

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
  public projectOntoPlane(planeNormal: Vec3): Vec3 {
    if (!(planeNormal.length() > 0.0)) {
      throw new Error('Plane normal cannot be a zero vector.');
    }

    // Projection of vector b onto plane with normal n is defined as: b - ( b.n / ( |n| squared )) * n
    // Note: |n| is length or magnitude of the vector n, NOT its (component-wise) absolute value
    const b = this.normalised();
    const n = planeNormal.normalised();
    return b.minus(n.times(Vec3.dotProduct(b, planeNormal))).normalise();

    /** IMPORTANT: We have to be careful here - even code like the below (where dotProduct uses normalised
     *             versions of 'this' and planeNormal is off by enough to make the IK solutions oscillate:
     *
     *             return this.minus( planeNormal.times( Vec3f.dotProduct(this, planeNormal) ) ).normalised();
     *
     */

    // Note: For non-normalised plane vectors we can use:
    // float planeNormalLength = planeNormal.length();
    // return b.minus( n.times( Vec3f.dotProduct(b, n) / (planeNormalLength * planeNormalLength) ).normalised();
  }

  /**
   * Calculate and return the direction unit vector from point a to point b.
   * <p>
   * If the opposite direction is required then the argument order can be swapped or the the result can simply be negated.
   *
   * @param	v1	The first location.
   * @param	v2	The second location.
   * @return		The normalised direction unit vector between point v1 and point v2.
   */
  public static getDirectionUV(v1: Vec3, v2: Vec3): Vec3 {
    return v2.minus(v1).normalise();
  }

  /**
   * Randomise the components of this vector to be random values between the provided half-open range as described by the minimum and maximum value arguments.
   *
   * @param	min	The minimum value for any given component (inclusive).
   * @param	max	The maximum value for any given component (exclusive, i.e. a max of 5.0f will be assigned values up to 4.9999f or such).
   **/
  public randomise(min: number, max: number): void {
    this.x = Utils.randRangeFloat(min, max);
    this.y = Utils.randRangeFloat(min, max);
    this.z = Utils.randRangeFloat(min, max);
  }

  public equals(obj: Object): boolean {
    if (this == obj) {
      return true;
    }

    if (obj == null) {
      return false;
    }

    const other = obj as Vec3;

    if (this.x != other.x) {
      return false;
    }

    if (this.y != other.y) {
      return false;
    }

    if (this.z != other.z) {
      return false;
    }

    return true;
  }

  public static centerPoint(v1: Vec3, v2: Vec3): Vec3 {
    return new Vec3((v1.x + v2.x) / 2, (v1.y + v2.y) / 2, (v1.z + v2.z) / 2);
  }
}
