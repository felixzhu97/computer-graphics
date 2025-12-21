import { Vec3, Mat4 } from '../math';

/**
 * 相机基础接口
 */
export interface Camera {
  position: Vec3;
  target: Vec3;
  up: Vec3;
  fov?: number;
  aspect: number;
  near: number;
  far: number;
  
  getViewMatrix(): Mat4;
  getProjectionMatrix(): Mat4;
  screenToWorld(screenPos: Vec2): Vec3;
  updateAspectRatio(aspect: number): void;
}

/**
 * 2D向量类型（用于屏幕坐标）
 */
export interface Vec2 {
  x: number;
  y: number;
}

/**
 * 透视相机类
 */
export class PerspectiveCamera implements Camera {
  public position: Vec3;
  public target: Vec3;
  public up: Vec3;
  public fov: number; // 视野角度（弧度）
  public aspect: number; // 宽高比
  public near: number; // 近裁剪面
  public far: number; // 远裁剪面

  private _viewMatrix: Mat4 | null = null;
  private _projectionMatrix: Mat4 | null = null;
  private _viewMatrixDirty = true;
  private _projectionMatrixDirty = true;

  constructor(
    fov: number = Math.PI / 4, // 45度
    aspect: number = 1.0,
    near: number = 0.1,
    far: number = 1000.0,
    position: Vec3 = new Vec3(0, 0, 5),
    target: Vec3 = Vec3.zero(),
    up: Vec3 = Vec3.up()
  ) {
    this.fov = fov;
    this.aspect = aspect;
    this.near = near;
    this.far = far;
    this.position = position.clone();
    this.target = target.clone();
    this.up = up.clone();
  }

  /**
   * 获取视图矩阵
   */
  getViewMatrix(): Mat4 {
    if (this._viewMatrixDirty || !this._viewMatrix) {
      this._viewMatrix = Mat4.lookAt(this.position, this.target, this.up);
      this._viewMatrixDirty = false;
    }
    return this._viewMatrix.clone();
  }

  /**
   * 获取投影矩阵
   */
  getProjectionMatrix(): Mat4 {
    if (this._projectionMatrixDirty || !this._projectionMatrix) {
      this._projectionMatrix = Mat4.perspective(this.fov, this.aspect, this.near, this.far);
      this._projectionMatrixDirty = false;
    }
    return this._projectionMatrix.clone();
  }

  /**
   * 屏幕坐标转世界坐标
   */
  screenToWorld(screenPos: Vec2): Vec3 {
    // 将屏幕坐标转换为NDC坐标 (-1 到 1)
    const ndcX = (screenPos.x * 2) - 1;
    const ndcY = 1 - (screenPos.y * 2);
    
    // 创建NDC空间中的点
    const ndcNear = new Vec3(ndcX, ndcY, -1); // 近平面
    const ndcFar = new Vec3(ndcX, ndcY, 1);   // 远平面
    
    // 获取逆变换矩阵
    const viewMatrix = this.getViewMatrix();
    const projMatrix = this.getProjectionMatrix();
    const viewProjMatrix = projMatrix.multiply(viewMatrix);
    const invViewProjMatrix = viewProjMatrix.inverse();
    
    // 将NDC坐标转换为世界坐标
    const worldNear = this._transformPoint(ndcNear, invViewProjMatrix);
    const worldFar = this._transformPoint(ndcFar, invViewProjMatrix);
    
    // 返回射线方向（从近平面到远平面）
    return worldFar.subtract(worldNear).normalize();
  }

  /**
   * 更新宽高比
   */
  updateAspectRatio(aspect: number): void {
    this.aspect = aspect;
    this._projectionMatrixDirty = true;
  }

  /**
   * 设置位置
   */
  setPosition(position: Vec3): void {
    this.position = position.clone();
    this._viewMatrixDirty = true;
  }

  /**
   * 设置目标点
   */
  setTarget(target: Vec3): void {
    this.target = target.clone();
    this._viewMatrixDirty = true;
  }

  /**
   * 设置上向量
   */
  setUp(up: Vec3): void {
    this.up = up.clone();
    this._viewMatrixDirty = true;
  }

  /**
   * 设置视野角度
   */
  setFov(fov: number): void {
    this.fov = fov;
    this._projectionMatrixDirty = true;
  }

  /**
   * 设置近远裁剪面
   */
  setClippingPlanes(near: number, far: number): void {
    this.near = near;
    this.far = far;
    this._projectionMatrixDirty = true;
  }

  /**
   * 获取前向向量
   */
  getForward(): Vec3 {
    return this.target.subtract(this.position).normalize();
  }

  /**
   * 获取右向向量
   */
  getRight(): Vec3 {
    const forward = this.getForward();
    return forward.cross(this.up).normalize();
  }

  /**
   * 获取上向量（重新计算的正交上向量）
   */
  getUp(): Vec3 {
    const forward = this.getForward();
    const right = this.getRight();
    return right.cross(forward).normalize();
  }

  /**
   * 围绕目标点旋转
   */
  orbitAroundTarget(deltaAzimuth: number, deltaElevation: number): void {
    const offset = this.position.subtract(this.target);
    const radius = offset.length();
    
    // 计算当前的球坐标
    const azimuth = Math.atan2(offset.x, offset.z);
    const elevation = Math.asin(offset.y / radius);
    
    // 应用旋转
    const newAzimuth = azimuth + deltaAzimuth;
    const newElevation = Math.max(-Math.PI/2 + 0.01, Math.min(Math.PI/2 - 0.01, elevation + deltaElevation));
    
    // 转换回笛卡尔坐标
    const newOffset = new Vec3(
      radius * Math.cos(newElevation) * Math.sin(newAzimuth),
      radius * Math.sin(newElevation),
      radius * Math.cos(newElevation) * Math.cos(newAzimuth)
    );
    
    this.position = this.target.add(newOffset);
    this._viewMatrixDirty = true;
  }

  /**
   * 缩放（改变与目标的距离）
   */
  zoom(factor: number): void {
    const offset = this.position.subtract(this.target);
    const newOffset = offset.multiply(factor);
    this.position = this.target.add(newOffset);
    this._viewMatrixDirty = true;
  }

  /**
   * 平移相机和目标
   */
  pan(deltaX: number, deltaY: number): void {
    const right = this.getRight();
    const up = this.getUp();
    
    const offset = right.multiply(deltaX).add(up.multiply(deltaY));
    this.position = this.position.add(offset);
    this.target = this.target.add(offset);
    this._viewMatrixDirty = true;
  }

  /**
   * 复制相机
   */
  clone(): PerspectiveCamera {
    return new PerspectiveCamera(
      this.fov,
      this.aspect,
      this.near,
      this.far,
      this.position,
      this.target,
      this.up
    );
  }

  /**
   * 辅助方法：变换点
   */
  private _transformPoint(point: Vec3, matrix: Mat4): Vec3 {
    const x = point.x * matrix.get(0, 0) + point.y * matrix.get(0, 1) + point.z * matrix.get(0, 2) + matrix.get(0, 3);
    const y = point.x * matrix.get(1, 0) + point.y * matrix.get(1, 1) + point.z * matrix.get(1, 2) + matrix.get(1, 3);
    const z = point.x * matrix.get(2, 0) + point.y * matrix.get(2, 1) + point.z * matrix.get(2, 2) + matrix.get(2, 3);
    const w = point.x * matrix.get(3, 0) + point.y * matrix.get(3, 1) + point.z * matrix.get(3, 2) + matrix.get(3, 3);
    
    if (w !== 0) {
      return new Vec3(x / w, y / w, z / w);
    }
    return new Vec3(x, y, z);
  }
}

/**
 * 正交相机类
 */
export class OrthographicCamera implements Camera {
  public position: Vec3;
  public target: Vec3;
  public up: Vec3;
  public left: number;
  public right: number;
  public bottom: number;
  public top: number;
  public near: number;
  public far: number;
  public aspect: number;

  private _viewMatrix: Mat4 | null = null;
  private _projectionMatrix: Mat4 | null = null;
  private _viewMatrixDirty = true;
  private _projectionMatrixDirty = true;

  constructor(
    left: number = -5,
    right: number = 5,
    bottom: number = -5,
    top: number = 5,
    near: number = 0.1,
    far: number = 1000.0,
    position: Vec3 = new Vec3(0, 0, 5),
    target: Vec3 = Vec3.zero(),
    up: Vec3 = Vec3.up()
  ) {
    this.left = left;
    this.right = right;
    this.bottom = bottom;
    this.top = top;
    this.near = near;
    this.far = far;
    this.position = position.clone();
    this.target = target.clone();
    this.up = up.clone();
    this.aspect = (right - left) / (top - bottom);
  }

  /**
   * 获取视图矩阵
   */
  getViewMatrix(): Mat4 {
    if (this._viewMatrixDirty || !this._viewMatrix) {
      this._viewMatrix = Mat4.lookAt(this.position, this.target, this.up);
      this._viewMatrixDirty = false;
    }
    return this._viewMatrix.clone();
  }

  /**
   * 获取投影矩阵
   */
  getProjectionMatrix(): Mat4 {
    if (this._projectionMatrixDirty || !this._projectionMatrix) {
      this._projectionMatrix = Mat4.orthographic(
        this.left, this.right, this.bottom, this.top, this.near, this.far
      );
      this._projectionMatrixDirty = false;
    }
    return this._projectionMatrix.clone();
  }

  /**
   * 屏幕坐标转世界坐标
   */
  screenToWorld(screenPos: Vec2): Vec3 {
    // 将屏幕坐标转换为正交投影空间
    const worldX = this.left + (screenPos.x * (this.right - this.left));
    const worldY = this.top - (screenPos.y * (this.top - this.bottom));
    
    // 正交投影中，射线方向就是相机的前向方向
    return this.getForward();
  }

  /**
   * 更新宽高比
   */
  updateAspectRatio(aspect: number): void {
    this.aspect = aspect;
    
    // 保持高度不变，调整宽度
    const height = this.top - this.bottom;
    const width = height * aspect;
    const centerX = (this.left + this.right) / 2;
    
    this.left = centerX - width / 2;
    this.right = centerX + width / 2;
    this._projectionMatrixDirty = true;
  }

  /**
   * 设置正交投影边界
   */
  setOrthographicBounds(left: number, right: number, bottom: number, top: number): void {
    this.left = left;
    this.right = right;
    this.bottom = bottom;
    this.top = top;
    this.aspect = (right - left) / (top - bottom);
    this._projectionMatrixDirty = true;
  }

  /**
   * 设置位置
   */
  setPosition(position: Vec3): void {
    this.position = position.clone();
    this._viewMatrixDirty = true;
  }

  /**
   * 设置目标点
   */
  setTarget(target: Vec3): void {
    this.target = target.clone();
    this._viewMatrixDirty = true;
  }

  /**
   * 设置上向量
   */
  setUp(up: Vec3): void {
    this.up = up.clone();
    this._viewMatrixDirty = true;
  }

  /**
   * 设置近远裁剪面
   */
  setClippingPlanes(near: number, far: number): void {
    this.near = near;
    this.far = far;
    this._projectionMatrixDirty = true;
  }

  /**
   * 获取前向向量
   */
  getForward(): Vec3 {
    return this.target.subtract(this.position).normalize();
  }

  /**
   * 获取右向向量
   */
  getRight(): Vec3 {
    const forward = this.getForward();
    return forward.cross(this.up).normalize();
  }

  /**
   * 获取上向量（重新计算的正交上向量）
   */
  getUp(): Vec3 {
    const forward = this.getForward();
    const right = this.getRight();
    return right.cross(forward).normalize();
  }

  /**
   * 缩放正交投影
   */
  zoom(factor: number): void {
    const centerX = (this.left + this.right) / 2;
    const centerY = (this.bottom + this.top) / 2;
    const width = (this.right - this.left) * factor;
    const height = (this.top - this.bottom) * factor;
    
    this.left = centerX - width / 2;
    this.right = centerX + width / 2;
    this.bottom = centerY - height / 2;
    this.top = centerY + height / 2;
    
    this._projectionMatrixDirty = true;
  }

  /**
   * 平移相机和目标
   */
  pan(deltaX: number, deltaY: number): void {
    const right = this.getRight();
    const up = this.getUp();
    
    const offset = right.multiply(deltaX).add(up.multiply(deltaY));
    this.position = this.position.add(offset);
    this.target = this.target.add(offset);
    this._viewMatrixDirty = true;
  }

  /**
   * 复制相机
   */
  clone(): OrthographicCamera {
    return new OrthographicCamera(
      this.left,
      this.right,
      this.bottom,
      this.top,
      this.near,
      this.far,
      this.position,
      this.target,
      this.up
    );
  }
}