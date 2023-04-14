import * as pc from 'playcanvas';

export class Util {
  public static vec3LookRotation(forward: pc.Vec3, up: pc.Vec3): pc.Quat {
    const vec = new pc.Vec3();
    const vec2 = new pc.Vec3();
    const quat = new pc.Quat();
    forward = forward.normalize();

    var vector = forward.normalize();
    var vector2 = vec.copy(pc.Vec3.ZERO).cross(up, vector).normalize();
    var vector3 = vec2.copy(pc.Vec3.ZERO).cross(vector, vector2);
    var m00 = vector2.x;
    var m01 = vector2.y;
    var m02 = vector2.z;
    var m10 = vector3.x;
    var m11 = vector3.y;
    var m12 = vector3.z;
    var m20 = vector.x;
    var m21 = vector.y;
    var m22 = vector.z;

    var num8 = m00 + m11 + m22;
    var quaternion = quat;
    if (num8 > 0.0) {
      var num = Math.sqrt(num8 + 1.0);
      quaternion.w = num * 0.5;
      num = 0.5 / num;
      quaternion.x = (m12 - m21) * num;
      quaternion.y = (m20 - m02) * num;
      quaternion.z = (m01 - m10) * num;
      return quaternion;
    }
    if (m00 >= m11 && m00 >= m22) {
      var num7 = Math.sqrt(1.0 + m00 - m11 - m22);
      var num4 = 0.5 / num7;
      quaternion.x = 0.5 * num7;
      quaternion.y = (m01 + m10) * num4;
      quaternion.z = (m02 + m20) * num4;
      quaternion.w = (m12 - m21) * num4;
      return quaternion;
    }
    if (m11 > m22) {
      var num6 = Math.sqrt(1.0 + m11 - m00 - m22);
      var num3 = 0.5 / num6;
      quaternion.x = (m10 + m01) * num3;
      quaternion.y = 0.5 * num6;
      quaternion.z = (m21 + m12) * num3;
      quaternion.w = (m20 - m02) * num3;
      return quaternion;
    }
    var num5 = Math.sqrt(1.0 + m22 - m00 - m11);
    var num2 = 0.5 / num5;
    quaternion.x = (m20 + m02) * num2;
    quaternion.y = (m21 + m12) * num2;
    quaternion.z = 0.5 * num5;
    quaternion.w = (m01 - m10) * num2;
    return quaternion;
  }

  //   mat3 rotateAlign( vec3 v1, vec3 v2)
  // {
  //     vec3 axis = cross( v1, v2 );

  //     const float cosA = dot( v1, v2 );
  //     const float k = 1.0f / (1.0f + cosA);

  //     mat3 result( (axis.x * axis.x * k) + cosA,
  //                  (axis.y * axis.x * k) - axis.z,
  //                  (axis.z * axis.x * k) + axis.y,
  //                  (axis.x * axis.y * k) + axis.z,
  //                  (axis.y * axis.y * k) + cosA,
  //                  (axis.z * axis.y * k) - axis.x,
  //                  (axis.x * axis.z * k) - axis.y,
  //                  (axis.y * axis.z * k) + axis.x,
  //                  (axis.z * axis.z * k) + cosA
  //                  );

  //     return result;
  // }
  public static rotateAlign(v1: pc.Vec3, v2: pc.Vec3): pc.Mat3 {
    const axis = new pc.Vec3().cross(v1, v2);
    const cosA = v1.dot(v2);
    const k = 1.0 / (1.0 + cosA);
    const result = new pc.Mat3();
    result.set([
      axis.x * axis.x * k + cosA,
      axis.y * axis.x * k - axis.z,
      axis.z * axis.x * k + axis.y,
      axis.x * axis.y * k + axis.z,
      axis.y * axis.y * k + cosA,
      axis.z * axis.y * k - axis.x,
      axis.x * axis.z * k - axis.y,
      axis.y * axis.z * k + axis.x,
      axis.z * axis.z * k + cosA,
    ]);
    return result;
  }
}
