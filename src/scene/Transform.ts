import { Vec3, Mat4 } from '../math';

/**
 * Transform类 - 处理3D对象的位置、旋转、缩放变换
 * 支持欧拉角旋转和变换矩阵的计算
 */
export class Transform {
  private _position: Vec3;
  private _rotation: Vec3; // 欧拉角 (x, y, z) 以弧度为单位
  private _scale: Vec3;
  private _matrixDirty: boolean = true;
  private _matrix: Mat4;

  constructor(
    position: Vec3 = Vec3.zero(),
    rotation: Vec3 = Vec3.zero(),
    scale: Vec3 = Vec3.one()
  ) {
    this._position = position.clone();
    this._rotation = rotation.clone();
    this._scale = scale.clone();
    this._matrix = Mat4.identity();
  }

  /**
   * 获取位置
   */
  get position(): Vec3 {
    return this._position.clone();
  }

  /**
   * 设置位置
   */
  set position(value: Vec3) {
    this._position = value.clone();
    this._matrixDirty = true;
  }

  /**
   * 获取旋转（欧拉角，弧度）
   */
  get rotation(): Vec3 {
    return this._rotation.clone();
  }

  /**
   * 设置旋转（欧拉角，弧度）
   */
  set rotation(value: Vec3) {
    this._rotation = value.clone();
    this._matrixDirty = true;
  }

  /**
   * 获取缩放
   */
  get scale(): Vec3 {
    return this._scale.clone();
  }

  /**
   * 设置缩放
   */
  set scale(value: Vec3) {
    this._scale = value.clone();
    this._matrixDirty = true;
  }

  /**
   * 平移
   */
  translate(delta: Vec3): void {
    this._position = this._position.add(delta);
    this._matrixDirty = true;
  }

  /**
   * 旋转（增量旋转）
   */
  rotate(delta: Vec3): void {
    this._rotation = this._rotation.add(delta);
    this._matrixDirty = true;
  }

  /**
   * 缩放（乘法缩放）
   */
  scaleBy(factor: Vec3): void {
    this._scale = new Vec3(
      this._scale.x * factor.x,
      this._scale.y * factor.y,
      this._scale.z * factor.z
    );
    this._matrixDirty = true;
  }

  /**
   * 获取变换矩阵
   * 变换顺序：缩放 -> 旋转 -> 平移
   */
  getMatrix(): Mat4 {
    if (this._matrixDirty) {
      this._updateMatrix();
      this._matrixDirty = false;
    }
    return this._matrix.clone();
  }

  /**
   * 从变换矩阵设置Transform
   * 注意：这个方法会分解矩阵，可能会有精度损失
   */
  setFromMatrix(matrix: Mat4): void {
    // 提取平移
    this._position = new Vec3(
      matrix.get(0, 3),
      matrix.get(1, 3),
      matrix.get(2, 3)
    );

    // 提取缩放
    const scaleX = new Vec3(matrix.get(0, 0), matrix.get(1, 0), matrix.get(2, 0)).length();
    const scaleY = new Vec3(matrix.get(0, 1), matrix.get(1, 1), matrix.get(2, 1)).length();
    const scaleZ = new Vec3(matrix.get(0, 2), matrix.get(1, 2), matrix.get(2, 2)).length();
    this._scale = new Vec3(scaleX, scaleY, scaleZ);

    // 提取旋转（简化版本，假设没有倾斜）
    const rotMatrix = Mat4.identity();
    rotMatrix.set(0, 0, matrix.get(0, 0) / scaleX);
    rotMatrix.set(0, 1, matrix.get(0, 1) / scaleY);
    rotMatrix.set(0, 2, matrix.get(0, 2) / scaleZ);
    rotMatrix.set(1, 0, matrix.get(1, 0) / scaleX);
    rotMatrix.set(1, 1, matrix.get(1, 1) / scaleY);
    rotMatrix.set(1, 2, matrix.get(1, 2) / scaleZ);
    rotMatrix.set(2, 0, matrix.get(2, 0) / scaleX);
    rotMatrix.set(2, 1, matrix.get(2, 1) / scaleY);
    rotMatrix.set(2, 2, matrix.get(2, 2) / scaleZ);

    // 从旋转矩阵提取欧拉角
    this._rotation = this._extractEulerAngles(rotMatrix);
    this._matrixDirty = true;
  }

  /**
   * 获取前向向量（局部Z轴）
   */
  getForward(): Vec3 {
    const matrix = this.getMatrix();
    return new Vec3(
      -matrix.get(0, 2),
      -matrix.get(1, 2),
      -matrix.get(2, 2)
    ).normalize();
  }

  /**
   * 获取右向向量（局部X轴）
   */
  getRight(): Vec3 {
    const matrix = this.getMatrix();
    return new Vec3(
      matrix.get(0, 0),
      matrix.get(1, 0),
      matrix.get(2, 0)
    ).normalize();
  }

  /**
   * 获取上向向量（局部Y轴）
   */
  getUp(): Vec3 {
    const matrix = this.getMatrix();
    return new Vec3(
      matrix.get(0, 1),
      matrix.get(1, 1),
      matrix.get(2, 1)
    ).normalize();
  }

  /**
   * 复制Transform
   */
  clone(): Transform {
    return new Transform(this._position, this._rotation, this._scale);
  }

  /**
   * 重置为默认值
   */
  reset(): void {
    this._position = Vec3.zero();
    this._rotation = Vec3.zero();
    this._scale = Vec3.one();
    this._matrixDirty = true;
  }

  /**
   * 更新变换矩阵
   * 变换顺序：缩放 -> 旋转 -> 平移
   */
  private _updateMatrix(): void {
    // 创建缩放矩阵
    const scaleMatrix = Mat4.scale(this._scale.x, this._scale.y, this._scale.z);

    // 创建旋转矩阵（ZYX顺序）
    const rotationX = Mat4.rotationX(this._rotation.x);
    const rotationY = Mat4.rotationY(this._rotation.y);
    const rotationZ = Mat4.rotationZ(this._rotation.z);
    const rotationMatrix = rotationZ.multiply(rotationY).multiply(rotationX);

    // 创建平移矩阵
    const translationMatrix = Mat4.translation(
      this._position.x,
      this._position.y,
      this._position.z
    );

    // 组合变换矩阵：T * R * S
    this._matrix = translationMatrix.multiply(rotationMatrix).multiply(scaleMatrix);
  }

  /**
   * 从旋转矩阵提取欧拉角
   */
  private _extractEulerAngles(rotMatrix: Mat4): Vec3 {
    // 提取欧拉角（ZYX顺序）
    const sy = Math.sqrt(
      rotMatrix.get(0, 0) * rotMatrix.get(0, 0) + 
      rotMatrix.get(1, 0) * rotMatrix.get(1, 0)
    );

    const singular = sy < 1e-6;

    let x, y, z;
    if (!singular) {
      x = Math.atan2(rotMatrix.get(2, 1), rotMatrix.get(2, 2));
      y = Math.atan2(-rotMatrix.get(2, 0), sy);
      z = Math.atan2(rotMatrix.get(1, 0), rotMatrix.get(0, 0));
    } else {
      x = Math.atan2(-rotMatrix.get(1, 2), rotMatrix.get(1, 1));
      y = Math.atan2(-rotMatrix.get(2, 0), sy);
      z = 0;
    }

    return new Vec3(x, y, z);
  }

  /**
   * 转换为字符串
   */
  toString(): string {
    return `Transform(pos: ${this._position.toString()}, rot: ${this._rotation.toString()}, scale: ${this._scale.toString()})`;
  }
}