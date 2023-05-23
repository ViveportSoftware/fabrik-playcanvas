import { Mat3 } from './Mat3';
import { Vec3 } from './Vec3';
/**
 * A class to represent a 4x4 matrix.
 * <p>
 * The Mat4f class contains 16 public member properties m00 through m15 which are
 * <strong>column major</strong>, so our matrix looks like this:
 * <p>
 * m00  m10  m20  m30
 * <p>
 * m01	m11  m21  m31
 * <p>
 * m02	m12  m22  m32
 * <p>
 * m03	m13  m23  m33
 * <p>
 * For each property the first digit is the column, and the second digit is the row.
 *
 * The identity matrix specifies a left-handed coordinate system whereby if you put your left
 * hand in front of you with your thumb pointing towards yourself, your index finger pointing
 * directly up and your middle finger pointing to the right, then:
 * <ul>
 * <li>The direction of the middle finger is the positive X-axis,</li>
 * <li>The direction of the index  finger is the positive Y-axis, and</li>
 * <li>The direction of the thumb         is the positive Z-axis.</li>
 * </ul>
 * <p>
 * This corresponds to the coordinate system used by OpenGL.
 * <p>
 * Rotations are performed in accordance with the right-hand rule, that is, if you were to grip
 * an axis with your thumb pointing towards the positive end of the axis, rotating in a positive
 * direction would follow the curl of your fingers in an anti-clockwise direction, and rotation
 * by a negative amount would go in the opposite (clockwise) direction.
 *
 * @author Al Lansley
 * @version 0.5 - 22/12/2014
 */
export declare class Mat4 {
    private static DEGS_TO_RADS;
    /** Constant used to determine if a float is approximately equal to another float value. */
    private static FLOAT_EQUALITY_TOLERANCE;
    m00: number;
    m01: number;
    m02: number;
    m03: number;
    m10: number;
    m11: number;
    m12: number;
    m13: number;
    m20: number;
    m21: number;
    m22: number;
    m23: number;
    m30: number;
    m31: number;
    m32: number;
    m33: number;
    /**
     * Default constructor.
     * <p>
     * All member properties are implicitly set to zero by Java as that is the default value of a float primitive.
     */
    Mat4f(): void;
    /**
     * Copy constructor.
     * <p>
     * Copies all properties from the source matrix into the newly constructed matrix.
     *
     * @param	source	The matrix to copy the values from.
     */
    /**
     * Constructor to create a Mat4f from a Mat3f and an origin.
     *
     * @param	rotationMatrix	The Mat3f to use for the X/Y/Z axes.
     * @param	origin			The Vec3f to use as the origin.
     */
    /**
     * Float array constructor.
     * <p>
     * The matrix is set a column at a time, so the first four floats from the source array are set on m0
     * to m03, the next four on m10 to m13 and so on.
     * <p>
     * If the source array is not an array of precisely 16 floats then a IllegalArgumentException is thrown.
     *
     * @param	source	The array of 16 floats used as the source values to set on this Mat4f.
     */
    /**
     * One parameter constructor.
     * <p>
     * Sets the provided value diagonally across the matrix. For example, to create an identity matrix with
     * 1.0f across the diagonal then you can call:
     * <p>
     * {@code Mat4f m = new Mat4f(1.0f)}
     * <p>
     * Which will result in a matrix with the following properties:
     * <p>
     * 1.0f  0.0f  0.0f  0.0f
     * <p>
     * 0.0f  1.0f  0.0f  0.0f
     * <p>
     * 0.0f  0.0f  1.0f  0.0f
     * <p>
     * 0.0f  0.0f  0.0f  1.0f
     *
     * @param	value	The value to set across the diagonal of the matrix.
     */
    static NewByOneValue(value: number): Mat4;
    /**
     * Zero all properties of a matrix.
     */
    zero(): void;
    /**
     * Reset a matrix to the identity matrix.
     * <p>
     * The matrix is set as follows:
     * <p>
     * 1.0f  0.0f  0.0f  0.0f
     * <p>
     * 0.0f  1.0f  0.0f  0.0f
     * <p>
     * 0.0f  0.0f  1.0f  0.0f
     * <p>
     * 0.0f  0.0f  0.0f  1.0f
     */
    setIdentity(): void;
    /**
     * Set the details of this Mat4f from an array of 16 floats.
     * <p>
     * The matrix is set a column at a time, so the first four floats from the source array are set on m0
     * to m03, the next four on m10 to m13 and so on.
     * <p>
     * If the source array is not an array of precisely 16 floats then a IllegalArgumentException is thrown.
     *
     * @param	source	The array of 16 floats used as the source values to set on this Mat4f.
     */
    setFromArray(source: number[]): void;
    /**
     * Return the x-basis of this Mat4f as a Vec3f.
     * <p>
     * The x-basis is the orientation of the x-axis, as held by the m00, m01 and m02 properties.
     *
     * @return		A Vec3f containing the x-basis of this Mat4f.
     */
    getXBasis(): Vec3;
    /**
     * Return the x-basis of this Mat4f as an array of three floats.
     * <p>
     * The x-basis is the orientation of the x-axis, as held by the m00, m01 and m02 properties.
     * <p>
     * This method is provided to allow for interoperability for users who do not want to use the {@link Vec3f} class.
     *
     * @return		An array of three floats containing the x-basis of this Mat4f.
     */
    getXBasisArray(): number[];
    /**
     * Set the x-basis of this Mat4f from a provided Vec3f.
     * <p>
     * The x-basis is the orientation of the x-axis, as held by the m00, m01 and m02 properties.
     * <p>
     * To ensure the legality of the x-basis, the provided Vec3f is normalised if required before being set.
     * <p>
     * If you wish to use this class for storing matrices which do not represent a rotation matrix
     * then you should avoid the setXBasis/setYBasis/setZBasis methods and instead set the matrix
     * properties via other methods which accept a float array and do not attempt to enforce
     * rotation matrix legality such as {@link #setFromArray(float[])} and {@link #Mat4f(float[])}.
     *
     * @param	v	The Vec3f holding the x-basis to set.
     * @see #setFromArray(float[])
     * @see #Mat4f(float[])
     */
    setXBasis(v: Vec3): void;
    /**
     * Set the x-basis of this Mat4f from a provided array of three floats.
     * <p>
     * The x-basis is the orientation of the x-axis, as held by the m00, m01 and m02 properties.
     * <p>
     * To ensure the legality of the x-basis, the provided array is converted into a Vec3f and
     * normalised (if required) before being set.
     * <p>
     * If you wish to use this class for storing matrices which do not represent a rotation matrix
     * then you should avoid the setXBasis/setYBasis/setZBasis methods and instead set the matrix
     * properties via other methods which do not enforce normalisation such as the
     * {@link #setFromArray(float[])} and {@link #Mat4f(float[])} methods.
     *
     * @param	f	The array of three floats to set as the x-basis of this Mat4f.
     * @see		#setFromArray(float[])
     * @see		#Mat4f(float[])
     */
    /**
     * Return the y-basis of this Mat4f as a Vec3f.
     * <p>
     * The y-basis is the orientation of theyx-axis, as held by the m10, m11 and m12 properties.
     *
     * @return		A Vec3f containing the y-basis of this Mat4f.
     */
    getYBasis(): Vec3;
    /**
     * Return the y-basis of this Mat4f as an array of three floats.
     * <p>
     * The y-basis is the orientation of the y-axis, as held by the m10, m11 and m12 properties.
     * <p>
     * This method is provided to allow for interoperability for users who do not want to use the {@link Vec3f} class.
     *
     * @return		An array of three floats containing the y-basis of this Mat4f.
     */
    getYBasisArray(): number[];
    /**
     * Set the y-basis of this Mat4f from a provided Vec3f.
     * <p>
     * The y-basis is the orientation of the y-axis, as held by the m10, m11 and m12 properties.
     * <p>
     * To ensure the legality of the y-basis, the provided Vec3f is normalised if required before being set.
     * <p>
     * If you wish to use this class for storing matrices which do not represent a rotation matrix
     * then you should avoid the setXBasis/setYBasis/setZBasis methods and instead set the matrix
     * properties via other methods which do not enforce normalisation such as the
     * {@link #setFromArray(float[])} and {@link #Mat4f(float[])} methods.
     *
     * @param	v	The Vec3f holding the y-basis to set.
     * @see		#setFromArray(float[])
     * @see		#Mat4f(float[])
     */
    setYBasis(v: Vec3): void;
    /**
     * Set the y-basis of this Mat4f from a provided array of three floats.
     * <p>
     * The y-basis is the orientation of the y-axis, as held by the m10, m11 and m12 properties.
     * <p>
     * To ensure the legality of the y-basis, the provided array is converted into a Vec3f and
     * normalised (if required) before being set.
     * <p>
     * If you wish to use this class for storing matrices which do not represent a rotation matrix
     * then you should avoid the setXBasis/setYBasis/setZBasis methods and instead set the matrix
     * properties via other methods which do not enforce normalisation such as the
     * {@link #setFromArray(float[])} and {@link #Mat4f(float[])} methods.
     *
     * @param	f	The array of three floats to set as the y-basis of this Mat4f.
     * @see		#setFromArray(float[])
     * @see		#Mat4f(float[])
     */
    /**
     * Return the z-basis of this Mat4f as a Vec3f.
     * <p>
     * The z-basis is the orientation of the x-axis, as held by the m20, m21 and m22 properties.
     *
     * @return		A Vec3f containing the z-basis of this Mat4f.
     */
    getZBasis(): Vec3;
    /**
     * Return the z-basis of this Mat4f as an array of three floats.
     * <p>
     * The z-basis is the orientation of the z-axis, as held by the m20, m21 and m22 properties.
     * <p>
     * This method is provided to allow for interoperability for users who do not want to use the {@link Vec3f} class.
     *
     * @return		An array of three floats containing the y-basis of this Mat4f.
     */
    getZBasisArray(): number[];
    /**
     * Set the z-basis of this Mat4f from a provided Vec3f.
     * <p>
     * The z-basis is the orientation of the z-axis, as held by the m20, m21 and m22 properties.
     * <p>
     * To ensure the legality of the z-basis, the provided Vec3f is normalised if required before being set.
     * If you wish to use this class for storing matrices which do not represent a rotation matrix
     * then you should avoid the setXBasis/setYBasis/setZBasis methods and instead set the matrix
     * properties via other methods which do not enforce normalisation such as the
     * {@link #setFromArray(float[])} and {@link #Mat4f(float[])} methods.
     *
     * @param	v	The Vec3f holding the z-basis to set.
     * @see #setFromArray(float[])
     * @see #Mat4f(float[])
     */
    setZBasis(v: Vec3): void;
    /**
     * Set the z-basis of this Mat4f from a provided array of three floats.
     * <p>
     * The z-basis is the orientation of the z-axis, as held by the m20, m21 and m22 properties.
     * <p>
     * To ensure the legality of the z-basis, the provided array is converted into a Vec3f and
     * normalised (if required) before being set.
     * <p>
     * If you wish to use this class for storing matrices which do not represent a rotation matrix
     * then you should avoid the setXBasis/setYBasis/setZBasis methods and instead set the matrix
     * properties via other methods which do not enforce normalisation such as the
     * {@link #setFromArray(float[])} and {@link #Mat4f(float[])} methods.
     *
     * @param	f	The array of three floats to set as the z-basis of this Mat4f.
     * @see 	#setFromArray(float[])
     * @see 	#Mat4f(float[])
     */
    /**
     * Return the origin of this Mat4f.
     *
     * @return		A Vec3f of the origin location of this Mat4f, as stored in the m30, m31 and m32 properties.
     */
    getOrigin(): Vec3;
    /**
     * Set the origin of this Mat4f.
     * <p>
     * The origin is stored in the matrix properties m30 (x location), m31 (y location) and m32 (z location).
     * <p>
     * As the origin may be at any location, as such it is <em>not</em> normalised before being set.
     *
     * @param	v	The origin of this Mat4f as a Vec3f.
     */
    setOrigin(v: Vec3): void;
    /**
     * Return whether or not all three axes of this Mat4f are orthogonal (i.e. at 90 degrees to each other).
     * <p>
     * Any two axes, such as x/y, x/z or y/z will be orthogonal if their dot product is zero. However, to
     * account for floating point precision errors, this method accepts that two axes are orthogonal if
     * their dot product is less than or equal to 0.01f.
     * <p>
     * If you want to find out if any two specific axes are orthogonal, then you can use code similar to the
     * following:
     * <p>
     * {@code boolean xDotYOrthogonal = Math.abs( xAxis.dot(yAxis) ) <= 0.01f;}
     *
     * @return		A boolean indicating whether this Mat4f is orthogonal or not.
     */
    isOrthogonal(): boolean;
    /**
     * Transpose this Mat4f.
     * <p>
     * <strong>This</strong> Mat4f is transposed, not a copy.
     * <p>
     * If you want to return a transposed version of a Mat4f <em>without modifying</em> the source
     * then use the {@link #transposed()} method instead.
     *
     * @return	Return this Mat4f for chaining.
     * @see		#transposed()
     */
    transpose(): Mat4;
    /**
     * Return a transposed version of this Mat4f.
     * <p>
     * This Mat4f is <strong>not</strong> modified during the transposing process.
     * <p>
     * If you want to transpose 'this' Mat4f rather than return a transposed copy then use the
     * {@link #transpose()} method instead.
     *
     * @return		A transposed version of this Mat4f.
     */
    transposed(): Mat4;
    /**
     * Method to multiply this Mat4f by another Mat4f and return the result.
     * <p>
     * Neither this matrix or the provided matrix argument are modified by the multiplication process,
     * instead a new Mat4f containing the resulting matrix is returned.
     * <p>
     * Matrix multiplication is <strong>not commutative</strong> (i.e. {@code AB != BA} - that is, the
     * result of multiplying matrix A by matrix B is <em>not</em> the same as multiplying matrix B by
     * matrix A). As such, to construct a ModelView or ModelViewProjection matrix you must specify them
     * in that precise order <strong>reversed</strong> (because of the order in which the calculations
     * take place), for example:
     * <p>
     * {@code Mat4f modelViewMatrix = viewMatrix.times(modelMatrix); }
     * <p>
     * {@code Mat4f modelViewProjectionMatrix = projectionMatrix.times(viewMatrix).times(modelMatrix); }
     * <p>
     * Although matrix multiplication is <strong>not</strong> commutative, it <strong>is</strong>
     * associative (i.e. {@code A(BC) == (AB)C}), so you can quite happily combine matrices like this:
     * <p>
     * {@code Mat4f modelViewMatrix = viewMatrix.times(modelMatrix); }
     * <p>
     * {@code Mat4f modelViewProjectionMatrix = projectionMatrix.times(modelViewMatrix); }
     *
     * @param	m	The matrix to multiply this matrix by.
     * @return		A Mat4f which is the result of multiplying this matrix by the provided matrix.
     */
    times(m: Mat4): Mat4;
    /**
     * Transform a point in 3D space.
     * <p>
     * This method multiplies the provided Vec3f by this matrix. This is commonly used to transform vertices
     * between coordinate spaces, for example you might multiply a vertex location by a model matrix to
     * transform the vertex from model space into world space.
     * <p>
     * The difference between this method and the {@link #transformDirection} method is that this method
     * takes the origin of this Mat4f into account when performing the transformation, whilst
     * transformDirection does not.
     *
     * @param	v	The Vec3f location to transform.
     * @return		The transformed Vec3f location.
     */
    transformPoint(v: Vec3): Vec3;
    /**
     * Transform a direction in 3D space taking into account the orientation of this Mat4fs x/y/z axes.
     * <p>
     * The difference between this method and the {@link #transformPoint} method is that this method
     * does not take the origin of this Mat4f into account when performing the transformation, whilst
     * transformPoint does.
     *
     * @param	v	The Vec3f to transform.
     * @return		The transformed Vec3f.
     */
    transformDirection(v: Vec3): Vec3;
    /**
     * Calculate and return the inverse of a Mat4f.
     * <p>
     * Only matrices which do not have a {@link #determinant()} of zero can be inverted. If
     * the determinant of the provided matrix is zero then an IllegalArgumentException is thrown.
     *
     * @param	m	The matrix to invert.
     * @return		The inverted matrix.
     */
    static inverse(m: Mat4): Mat4;
    /**
     * Calculate the determinant of this matrix.
     *
     * @return	The determinant of this matrix.
     */
    determinant(): number;
    /**
     * Translate this matrix by a provided Vec3f.
     * <p>
     * The changes made are to <strong>this</strong> Mat4f, in the coordinate space of this matrix.
     *
     * @param	v	The vector to translate this matrix by.
     * @return		This Mat4f for chaining.
     */
    translate(v: Vec3): Mat4;
    /**
     * Translate this matrix by separate x, y and z amounts specified as floats.
     * <p>
     * The changes made are to <strong>this</strong> Mat4f.
     *
     * @param	x	The amount to translate on the X-axis.
     * @param	y	The amount to translate on the Y-axis.
     * @param	z	The amount to translate on the Z-axis.
     * @return		This translated Mat4f for chaining.
     */
    /**
     * Rotate this matrix about a local axis by an angle specified in radians.
     * <p>
     * By a 'local' axis we mean that for example, if you rotated this matrix about the positive
     * X-axis (1,0,0), then rotation would occur around the positive X-axis of
     * <strong>this matrix</strong>, not the <em>global / world-space</em> X-axis.
     *
     * @param	angleRads	The angle to rotate the matrix in radians.
     * @param	localAxis	The local axis around which to rotate the matrix.
     * @return				This rotated matrix
     */
    rotateAboutLocalAxisRads(angleRads: number, localAxis: Vec3): Mat4;
    /**
     * Rotate this matrix about a local axis by an angle specified in degrees.
     * <p>
     * By a 'local' axis we mean that for example, if you rotated this matrix about the positive
     * X-axis (1,0,0), then rotation would occur around the positive X-axis of
     * <strong>this matrix</strong>, not the <em>global / world-space</em> X-axis.
     *
     * @param	angleDegs	The angle to rotate the matrix in degrees.
     * @param	localAxis	The local axis around which to rotate the matrix.
     * @return				This rotated matrix
     */
    rotateAboutLocalAxisDegs(angleDegs: number, localAxis: Vec3): Mat4;
    /**
     * Rotate this matrix about a world-space axis by an angle specified in radians.
     * <p>
     * The cardinal 'world-space' axes are defined so that the +X axis runs to the right,
     * the +Y axis runs upwards, and the +Z axis runs directly outwards from the screen.
     *
     * @param	angleRads	The angle to rotate the matrix in radians.
     * @param	worldAxis	The world-space axis around which to rotate the matrix.
     * @return			This rotated matrix.
     */
    /**
     * Rotate a matrix about a given global axis by an angle in radians.
     * <p>
     * The matrix provided is NOT modified - a rotated version is returned.
     * <p>
     * The axis specified to rotate the matrix about is <strong>not</strong>
     * specified in the coordinate space of the matrix being rotated - it is
     * specified in global coordinates, such as used in OpenGL world space. In
     * this coordinate system:
     * <ul>
     * <li>The positive X-axis runs to the right (1,0,0),
     * <li>The positive Y-axis runs vertically upwards (0,1,0), and</li>
     * <li>The positive Z-axis runs outwards from the screen (0,0,1).</li>
     * </ul>
     *
     * @param	matrix		The matrix to rotate.
     * @param	angleRads	The angle to rotate the matrix in radians.
     * @param	worldAxis	The world-space axis to rotate around.
     * @return			The rotated matrix.
     */
    static rotateAboutWorldAxisRads(matrix: Mat4, angleRads: number, worldAxis: Vec3): Mat4;
    /**
     * Rotate a matrix about a given global axis by an angle in radians.
     * <p>
     * The matrix provided is NOT modified - a rotated version is returned.
     * <p>
     * The axis specified to rotate the matrix about is <strong>not</strong>
     * specified in the coordinate space of the matrix being rotated - it is
     * specified in global coordinates, such as used in OpenGL world space. In
     * this coordinate system:
     * <ul>
     * <li>The positive X-axis runs to the right (1,0,0),
     * <li>The positive Y-axis runs vertically upwards (0,1,0), and</li>
     * <li>The positive Z-axis runs outwards from the screen (0,0,1).</li>
     * </ul>
     *
     * @param	matrix		The matrix to rotate.
     * @param	angleDegs	The angle to rotate the matrix in degrees.
     * @param	worldAxis	The world-space axis to rotate around.
     * @return			A rotated version of the provided matrix.
     */
    static rotateAboutWorldAxisDegs(matrix: Mat4, angleDegs: number, worldAxis: Vec3): Mat4;
    /**
     * Rotate matrix about a relative axis.
     * <p>
     * The matrix is rotated about the provided axis in the coordinate system of the provided matrix.
     *
     * @param	matrix		The matrix to rotate.
     * @param	angleRads	The angle to rotate the matrix about in radians.
     * @param	localAxis	The relative axis to rotate about.
     * @return			A rotated matrix.
     */
    static rotateMatrixAboutLocalAxisRads(matrix: Mat4, angleRads: number, localAxis: Vec3): Mat4;
    /**
     * Rotate matrix about a relative axis.
     * <p>
     * The matrix is rotated about the provided axis in the coordinate system of the provided matrix.
     *
     * @param	matrix		The matrix to rotate.
     * @param	angleDegs	The angle to rotate the matrix about in degrees.
     * @param	localAxis	The relative axis to rotate about.
     * @return			A rotated matrix.
     */
    static rotateMatrixAboutLocalAxisDegs(matrix: Mat4, angleDegs: number, localAxis: Vec3): Mat4;
    /**
     * Return a Mat3f version of this Mat4f.
     * <p>
     * The x, y and z axes are returned in the Mat3f, while the w component of each axis
     * and the origin plus it's w component are discarded.
     * <p>
     * In effect, we are extracting the orientation of this Mat4f into a Mat3f.
     *
     * @return	A Mat3f version of this Mat4f.
     */
    toMat3f(): Mat3;
    /**
     * Return this Mat4f as an array of 16 floats.
     *
     * @return	This Mat4f as an array of 16 floats.
     */
    toArray(): number[];
    /**
     * Overridden toString method.
     * <p>
     * The matrix values are formatted to three decimal places. If you require the exact unformatted
     * m<em>XY</em> values then they may be accessed directly.
     *
     * @return	A concise, human-readable description of a Mat4f.
     */
    toString(): string;
    /**
     * Construct an orthographic projection matrix.
     * <p>
     * Orthographic projections are commonly used when working in 2D or CAD scenarios. As orthographic projection
     * does not perform foreshortening on any projected geometry, objects are drawn the same size regardless of
     * their distance from the camera.
     * <p>
     * By specifying the bottom clipping plane to be 0.0f and the top clipping plane to be the height of the window,
     * the origin of the coordinate space is at the bottom-left of the window and the positive y-axis runs upwards.
     * To place the origin at the top left of the window and have the y-axis run downwards, simply swap the top and
     * bottom values.
     * <p>
     * Once you have an orthographic projection matrix, if you are not using any separate Model or View matrices
     * then you may simply use the orthographic matrix as a ModelViewProjection matrix.
     * <p>
     * If values are passed so that (right - left), (top - bottom) or (far - near) are zero then an
     * IllegalArgumentException is thrown.
     *
     * @param	left	The left   clipping plane, typically 0.0f.
     * @param	right	The right  clipping plane, typically the width of the window.
     * @param	top		The top    clipping plane, typically the height of the window.
     * @param	bottom  The bottom clipping plane, typically 0.0f.
     * @param	near	The near   clipping plane, typically -1.0f.
     * @param	far     The far    clipping plane, typically  1.0f.
     * @return			The constructed orthographic matrix
     * @see				<a href="http://www.songho.ca/opengl/gl_projectionmatrix.html#ortho">http://www.songho.ca/opengl/gl_projectionmatrix.html#ortho</a>
     */
    static createOrthographicProjectionMatrix(left: number, right: number, top: number, bottom: number, near: number, far: number): Mat4;
    /**
     * Construct a perspective projection matrix.
     * <p>
     * The parameters provided are the locations of the left/right/top/bottom/near/far clipping planes.
     * <p>
     * There is rarely any need to specify the bounds of a projection matrix in this manner, and you
     * are likely to be better served by using the
     * {@link #createPerspectiveProjectionMatrix(float, float, float, float)} method instead.
     * <p>
     * Once you have a Projection matrix, then it can be combined with a ModelView or separate Model and
     * View matrices in the following manner (be careful: multiplication order is important) to create a
     * ModelViewProjection matrix:
     * <p>
     * {@code Mat4f mvpMatrix = projectionMatrix.times(modelViewMatrix);}
     * <p>
     * or
     * <p>
     * {@code Mat4f mvpMatrix = projectionMatrix.times(viewMatrix).times(modelMatrix);}
     *
     * @param	left	The left   clipping plane, typically 0.0f.
     * @param	right	The right  clipping plane, typically the width of the window.
     * @param	top		The top    clipping plane, typically the height of the window.
     * @param	bottom  The bottom clipping plane, typically 0.0f.
     * @param	near	The near   clipping plane, typically -1.0f.
     * @param	far     The far    clipping plane, typically  1.0f.
     * @return			The constructed orthographic matrix
     * @see				<a href="http://www.songho.ca/opengl/gl_projectionmatrix.html#ortho">http://www.songho.ca/opengl/gl_projectionmatrix.html#ortho</a>
     */
    static createPerspectiveProjectionMatrix(left: number, right: number, top: number, bottom: number, near: number, far: number): Mat4;
}
