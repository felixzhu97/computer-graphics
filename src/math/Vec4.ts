/**
 * 四维向量类
 * 主要用于齐次坐标和颜色表示
 */
export class Vec4 {
  public x: number;
  public y: number;
  public z: number;
  public w: number;

  constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  /**
   * 创建零向量
   */
  static zero(): Vec4 {
    return new Vec4(0, 0, 0, 0);
  }

  /**
   * 创建单位向量
   */
  static one(): Vec4 {
    return new Vec4(1, 1, 1, 1);
  }

  /**
   * 从Vec3创建Vec4（齐次坐标）
   */
  static fromVec3(v: { x: number; y: number; z: number }, w: number = 1): Vec4 {
    return new Vec4(v.x, v.y, v.z, w);
  }

  /**
   * 向量加法
   */
  add(v: Vec4): Vec4 {
    return new Vec4(this.x + v.x, this.y + v.y, this.z + v.z, this.w + v.w);
  }

  /**
   * 向量减法
   */
  subtract(v: Vec4): Vec4 {
    return new Vec4(this.x - v.x, this.y - v.y, this.z - v.z, this.w - v.w);
  }

  /**
   * 标量乘法
   */
  multiply(scalar: number): Vec4 {
    return new Vec4(this.x * scalar, this.y * scalar, this.z * scalar, this.w * scalar);
  }

  /**
   * 标量除法
   */
  divide(scalar: number): Vec4 {
    if (scalar === 0) {
      throw new Error('Division by zero');
    }
    return new Vec4(this.x / scalar, this.y / scalar, this.z / scalar, this.w / scalar);
  }

  /**
   * 点积
   */
  dot(v: Vec4): number {
    return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
  }

  /**
   * 向量长度
   */
  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
  }

  /**
   * 向量长度的平方
   */
  lengthSquared(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
  }

  /**
   * 归一化向量
   */
  normalize(): Vec4 {
    const len = this.length();
    if (len === 0) {
      return Vec4.zero();
    }
    return this.divide(len);
  }

  /**
   * 齐次坐标透视除法
   */
  perspectiveDivide(): Vec4 {
    if (this.w === 0) {
      throw new Error('Cannot perform perspective divide with w = 0');
    }
    return new Vec4(this.x / this.w, this.y / this.w, this.z / this.w, 1);
  }

  /**
   * 线性插值
   */
  lerp(v: Vec4, t: number): Vec4 {
    return this.add(v.subtract(this).multiply(t));
  }

  /**
   * 向量取反
   */
  negate(): Vec4 {
    return new Vec4(-this.x, -this.y, -this.z, -this.w);
  }

  /**
   * 检查向量是否相等
   */
  equals(v: Vec4, epsilon: number = 1e-6): boolean {
    return (
      Math.abs(this.x - v.x) < epsilon &&
      Math.abs(this.y - v.y) < epsilon &&
      Math.abs(this.z - v.z) < epsilon &&
      Math.abs(this.w - v.w) < epsilon
    );
  }

  /**
   * 复制向量
   */
  clone(): Vec4 {
    return new Vec4(this.x, this.y, this.z, this.w);
  }

  /**
   * 转换为数组
   */
  toArray(): number[] {
    return [this.x, this.y, this.z, this.w];
  }

  /**
   * 转换为字符串
   */
  toString(): string {
    return `Vec4(${this.x}, ${this.y}, ${this.z}, ${this.w})`;
  }
}