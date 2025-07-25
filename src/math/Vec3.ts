/**
 * 三维向量类
 * 提供基础的三维向量运算功能
 */
export class Vec3 {
  public x: number;
  public y: number;
  public z: number;

  constructor(x: number = 0, y: number = 0, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   * 创建零向量
   */
  static zero(): Vec3 {
    return new Vec3(0, 0, 0);
  }

  /**
   * 创建单位向量
   */
  static one(): Vec3 {
    return new Vec3(1, 1, 1);
  }

  /**
   * 创建X轴单位向量
   */
  static right(): Vec3 {
    return new Vec3(1, 0, 0);
  }

  /**
   * 创建Y轴单位向量
   */
  static up(): Vec3 {
    return new Vec3(0, 1, 0);
  }

  /**
   * 创建Z轴单位向量
   */
  static forward(): Vec3 {
    return new Vec3(0, 0, 1);
  }

  /**
   * 向量加法
   */
  add(v: Vec3): Vec3 {
    return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  /**
   * 向量减法
   */
  subtract(v: Vec3): Vec3 {
    return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  /**
   * 标量乘法
   */
  multiply(scalar: number): Vec3 {
    return new Vec3(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  /**
   * 标量除法
   */
  divide(scalar: number): Vec3 {
    if (scalar === 0) {
      throw new Error('Division by zero');
    }
    return new Vec3(this.x / scalar, this.y / scalar, this.z / scalar);
  }

  /**
   * 点积
   */
  dot(v: Vec3): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  /**
   * 叉积
   */
  cross(v: Vec3): Vec3 {
    return new Vec3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }

  /**
   * 向量长度
   */
  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  /**
   * 向量长度的平方
   */
  lengthSquared(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  /**
   * 归一化向量
   */
  normalize(): Vec3 {
    const len = this.length();
    if (len === 0) {
      return Vec3.zero();
    }
    return this.divide(len);
  }

  /**
   * 计算两个向量之间的距离
   */
  distance(v: Vec3): number {
    return this.subtract(v).length();
  }

  /**
   * 线性插值
   */
  lerp(v: Vec3, t: number): Vec3 {
    return this.add(v.subtract(this).multiply(t));
  }

  /**
   * 向量取反
   */
  negate(): Vec3 {
    return new Vec3(-this.x, -this.y, -this.z);
  }

  /**
   * 检查向量是否相等
   */
  equals(v: Vec3, epsilon: number = 1e-6): boolean {
    return (
      Math.abs(this.x - v.x) < epsilon &&
      Math.abs(this.y - v.y) < epsilon &&
      Math.abs(this.z - v.z) < epsilon
    );
  }

  /**
   * 复制向量
   */
  clone(): Vec3 {
    return new Vec3(this.x, this.y, this.z);
  }

  /**
   * 转换为数组
   */
  toArray(): number[] {
    return [this.x, this.y, this.z];
  }

  /**
   * 转换为字符串
   */
  toString(): string {
    return `Vec3(${this.x}, ${this.y}, ${this.z})`;
  }
}