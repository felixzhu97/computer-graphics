import { Vec3 } from '../math';
import { PerspectiveCamera, OrthographicCamera, Camera, Vec2 } from './Camera';

/**
 * 相机控制器基类
 */
export abstract class CameraController {
  protected camera: Camera;
  protected enabled: boolean = true;

  constructor(camera: Camera) {
    this.camera = camera;
  }

  /**
   * 启用/禁用控制器
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * 检查是否启用
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * 获取相机
   */
  getCamera(): Camera {
    return this.camera;
  }

  /**
   * 更新控制器（每帧调用）
   */
  abstract update(deltaTime: number): void;

  /**
   * 处理鼠标移动
   */
  abstract onMouseMove(deltaX: number, deltaY: number, isLeftButton: boolean, isRightButton: boolean, isMiddleButton: boolean): void;

  /**
   * 处理鼠标滚轮
   */
  abstract onMouseWheel(delta: number): void;

  /**
   * 处理键盘输入
   */
  abstract onKeyDown(key: string): void;
  abstract onKeyUp(key: string): void;

  /**
   * 重置相机到默认状态
   */
  abstract reset(): void;
}

/**
 * 轨道控制器 - 围绕目标点旋转
 */
export class OrbitController extends CameraController {
  private rotateSpeed: number = 1.0;
  private zoomSpeed: number = 1.0;
  private panSpeed: number = 1.0;
  private minDistance: number = 0.1;
  private maxDistance: number = 1000.0;
  private minPolarAngle: number = 0; // 最小极角（弧度）
  private maxPolarAngle: number = Math.PI; // 最大极角（弧度）
  
  private enableRotate: boolean = true;
  private enableZoom: boolean = true;
  private enablePan: boolean = true;
  
  private defaultPosition: Vec3;
  private defaultTarget: Vec3;
  private defaultUp: Vec3;

  constructor(camera: Camera, target?: Vec3) {
    super(camera);
    
    if (target) {
      this.camera.target = target.clone();
    }
    
    // 保存默认状态
    this.defaultPosition = this.camera.position.clone();
    this.defaultTarget = this.camera.target.clone();
    this.defaultUp = this.camera.up.clone();
  }

  /**
   * 设置旋转速度
   */
  setRotateSpeed(speed: number): void {
    this.rotateSpeed = speed;
  }

  /**
   * 设置缩放速度
   */
  setZoomSpeed(speed: number): void {
    this.zoomSpeed = speed;
  }

  /**
   * 设置平移速度
   */
  setPanSpeed(speed: number): void {
    this.panSpeed = speed;
  }

  /**
   * 设置距离限制
   */
  setDistanceLimits(min: number, max: number): void {
    this.minDistance = min;
    this.maxDistance = max;
  }

  /**
   * 设置极角限制
   */
  setPolarAngleLimits(min: number, max: number): void {
    this.minPolarAngle = min;
    this.maxPolarAngle = max;
  }

  /**
   * 启用/禁用各种控制
   */
  setEnableRotate(enable: boolean): void {
    this.enableRotate = enable;
  }

  setEnableZoom(enable: boolean): void {
    this.enableZoom = enable;
  }

  setEnablePan(enable: boolean): void {
    this.enablePan = enable;
  }

  /**
   * 更新控制器
   */
  update(deltaTime: number): void {
    if (!this.enabled) return;
    
    // 确保距离在限制范围内
    const distance = this.camera.position.subtract(this.camera.target).length();
    if (distance < this.minDistance || distance > this.maxDistance) {
      const clampedDistance = Math.max(this.minDistance, Math.min(this.maxDistance, distance));
      const direction = this.camera.position.subtract(this.camera.target).normalize();
      this.camera.position = this.camera.target.add(direction.multiply(clampedDistance));
    }
  }

  /**
   * 处理鼠标移动
   */
  onMouseMove(deltaX: number, deltaY: number, isLeftButton: boolean, isRightButton: boolean, isMiddleButton: boolean): void {
    if (!this.enabled) return;

    if (isLeftButton && this.enableRotate) {
      // 左键拖拽 - 旋转
      const azimuthDelta = -deltaX * this.rotateSpeed * 0.01;
      const elevationDelta = -deltaY * this.rotateSpeed * 0.01;
      this._rotate(azimuthDelta, elevationDelta);
    } else if (isRightButton && this.enablePan) {
      // 右键拖拽 - 平移
      const panX = -deltaX * this.panSpeed * 0.01;
      const panY = deltaY * this.panSpeed * 0.01;
      this._pan(panX, panY);
    } else if (isMiddleButton && this.enablePan) {
      // 中键拖拽 - 平移
      const panX = -deltaX * this.panSpeed * 0.01;
      const panY = deltaY * this.panSpeed * 0.01;
      this._pan(panX, panY);
    }
  }

  /**
   * 处理鼠标滚轮
   */
  onMouseWheel(delta: number): void {
    if (!this.enabled || !this.enableZoom) return;

    const zoomFactor = delta > 0 ? 0.9 : 1.1;
    this._zoom(zoomFactor);
  }

  /**
   * 处理键盘输入
   */
  onKeyDown(key: string): void {
    // 轨道控制器通常不需要键盘输入
  }

  onKeyUp(key: string): void {
    // 轨道控制器通常不需要键盘输入
  }

  /**
   * 重置到默认状态
   */
  reset(): void {
    this.camera.position = this.defaultPosition.clone();
    this.camera.target = this.defaultTarget.clone();
    this.camera.up = this.defaultUp.clone();
  }

  /**
   * 设置目标点
   */
  setTarget(target: Vec3): void {
    this.camera.target = target.clone();
  }

  /**
   * 获取目标点
   */
  getTarget(): Vec3 {
    return this.camera.target.clone();
  }

  /**
   * 私有方法：旋转
   */
  private _rotate(azimuthDelta: number, elevationDelta: number): void {
    if (this.camera instanceof PerspectiveCamera) {
      this.camera.orbitAroundTarget(azimuthDelta, elevationDelta);
    } else {
      // 对于正交相机，我们需要手动实现轨道旋转
      const offset = this.camera.position.subtract(this.camera.target);
      const radius = offset.length();
      
      // 计算当前的球坐标
      const azimuth = Math.atan2(offset.x, offset.z);
      const elevation = Math.asin(offset.y / radius);
      
      // 应用旋转
      const newAzimuth = azimuth + azimuthDelta;
      const newElevation = Math.max(
        this.minPolarAngle - Math.PI/2, 
        Math.min(this.maxPolarAngle - Math.PI/2, elevation + elevationDelta)
      );
      
      // 转换回笛卡尔坐标
      const newOffset = new Vec3(
        radius * Math.cos(newElevation) * Math.sin(newAzimuth),
        radius * Math.sin(newElevation),
        radius * Math.cos(newElevation) * Math.cos(newAzimuth)
      );
      
      this.camera.position = this.camera.target.add(newOffset);
    }
  }

  /**
   * 私有方法：缩放
   */
  private _zoom(factor: number): void {
    if (this.camera instanceof PerspectiveCamera) {
      this.camera.zoom(factor);
    } else if (this.camera instanceof OrthographicCamera) {
      this.camera.zoom(factor);
    }
  }

  /**
   * 私有方法：平移
   */
  private _pan(deltaX: number, deltaY: number): void {
    if (this.camera instanceof PerspectiveCamera) {
      this.camera.pan(deltaX, deltaY);
    } else if (this.camera instanceof OrthographicCamera) {
      this.camera.pan(deltaX, deltaY);
    }
  }
}

/**
 * 第一人称控制器
 */
export class FirstPersonController extends CameraController {
  private moveSpeed: number = 5.0;
  private lookSpeed: number = 1.0;
  private mouseSensitivity: number = 0.002;
  
  private keys: Set<string> = new Set();
  private yaw: number = 0; // 偏航角（绕Y轴旋转）
  private pitch: number = 0; // 俯仰角（绕X轴旋转）
  
  private minPitch: number = -Math.PI / 2 + 0.01;
  private maxPitch: number = Math.PI / 2 - 0.01;
  
  private defaultPosition: Vec3;
  private defaultYaw: number;
  private defaultPitch: number;

  constructor(camera: Camera) {
    super(camera);
    
    // 保存默认状态
    this.defaultPosition = this.camera.position.clone();
    
    // 从当前相机方向计算初始偏航角和俯仰角
    const forward = this.camera.target.subtract(this.camera.position).normalize();
    this.defaultYaw = this.yaw = Math.atan2(forward.x, forward.z);
    this.defaultPitch = this.pitch = Math.asin(-forward.y);
    
    this._updateCameraTarget();
  }

  /**
   * 设置移动速度
   */
  setMoveSpeed(speed: number): void {
    this.moveSpeed = speed;
  }

  /**
   * 设置视角转动速度
   */
  setLookSpeed(speed: number): void {
    this.lookSpeed = speed;
  }

  /**
   * 设置鼠标灵敏度
   */
  setMouseSensitivity(sensitivity: number): void {
    this.mouseSensitivity = sensitivity;
  }

  /**
   * 设置俯仰角限制
   */
  setPitchLimits(min: number, max: number): void {
    this.minPitch = min;
    this.maxPitch = max;
  }

  /**
   * 更新控制器
   */
  update(deltaTime: number): void {
    if (!this.enabled) return;

    const moveDistance = this.moveSpeed * deltaTime;
    let moveVector = Vec3.zero();

    // 计算移动方向
    if (this.keys.has('w') || this.keys.has('W')) {
      moveVector = moveVector.add(this._getForward());
    }
    if (this.keys.has('s') || this.keys.has('S')) {
      moveVector = moveVector.subtract(this._getForward());
    }
    if (this.keys.has('a') || this.keys.has('A')) {
      moveVector = moveVector.subtract(this._getRight());
    }
    if (this.keys.has('d') || this.keys.has('D')) {
      moveVector = moveVector.add(this._getRight());
    }
    if (this.keys.has(' ')) { // 空格键上升
      moveVector = moveVector.add(Vec3.up());
    }
    if (this.keys.has('Shift')) { // Shift键下降
      moveVector = moveVector.subtract(Vec3.up());
    }

    // 应用移动
    if (moveVector.lengthSquared() > 0) {
      moveVector = moveVector.normalize().multiply(moveDistance);
      this.camera.position = this.camera.position.add(moveVector);
      this._updateCameraTarget();
    }
  }

  /**
   * 处理鼠标移动
   */
  onMouseMove(deltaX: number, deltaY: number, isLeftButton: boolean, isRightButton: boolean, isMiddleButton: boolean): void {
    if (!this.enabled) return;

    // 第一人称控制器通常在鼠标锁定时工作，不需要按键
    this.yaw -= deltaX * this.mouseSensitivity * this.lookSpeed;
    this.pitch -= deltaY * this.mouseSensitivity * this.lookSpeed;
    
    // 限制俯仰角
    this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitch));
    
    this._updateCameraTarget();
  }

  /**
   * 处理鼠标滚轮
   */
  onMouseWheel(delta: number): void {
    // 第一人称控制器通常不使用滚轮
  }

  /**
   * 处理键盘按下
   */
  onKeyDown(key: string): void {
    if (!this.enabled) return;
    this.keys.add(key);
  }

  /**
   * 处理键盘释放
   */
  onKeyUp(key: string): void {
    if (!this.enabled) return;
    this.keys.delete(key);
  }

  /**
   * 重置到默认状态
   */
  reset(): void {
    this.camera.position = this.defaultPosition.clone();
    this.yaw = this.defaultYaw;
    this.pitch = this.defaultPitch;
    this.keys.clear();
    this._updateCameraTarget();
  }

  /**
   * 设置视角方向
   */
  setLookDirection(yaw: number, pitch: number): void {
    this.yaw = yaw;
    this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, pitch));
    this._updateCameraTarget();
  }

  /**
   * 获取当前视角方向
   */
  getLookDirection(): { yaw: number; pitch: number } {
    return { yaw: this.yaw, pitch: this.pitch };
  }

  /**
   * 私有方法：更新相机目标点
   */
  private _updateCameraTarget(): void {
    const forward = this._getForward();
    this.camera.target = this.camera.position.add(forward);
  }

  /**
   * 私有方法：获取前向向量
   */
  private _getForward(): Vec3 {
    return new Vec3(
      Math.sin(this.yaw) * Math.cos(this.pitch),
      -Math.sin(this.pitch),
      Math.cos(this.yaw) * Math.cos(this.pitch)
    );
  }

  /**
   * 私有方法：获取右向向量
   */
  private _getRight(): Vec3 {
    return new Vec3(
      Math.cos(this.yaw),
      0,
      -Math.sin(this.yaw)
    );
  }
}

/**
 * 相机控制器工厂
 */
export class CameraControllerFactory {
  /**
   * 创建轨道控制器
   */
  static createOrbitController(camera: Camera, target?: Vec3): OrbitController {
    return new OrbitController(camera, target);
  }

  /**
   * 创建第一人称控制器
   */
  static createFirstPersonController(camera: Camera): FirstPersonController {
    return new FirstPersonController(camera);
  }
}