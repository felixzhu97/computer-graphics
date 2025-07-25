import { Vec3 } from './Vec3';
import { Vec4 } from './Vec4';

/**
 * 4x4矩阵类
 * 用于3D变换计算，采用列主序存储
 */
export class Mat4 {
  private data: Float32Array;

  constructor(data?: number[] | Float32Array) {
    this.data = new Float32Array(16);
    if (data) {
      if (data.length !== 16) {
        throw new Error('Matrix data must have exactly 16 elements');
      }
      this.data.set(data);
    } else {
      this.identity();
    }
  }

  /**
   * 创建单位矩阵
   */
  static identity(): Mat4 {
    const m = new Mat4();
    m.identity();
    return m;
  }

  /**
   * 创建零矩阵
   */
  static zero(): Mat4 {
    return new Mat4(new Array(16).fill(0));
  }

  /**
   * 创建平移矩阵
   */
  static translation(x: number, y: number, z: number): Mat4 {
    return new Mat4([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      x, y, z, 1
    ]);
  }

  /**
   * 创建缩放矩阵
   */
  static scale(x: number, y: number, z: number): Mat4 {
    return new Mat4([
      x, 0, 0, 0,
      0, y, 0, 0,
      0, 0, z, 0,
      0, 0, 0, 1
    ]);
  }

  /**
   * 创建绕X轴旋转矩阵
   */
  static rotationX(angle: number): Mat4 {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return new Mat4([
      1, 0, 0, 0,
      0, c, s, 0,
      0, -s, c, 0,
      0, 0, 0, 1
    ]);
  }

  /**
   * 创建绕Y轴旋转矩阵
   */
  static rotationY(angle: number): Mat4 {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return new Mat4([
      c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1
    ]);
  }

  /**
   * 创建绕Z轴旋转矩阵
   */
  static rotationZ(angle: number): Mat4 {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return new Mat4([
      c, s, 0, 0,
      -s, c, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
  }

  /**
   * 创建绕任意轴旋转矩阵
   */
  static rotation(axis: Vec3, angle: number): Mat4 {
    const normalizedAxis = axis.normalize();
    const x = normalizedAxis.x;
    const y = normalizedAxis.y;
    const z = normalizedAxis.z;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const t = 1 - c;

    return new Mat4([
      t * x * x + c,     t * x * y + s * z, t * x * z - s * y, 0,
      t * x * y - s * z, t * y * y + c,     t * y * z + s * x, 0,
      t * x * z + s * y, t * y * z - s * x, t * z * z + c,     0,
      0,                 0,                 0,                 1
    ]);
  }

  /**
   * 创建透视投影矩阵
   */
  static perspective(fov: number, aspect: number, near: number, far: number): Mat4 {
    const f = 1.0 / Math.tan(fov / 2);
    const nf = 1 / (near - far);

    return new Mat4([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, 2 * far * near * nf, 0
    ]);
  }

  /**
   * 创建正交投影矩阵
   */
  static orthographic(left: number, right: number, bottom: number, top: number, near: number, far: number): Mat4 {
    const lr = 1 / (left - right);
    const bt = 1 / (bottom - top);
    const nf = 1 / (near - far);

    return new Mat4([
      -2 * lr, 0, 0, 0,
      0, -2 * bt, 0, 0,
      0, 0, 2 * nf, 0,
      (left + right) * lr, (top + bottom) * bt, (far + near) * nf, 1
    ]);
  }

  /**
   * 创建视图矩阵（lookAt）
   */
  static lookAt(eye: Vec3, target: Vec3, up: Vec3): Mat4 {
    const f = target.subtract(eye).normalize();
    const s = f.cross(up).normalize();
    const u = s.cross(f);

    return new Mat4([
      s.x, u.x, -f.x, 0,
      s.y, u.y, -f.y, 0,
      s.z, u.z, -f.z, 0,
      -s.dot(eye), -u.dot(eye), f.dot(eye), 1
    ]);
  }

  /**
   * 设置为单位矩阵
   */
  identity(): Mat4 {
    this.data.fill(0);
    this.data[0] = 1;
    this.data[5] = 1;
    this.data[10] = 1;
    this.data[15] = 1;
    return this;
  }

  /**
   * 矩阵乘法
   */
  multiply(m: Mat4): Mat4 {
    const result = new Float32Array(16);
    const a = this.data;
    const b = m.data;

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        result[i * 4 + j] = 
          a[i * 4 + 0] * b[0 * 4 + j] +
          a[i * 4 + 1] * b[1 * 4 + j] +
          a[i * 4 + 2] * b[2 * 4 + j] +
          a[i * 4 + 3] * b[3 * 4 + j];
      }
    }

    return new Mat4(result);
  }

  /**
   * 矩阵与向量相乘
   */
  multiplyVec4(v: Vec4): Vec4 {
    const x = this.data[0] * v.x + this.data[4] * v.y + this.data[8] * v.z + this.data[12] * v.w;
    const y = this.data[1] * v.x + this.data[5] * v.y + this.data[9] * v.z + this.data[13] * v.w;
    const z = this.data[2] * v.x + this.data[6] * v.y + this.data[10] * v.z + this.data[14] * v.w;
    const w = this.data[3] * v.x + this.data[7] * v.y + this.data[11] * v.z + this.data[15] * v.w;
    return new Vec4(x, y, z, w);
  }

  /**
   * 矩阵转置
   */
  transpose(): Mat4 {
    const result = new Float32Array(16);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        result[i * 4 + j] = this.data[j * 4 + i];
      }
    }
    return new Mat4(result);
  }

  /**
   * 计算行列式
   */
  determinant(): number {
    const m = this.data;
    return (
      m[0] * (m[5] * (m[10] * m[15] - m[11] * m[14]) - m[9] * (m[6] * m[15] - m[7] * m[14]) + m[13] * (m[6] * m[11] - m[7] * m[10])) -
      m[4] * (m[1] * (m[10] * m[15] - m[11] * m[14]) - m[9] * (m[2] * m[15] - m[3] * m[14]) + m[13] * (m[2] * m[11] - m[3] * m[10])) +
      m[8] * (m[1] * (m[6] * m[15] - m[7] * m[14]) - m[5] * (m[2] * m[15] - m[3] * m[14]) + m[13] * (m[2] * m[7] - m[3] * m[6])) -
      m[12] * (m[1] * (m[6] * m[11] - m[7] * m[10]) - m[5] * (m[2] * m[11] - m[3] * m[10]) + m[9] * (m[2] * m[7] - m[3] * m[6]))
    );
  }

  /**
   * 矩阵求逆
   */
  inverse(): Mat4 {
    const m = this.data;
    const inv = new Float32Array(16);

    inv[0] = m[5] * m[10] * m[15] - m[5] * m[11] * m[14] - m[9] * m[6] * m[15] + m[9] * m[7] * m[14] + m[13] * m[6] * m[11] - m[13] * m[7] * m[10];
    inv[4] = -m[4] * m[10] * m[15] + m[4] * m[11] * m[14] + m[8] * m[6] * m[15] - m[8] * m[7] * m[14] - m[12] * m[6] * m[11] + m[12] * m[7] * m[10];
    inv[8] = m[4] * m[9] * m[15] - m[4] * m[11] * m[13] - m[8] * m[5] * m[15] + m[8] * m[7] * m[13] + m[12] * m[5] * m[11] - m[12] * m[7] * m[9];
    inv[12] = -m[4] * m[9] * m[14] + m[4] * m[10] * m[13] + m[8] * m[5] * m[14] - m[8] * m[6] * m[13] - m[12] * m[5] * m[10] + m[12] * m[6] * m[9];

    inv[1] = -m[1] * m[10] * m[15] + m[1] * m[11] * m[14] + m[9] * m[2] * m[15] - m[9] * m[3] * m[14] - m[13] * m[2] * m[11] + m[13] * m[3] * m[10];
    inv[5] = m[0] * m[10] * m[15] - m[0] * m[11] * m[14] - m[8] * m[2] * m[15] + m[8] * m[3] * m[14] + m[12] * m[2] * m[11] - m[12] * m[3] * m[10];
    inv[9] = -m[0] * m[9] * m[15] + m[0] * m[11] * m[13] + m[8] * m[1] * m[15] - m[8] * m[3] * m[13] - m[12] * m[1] * m[11] + m[12] * m[3] * m[9];
    inv[13] = m[0] * m[9] * m[14] - m[0] * m[10] * m[13] - m[8] * m[1] * m[14] + m[8] * m[2] * m[13] + m[12] * m[1] * m[10] - m[12] * m[2] * m[9];

    inv[2] = m[1] * m[6] * m[15] - m[1] * m[7] * m[14] - m[5] * m[2] * m[15] + m[5] * m[3] * m[14] + m[13] * m[2] * m[7] - m[13] * m[3] * m[6];
    inv[6] = -m[0] * m[6] * m[15] + m[0] * m[7] * m[14] + m[4] * m[2] * m[15] - m[4] * m[3] * m[14] - m[12] * m[2] * m[7] + m[12] * m[3] * m[6];
    inv[10] = m[0] * m[5] * m[15] - m[0] * m[7] * m[13] - m[4] * m[1] * m[15] + m[4] * m[3] * m[13] + m[12] * m[1] * m[7] - m[12] * m[3] * m[5];
    inv[14] = -m[0] * m[5] * m[14] + m[0] * m[6] * m[13] + m[4] * m[1] * m[14] - m[4] * m[2] * m[13] - m[12] * m[1] * m[6] + m[12] * m[2] * m[5];

    inv[3] = -m[1] * m[6] * m[11] + m[1] * m[7] * m[10] + m[5] * m[2] * m[11] - m[5] * m[3] * m[10] - m[9] * m[2] * m[7] + m[9] * m[3] * m[6];
    inv[7] = m[0] * m[6] * m[11] - m[0] * m[7] * m[10] - m[4] * m[2] * m[11] + m[4] * m[3] * m[10] + m[8] * m[2] * m[7] - m[8] * m[3] * m[6];
    inv[11] = -m[0] * m[5] * m[11] + m[0] * m[7] * m[9] + m[4] * m[1] * m[11] - m[4] * m[3] * m[9] - m[8] * m[1] * m[7] + m[8] * m[3] * m[5];
    inv[15] = m[0] * m[5] * m[10] - m[0] * m[6] * m[9] - m[4] * m[1] * m[10] + m[4] * m[2] * m[9] + m[8] * m[1] * m[6] - m[8] * m[2] * m[5];

    const det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];

    if (det === 0) {
      throw new Error('Matrix is not invertible');
    }

    const invDet = 1.0 / det;
    for (let i = 0; i < 16; i++) {
      inv[i] *= invDet;
    }

    return new Mat4(inv);
  }

  /**
   * 获取矩阵元素
   */
  get(row: number, col: number): number {
    return this.data[col * 4 + row];
  }

  /**
   * 设置矩阵元素
   */
  set(row: number, col: number, value: number): void {
    this.data[col * 4 + row] = value;
  }

  /**
   * 获取原始数据
   */
  getData(): Float32Array {
    return this.data;
  }

  /**
   * 检查矩阵是否相等
   */
  equals(m: Mat4, epsilon: number = 1e-6): boolean {
    for (let i = 0; i < 16; i++) {
      if (Math.abs(this.data[i] - m.data[i]) > epsilon) {
        return false;
      }
    }
    return true;
  }

  /**
   * 复制矩阵
   */
  clone(): Mat4 {
    return new Mat4(this.data);
  }

  /**
   * 转换为数组
   */
  toArray(): number[] {
    return Array.from(this.data);
  }

  /**
   * 转换为字符串
   */
  toString(): string {
    const rows = [];
    for (let i = 0; i < 4; i++) {
      const row = [];
      for (let j = 0; j < 4; j++) {
        row.push(this.get(i, j).toFixed(3));
      }
      rows.push(`[${row.join(', ')}]`);
    }
    return `Mat4(\n  ${rows.join(',\n  ')}\n)`;
  }
}