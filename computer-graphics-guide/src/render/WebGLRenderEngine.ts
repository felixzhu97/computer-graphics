import { Vec3, Mat4 } from '../math';

/**
 * WebGL错误类
 */
export class WebGLError extends Error {
  constructor(message: string, public operation?: string) {
    super(message);
    this.name = 'WebGLError';
  }
}

/**
 * WebGL错误处理工具
 */
export class WebGLErrorHandler {
  /**
   * 检查WebGL错误
   */
  static checkError(gl: WebGL2RenderingContext, operation: string): void {
    const error = gl.getError();
    if (error !== gl.NO_ERROR) {
      const errorString = this.getErrorString(gl, error);
      throw new WebGLError(`WebGL error in ${operation}: ${errorString}`, operation);
    }
  }

  /**
   * 获取错误字符串
   */
  static getErrorString(gl: WebGL2RenderingContext, error: number): string {
    switch (error) {
      case gl.NO_ERROR:
        return 'NO_ERROR';
      case gl.INVALID_ENUM:
        return 'INVALID_ENUM';
      case gl.INVALID_VALUE:
        return 'INVALID_VALUE';
      case gl.INVALID_OPERATION:
        return 'INVALID_OPERATION';
      case gl.INVALID_FRAMEBUFFER_OPERATION:
        return 'INVALID_FRAMEBUFFER_OPERATION';
      case gl.OUT_OF_MEMORY:
        return 'OUT_OF_MEMORY';
      case gl.CONTEXT_LOST_WEBGL:
        return 'CONTEXT_LOST_WEBGL';
      default:
        return `Unknown error: ${error}`;
    }
  }

  /**
   * 安全执行WebGL操作
   */
  static safeExecute<T>(
    gl: WebGL2RenderingContext,
    operation: string,
    fn: () => T
  ): T {
    try {
      const result = fn();
      this.checkError(gl, operation);
      return result;
    } catch (error) {
      if (error instanceof WebGLError) {
        throw error;
      }
      throw new WebGLError(`Error in ${operation}: ${error}`, operation);
    }
  }
}

/**
 * 渲染统计信息
 */
export interface RenderStats {
  drawCalls: number;
  vertices: number;
  triangles: number;
  frameTime: number;
  fps: number;
}

/**
 * 渲染引擎接口
 */
export interface RenderEngine {
  initialize(canvas: HTMLCanvasElement): Promise<void>;
  render(): void;
  resize(width: number, height: number): void;
  dispose(): void;
  getStats(): RenderStats;
}

/**
 * WebGL渲染引擎核心类
 */
export class WebGLRenderEngine implements RenderEngine {
  private canvas: HTMLCanvasElement | null = null;
  private gl: WebGL2RenderingContext | null = null;
  private animationFrameId: number | null = null;
  private isRunning = false;
  
  // 渲染统计
  private stats: RenderStats = {
    drawCalls: 0,
    vertices: 0,
    triangles: 0,
    frameTime: 0,
    fps: 0
  };
  
  // 性能监控
  private frameStartTime = 0;
  private frameCount = 0;
  private lastFpsUpdate = 0;
  
  // 设备像素比
  private devicePixelRatio = 1;
  
  // 调试模式
  private debugMode = false;

  /**
   * 初始化渲染引擎
   */
  async initialize(canvas: HTMLCanvasElement): Promise<void> {
    this.canvas = canvas;
    this.devicePixelRatio = window.devicePixelRatio || 1;
    
    // 获取WebGL2上下文
    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: true,
      depth: true,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: 'default'
    });
    
    if (!gl) {
      // 尝试WebGL1作为降级方案
      const gl1 = canvas.getContext('webgl', {
        alpha: false,
        antialias: true,
        depth: true,
        stencil: false,
        preserveDrawingBuffer: false
      });
      
      if (!gl1) {
        throw new WebGLError('WebGL is not supported in this browser');
      }
      
      console.warn('WebGL2 not available, falling back to WebGL1');
      // 注意：这里需要类型转换，实际项目中可能需要更复杂的处理
      this.gl = gl1 as unknown as WebGL2RenderingContext;
    } else {
      this.gl = gl;
    }
    
    // 设置初始状态
    this.setupInitialState();
    
    // 设置画布大小
    this.resize(canvas.clientWidth, canvas.clientHeight);
    
    // 监听上下文丢失事件
    this.setupContextLossHandling();
    
    console.log('WebGL渲染引擎初始化完成');
    console.log('WebGL版本:', this.gl.getParameter(this.gl.VERSION));
    console.log('着色器语言版本:', this.gl.getParameter(this.gl.SHADING_LANGUAGE_VERSION));
    console.log('渲染器:', this.gl.getParameter(this.gl.RENDERER));
  }

  /**
   * 设置WebGL初始状态
   */
  private setupInitialState(): void {
    if (!this.gl) return;
    
    const gl = this.gl;
    
    WebGLErrorHandler.safeExecute(gl, 'setup initial state', () => {
      // 启用深度测试
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      
      // 启用背面剔除
      gl.enable(gl.CULL_FACE);
      gl.cullFace(gl.BACK);
      gl.frontFace(gl.CCW);
      
      // 设置清除颜色
      gl.clearColor(0.1, 0.1, 0.1, 1.0);
      gl.clearDepth(1.0);
      
      // 设置视口
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    });
  }

  /**
   * 设置上下文丢失处理
   */
  private setupContextLossHandling(): void {
    if (!this.canvas) return;
    
    this.canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      console.warn('WebGL context lost');
      this.stop();
    });
    
    this.canvas.addEventListener('webglcontextrestored', () => {
      console.log('WebGL context restored');
      // 重新初始化资源
      this.setupInitialState();
    });
  }

  /**
   * 开始渲染循环
   */
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastFpsUpdate = performance.now();
    this.renderLoop();
  }

  /**
   * 停止渲染循环
   */
  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * 渲染循环
   */
  private renderLoop = (): void => {
    if (!this.isRunning) return;
    
    this.frameStartTime = performance.now();
    
    // 执行渲染
    this.render();
    
    // 更新性能统计
    this.updateStats();
    
    // 请求下一帧
    this.animationFrameId = requestAnimationFrame(this.renderLoop);
  };

  /**
   * 执行渲染
   */
  render(): void {
    if (!this.gl) return;
    
    const gl = this.gl;
    
    // 重置统计
    this.stats.drawCalls = 0;
    this.stats.vertices = 0;
    this.stats.triangles = 0;
    
    WebGLErrorHandler.safeExecute(gl, 'render', () => {
      // 清除缓冲区
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      
      // 这里将在后续任务中添加实际的渲染逻辑
      // 目前只是清除屏幕
    });
  }

  /**
   * 调整画布大小
   */
  resize(width: number, height: number): void {
    if (!this.canvas || !this.gl) return;
    
    // 考虑设备像素比
    const displayWidth = Math.floor(width * this.devicePixelRatio);
    const displayHeight = Math.floor(height * this.devicePixelRatio);
    
    // 设置画布实际大小
    this.canvas.width = displayWidth;
    this.canvas.height = displayHeight;
    
    // 设置CSS显示大小
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
    
    // 更新WebGL视口
    const gl = this.gl;
    WebGLErrorHandler.safeExecute(gl, 'resize viewport', () => {
      gl.viewport(0, 0, displayWidth, displayHeight);
    });
    
    console.log(`画布大小调整: ${width}x${height} (显示) -> ${displayWidth}x${displayHeight} (实际)`);
  }

  /**
   * 更新性能统计
   */
  private updateStats(): void {
    const now = performance.now();
    this.stats.frameTime = now - this.frameStartTime;
    this.frameCount++;
    
    // 每秒更新一次FPS
    if (now - this.lastFpsUpdate >= 1000) {
      this.stats.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }
  }

  /**
   * 获取渲染统计信息
   */
  getStats(): RenderStats {
    return { ...this.stats };
  }

  /**
   * 启用/禁用调试模式
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
    if (enabled) {
      console.log('WebGL调试模式已启用');
    }
  }

  /**
   * 获取WebGL上下文信息
   */
  getContextInfo(): Record<string, any> {
    if (!this.gl) return {};
    
    const gl = this.gl;
    return {
      version: gl.getParameter(gl.VERSION),
      shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
      vendor: gl.getParameter(gl.VENDOR),
      renderer: gl.getParameter(gl.RENDERER),
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
      maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS),
      maxFragmentUniforms: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
      maxVertexUniforms: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
      extensions: gl.getSupportedExtensions()
    };
  }

  /**
   * 获取WebGL上下文
   */
  getContext(): WebGL2RenderingContext | null {
    return this.gl;
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.stop();
    
    if (this.canvas) {
      // 移除事件监听器
      this.canvas.removeEventListener('webglcontextlost', () => {});
      this.canvas.removeEventListener('webglcontextrestored', () => {});
    }
    
    this.canvas = null;
    this.gl = null;
    
    console.log('WebGL渲染引擎已清理');
  }
}