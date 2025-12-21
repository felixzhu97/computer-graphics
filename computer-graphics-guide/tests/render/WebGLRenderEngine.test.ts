import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebGLRenderEngine, WebGLError, WebGLErrorHandler } from '../../src/render/WebGLRenderEngine';

// Mock WebGL context
const createMockWebGL2Context = () => {
  const gl = {
    // Constants
    NO_ERROR: 0,
    INVALID_ENUM: 1280,
    INVALID_VALUE: 1281,
    INVALID_OPERATION: 1282,
    INVALID_FRAMEBUFFER_OPERATION: 1286,
    OUT_OF_MEMORY: 1285,
    CONTEXT_LOST_WEBGL: 37442,
    
    COLOR_BUFFER_BIT: 16384,
    DEPTH_BUFFER_BIT: 256,
    DEPTH_TEST: 2929,
    LEQUAL: 515,
    CULL_FACE: 2884,
    BACK: 1029,
    CCW: 2305,
    
    VERSION: 7938,
    SHADING_LANGUAGE_VERSION: 35724,
    VENDOR: 7936,
    RENDERER: 7937,
    MAX_TEXTURE_SIZE: 3379,
    MAX_VERTEX_ATTRIBS: 34921,
    MAX_VARYING_VECTORS: 36348,
    MAX_FRAGMENT_UNIFORM_VECTORS: 36349,
    MAX_VERTEX_UNIFORM_VECTORS: 36347,
    
    // Canvas properties
    canvas: {
      width: 800,
      height: 600
    },
    
    // Methods
    getError: vi.fn(() => 0), // NO_ERROR
    enable: vi.fn(),
    depthFunc: vi.fn(),
    cullFace: vi.fn(),
    frontFace: vi.fn(),
    clearColor: vi.fn(),
    clearDepth: vi.fn(),
    viewport: vi.fn(),
    clear: vi.fn(),
    getParameter: vi.fn((param) => {
      switch (param) {
        case 7938: return 'WebGL 2.0';
        case 35724: return 'WebGL GLSL ES 3.00';
        case 7936: return 'Test Vendor';
        case 7937: return 'Test Renderer';
        case 3379: return 4096;
        case 34921: return 16;
        case 36348: return 30;
        case 36349: return 1024;
        case 36347: return 1024;
        default: return null;
      }
    }),
    getSupportedExtensions: vi.fn(() => ['EXT_texture_filter_anisotropic'])
  };
  
  return gl as unknown as WebGL2RenderingContext;
};

// Mock HTMLCanvasElement
const createMockCanvas = () => {
  const canvas = {
    clientWidth: 800,
    clientHeight: 600,
    width: 800,
    height: 600,
    style: {},
    getContext: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  };
  
  return canvas as unknown as HTMLCanvasElement;
};

describe('WebGLErrorHandler', () => {
  let mockGL: WebGL2RenderingContext;
  
  beforeEach(() => {
    mockGL = createMockWebGL2Context();
  });
  
  test('should not throw error when no WebGL error', () => {
    vi.mocked(mockGL.getError).mockReturnValue(mockGL.NO_ERROR);
    
    expect(() => {
      WebGLErrorHandler.checkError(mockGL, 'test operation');
    }).not.toThrow();
  });
  
  test('should throw WebGLError when WebGL error occurs', () => {
    vi.mocked(mockGL.getError).mockReturnValue(mockGL.INVALID_ENUM);
    
    expect(() => {
      WebGLErrorHandler.checkError(mockGL, 'test operation');
    }).toThrow(WebGLError);
  });
  
  test('should return correct error string', () => {
    expect(WebGLErrorHandler.getErrorString(mockGL, mockGL.NO_ERROR)).toBe('NO_ERROR');
    expect(WebGLErrorHandler.getErrorString(mockGL, mockGL.INVALID_ENUM)).toBe('INVALID_ENUM');
    expect(WebGLErrorHandler.getErrorString(mockGL, mockGL.INVALID_VALUE)).toBe('INVALID_VALUE');
  });
  
  test('should safely execute operations', () => {
    vi.mocked(mockGL.getError).mockReturnValue(mockGL.NO_ERROR);
    
    const result = WebGLErrorHandler.safeExecute(mockGL, 'test', () => {
      return 'success';
    });
    
    expect(result).toBe('success');
  });
});

describe('WebGLRenderEngine', () => {
  let engine: WebGLRenderEngine;
  let mockCanvas: HTMLCanvasElement;
  let mockGL: WebGL2RenderingContext;
  
  beforeEach(() => {
    engine = new WebGLRenderEngine();
    mockCanvas = createMockCanvas();
    mockGL = createMockWebGL2Context();
    
    // Mock window.devicePixelRatio
    Object.defineProperty(window, 'devicePixelRatio', {
      writable: true,
      value: 1
    });
    
    // Mock performance.now
    vi.spyOn(performance, 'now').mockReturnValue(1000);
    
    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn((callback) => {
      setTimeout(callback, 16);
      return 1;
    });
    
    global.cancelAnimationFrame = vi.fn();
  });
  
  afterEach(() => {
    engine.dispose();
    vi.restoreAllMocks();
  });
  
  test('should initialize successfully with WebGL2', async () => {
    vi.mocked(mockCanvas.getContext).mockReturnValue(mockGL);
    
    await expect(engine.initialize(mockCanvas)).resolves.not.toThrow();
    
    expect(mockCanvas.getContext).toHaveBeenCalledWith('webgl2', expect.any(Object));
    expect(mockGL.enable).toHaveBeenCalledWith(mockGL.DEPTH_TEST);
    expect(mockGL.enable).toHaveBeenCalledWith(mockGL.CULL_FACE);
  });
  
  test('should fallback to WebGL1 when WebGL2 is not available', async () => {
    const mockGL1 = createMockWebGL2Context();
    vi.mocked(mockCanvas.getContext)
      .mockReturnValueOnce(null) // WebGL2 not available
      .mockReturnValueOnce(mockGL1); // WebGL1 available
    
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    await expect(engine.initialize(mockCanvas)).resolves.not.toThrow();
    
    expect(consoleSpy).toHaveBeenCalledWith('WebGL2 not available, falling back to WebGL1');
    
    consoleSpy.mockRestore();
  });
  
  test('should throw error when neither WebGL2 nor WebGL1 is available', async () => {
    vi.mocked(mockCanvas.getContext).mockReturnValue(null);
    
    await expect(engine.initialize(mockCanvas)).rejects.toThrow('WebGL is not supported in this browser');
  });
  
  test('should resize canvas correctly', async () => {
    vi.mocked(mockCanvas.getContext).mockReturnValue(mockGL);
    await engine.initialize(mockCanvas);
    
    engine.resize(1024, 768);
    
    expect(mockCanvas.width).toBe(1024);
    expect(mockCanvas.height).toBe(768);
    expect(mockCanvas.style.width).toBe('1024px');
    expect(mockCanvas.style.height).toBe('768px');
    expect(mockGL.viewport).toHaveBeenCalledWith(0, 0, 1024, 768);
  });
  
  test('should handle device pixel ratio', async () => {
    Object.defineProperty(window, 'devicePixelRatio', {
      writable: true,
      value: 2
    });
    
    vi.mocked(mockCanvas.getContext).mockReturnValue(mockGL);
    await engine.initialize(mockCanvas);
    
    engine.resize(800, 600);
    
    expect(mockCanvas.width).toBe(1600); // 800 * 2
    expect(mockCanvas.height).toBe(1200); // 600 * 2
    expect(mockGL.viewport).toHaveBeenCalledWith(0, 0, 1600, 1200);
  });
  
  test('should render without errors', async () => {
    vi.mocked(mockCanvas.getContext).mockReturnValue(mockGL);
    await engine.initialize(mockCanvas);
    
    expect(() => engine.render()).not.toThrow();
    expect(mockGL.clear).toHaveBeenCalledWith(mockGL.COLOR_BUFFER_BIT | mockGL.DEPTH_BUFFER_BIT);
  });
  
  test('should return render stats', async () => {
    vi.mocked(mockCanvas.getContext).mockReturnValue(mockGL);
    await engine.initialize(mockCanvas);
    
    const stats = engine.getStats();
    
    expect(stats).toHaveProperty('drawCalls');
    expect(stats).toHaveProperty('vertices');
    expect(stats).toHaveProperty('triangles');
    expect(stats).toHaveProperty('frameTime');
    expect(stats).toHaveProperty('fps');
  });
  
  test('should return context info', async () => {
    vi.mocked(mockCanvas.getContext).mockReturnValue(mockGL);
    await engine.initialize(mockCanvas);
    
    const info = engine.getContextInfo();
    
    expect(info.version).toBe('WebGL 2.0');
    expect(info.shadingLanguageVersion).toBe('WebGL GLSL ES 3.00');
    expect(info.vendor).toBe('Test Vendor');
    expect(info.renderer).toBe('Test Renderer');
  });
  
  test('should start and stop render loop', async () => {
    vi.mocked(mockCanvas.getContext).mockReturnValue(mockGL);
    await engine.initialize(mockCanvas);
    
    engine.start();
    expect(global.requestAnimationFrame).toHaveBeenCalled();
    
    engine.stop();
    expect(global.cancelAnimationFrame).toHaveBeenCalled();
  });
  
  test('should dispose resources properly', async () => {
    vi.mocked(mockCanvas.getContext).mockReturnValue(mockGL);
    await engine.initialize(mockCanvas);
    
    engine.start();
    engine.dispose();
    
    expect(engine.getContext()).toBeNull();
    expect(global.cancelAnimationFrame).toHaveBeenCalled();
  });
});