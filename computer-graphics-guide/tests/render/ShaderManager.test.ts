import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  ShaderManager, 
  WebGLShaderProgram, 
  ShaderCompileError, 
  ShaderLinkError 
} from '../../src/render/ShaderManager';
import { Vec3, Vec4, Mat4 } from '../../src/math';

// Mock WebGL context for shader testing
const createMockWebGL2Context = () => {
  const mockProgram = {} as WebGLProgram;
  const mockVertexShader = {} as WebGLShader;
  const mockFragmentShader = {} as WebGLShader;
  const mockBuffer = {} as WebGLBuffer;
  const mockTexture = {} as WebGLTexture;
  const mockUniformLocation = {} as WebGLUniformLocation;
  
  const gl = {
    // Constants
    NO_ERROR: 0,
    VERTEX_SHADER: 35633,
    FRAGMENT_SHADER: 35632,
    COMPILE_STATUS: 35713,
    LINK_STATUS: 35714,
    ACTIVE_ATTRIBUTES: 35721,
    ACTIVE_UNIFORMS: 35718,
    ARRAY_BUFFER: 34962,
    FLOAT: 5126,
    FLOAT_VEC2: 35664,
    FLOAT_VEC3: 35665,
    FLOAT_VEC4: 35666,
    INT: 5124,
    INT_VEC2: 35667,
    INT_VEC3: 35668,
    INT_VEC4: 35669,
    BOOL: 35670,
    BOOL_VEC2: 35671,
    BOOL_VEC3: 35672,
    BOOL_VEC4: 35673,
    FLOAT_MAT2: 35674,
    FLOAT_MAT3: 35675,
    FLOAT_MAT4: 35676,
    SAMPLER_2D: 35678,
    SAMPLER_CUBE: 35680,
    
    // Methods
    createProgram: vi.fn(() => mockProgram),
    createShader: vi.fn(() => mockVertexShader),
    shaderSource: vi.fn(),
    compileShader: vi.fn(),
    attachShader: vi.fn(),
    linkProgram: vi.fn(),
    useProgram: vi.fn(),
    deleteProgram: vi.fn(),
    deleteShader: vi.fn(),
    getError: vi.fn(function() { return this.NO_ERROR; }),
    
    getShaderParameter: vi.fn(() => true), // COMPILE_STATUS = true
    getProgramParameter: vi.fn((program, pname) => {
      if (pname === 35714) return true; // LINK_STATUS = true
      if (pname === 35721) return 2; // ACTIVE_ATTRIBUTES = 2
      if (pname === 35718) return 2; // ACTIVE_UNIFORMS = 2
      return 0;
    }),
    
    getShaderInfoLog: vi.fn(() => ''),
    getProgramInfoLog: vi.fn(() => ''),
    
    getActiveAttrib: vi.fn((program, index) => {
      const attributes = [
        { name: 'a_position', type: 35665, size: 1 }, // FLOAT_VEC3
        { name: 'a_normal', type: 35665, size: 1 }    // FLOAT_VEC3
      ];
      return attributes[index] || null;
    }),
    
    getActiveUniform: vi.fn((program, index) => {
      const uniforms = [
        { name: 'u_mvpMatrix', type: 35676, size: 1 }, // FLOAT_MAT4
        { name: 'u_color', type: 35665, size: 1 }      // FLOAT_VEC3
      ];
      return uniforms[index] || null;
    }),
    
    getAttribLocation: vi.fn((program, name) => {
      const locations: Record<string, number> = {
        'a_position': 0,
        'a_normal': 1
      };
      return locations[name] ?? -1;
    }),
    
    getUniformLocation: vi.fn((program, name) => {
      const locations: Record<string, WebGLUniformLocation> = {
        'u_mvpMatrix': mockUniformLocation,
        'u_color': mockUniformLocation
      };
      return locations[name] || null;
    }),
    
    // Uniform setters
    uniform1f: vi.fn(),
    uniform1fv: vi.fn(),
    uniform1i: vi.fn(),
    uniform2fv: vi.fn(),
    uniform3f: vi.fn(),
    uniform3fv: vi.fn(),
    uniform4f: vi.fn(),
    uniform4fv: vi.fn(),
    uniformMatrix4fv: vi.fn(),
    
    // Attribute setters
    bindBuffer: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    vertexAttribPointer: vi.fn(),
    
    // Texture methods
    activeTexture: vi.fn(),
    bindTexture: vi.fn(),
    TEXTURE_2D: 3553,
    TEXTURE0: 33984,
    
    // Additional parameters
    MAX_TEXTURE_IMAGE_UNITS: 35661,
    getParameter: vi.fn((pname) => {
      if (pname === 35661) return 16; // MAX_TEXTURE_IMAGE_UNITS
      return 0;
    })
  };
  
  return gl as unknown as WebGL2RenderingContext;
};

describe('ShaderManager', () => {
  let shaderManager: ShaderManager;
  let mockGL: WebGL2RenderingContext;
  
  const vertexShaderSource = `#version 300 es
    in vec3 a_position;
    in vec3 a_normal;
    uniform mat4 u_mvpMatrix;
    
    void main() {
      gl_Position = u_mvpMatrix * vec4(a_position, 1.0);
    }
  `;
  
  const fragmentShaderSource = `#version 300 es
    precision mediump float;
    uniform vec3 u_color;
    out vec4 fragColor;
    
    void main() {
      fragColor = vec4(u_color, 1.0);
    }
  `;
  
  beforeEach(() => {
    mockGL = createMockWebGL2Context();
    shaderManager = new ShaderManager(mockGL);
  });
  
  afterEach(() => {
    shaderManager.dispose();
    vi.restoreAllMocks();
  });
  
  test('should create shader program successfully', () => {
    const program = shaderManager.createProgram('test', vertexShaderSource, fragmentShaderSource);
    
    expect(program).toBeDefined();
    expect(program.id).toBe('test');
    expect(mockGL.createShader).toHaveBeenCalledTimes(2);
    expect(mockGL.createProgram).toHaveBeenCalledTimes(1);
    expect(mockGL.linkProgram).toHaveBeenCalledTimes(1);
  });
  
  test('should throw error when shader compilation fails', () => {
    vi.mocked(mockGL.getShaderParameter).mockReturnValue(false);
    vi.mocked(mockGL.getShaderInfoLog).mockReturnValue('Compilation error');
    
    expect(() => {
      shaderManager.createProgram('test', vertexShaderSource, fragmentShaderSource);
    }).toThrow(ShaderCompileError);
  });
  
  test('should throw error when program linking fails', () => {
    vi.mocked(mockGL.getProgramParameter).mockImplementation((program, pname) => {
      if (pname === 35714) return false; // LINK_STATUS = false
      if (pname === 35721) return 2; // ACTIVE_ATTRIBUTES = 2
      if (pname === 35718) return 2; // ACTIVE_UNIFORMS = 2
      return 0;
    });
    vi.mocked(mockGL.getProgramInfoLog).mockReturnValue('Linking error');
    
    expect(() => {
      shaderManager.createProgram('test', vertexShaderSource, fragmentShaderSource);
    }).toThrow(ShaderLinkError);
  });
  
  test('should get existing program', () => {
    const program = shaderManager.createProgram('test', vertexShaderSource, fragmentShaderSource);
    const retrieved = shaderManager.getProgram('test');
    
    expect(retrieved).toBe(program);
  });
  
  test('should return undefined for non-existent program', () => {
    const retrieved = shaderManager.getProgram('nonexistent');
    expect(retrieved).toBeUndefined();
  });
  
  test('should check if program exists', () => {
    expect(shaderManager.hasProgram('test')).toBe(false);
    
    shaderManager.createProgram('test', vertexShaderSource, fragmentShaderSource);
    expect(shaderManager.hasProgram('test')).toBe(true);
  });
  
  test('should reload shader program', async () => {
    shaderManager.createProgram('test', vertexShaderSource, fragmentShaderSource);
    
    const newVertexSource = vertexShaderSource.replace('a_position', 'a_pos');
    await expect(shaderManager.reloadShader('test', newVertexSource)).resolves.not.toThrow();
  });
  
  test('should delete program', () => {
    const program = shaderManager.createProgram('test', vertexShaderSource, fragmentShaderSource);
    
    expect(shaderManager.deleteProgram('test')).toBe(true);
    expect(shaderManager.hasProgram('test')).toBe(false);
    expect(mockGL.deleteProgram).toHaveBeenCalledWith(program.program);
  });
  
  test('should return false when deleting non-existent program', () => {
    expect(shaderManager.deleteProgram('nonexistent')).toBe(false);
  });
  
  test('should get program IDs', () => {
    shaderManager.createProgram('test1', vertexShaderSource, fragmentShaderSource);
    shaderManager.createProgram('test2', vertexShaderSource, fragmentShaderSource);
    
    const ids = shaderManager.getProgramIds();
    expect(ids).toContain('test1');
    expect(ids).toContain('test2');
    expect(ids).toHaveLength(2);
  });
  
  test('should get shader info', () => {
    shaderManager.createProgram('test', vertexShaderSource, fragmentShaderSource);
    
    const info = shaderManager.getShaderInfo('test');
    expect(info).toBeDefined();
    expect(info.id).toBe('test');
    expect(info.attributes).toHaveLength(2);
    expect(info.uniforms).toHaveLength(2);
    expect(info.source.vertex).toBe(vertexShaderSource);
    expect(info.source.fragment).toBe(fragmentShaderSource);
  });
  
  test('should dispose all programs', () => {
    const program1 = shaderManager.createProgram('test1', vertexShaderSource, fragmentShaderSource);
    const program2 = shaderManager.createProgram('test2', vertexShaderSource, fragmentShaderSource);
    
    shaderManager.dispose();
    
    expect(mockGL.deleteProgram).toHaveBeenCalledWith(program1.program);
    expect(mockGL.deleteProgram).toHaveBeenCalledWith(program2.program);
    expect(shaderManager.getProgramIds()).toHaveLength(0);
  });
  
  test('should manage texture units', () => {
    shaderManager.createProgram('test', vertexShaderSource, fragmentShaderSource);
    const program = shaderManager.getProgram('test')!;
    
    const texture1 = {} as WebGLTexture;
    const texture2 = {} as WebGLTexture;
    
    program.setUniform('u_color', texture1);
    program.setUniform('u_mvpMatrix', texture2);
    
    const textureInfo = shaderManager.getTextureUnitInfo();
    expect(textureInfo.used).toBe(2);
    expect(textureInfo.max).toBeGreaterThan(0);
  });
  
  test('should reset texture units', () => {
    shaderManager.createProgram('test', vertexShaderSource, fragmentShaderSource);
    const program = shaderManager.getProgram('test')!;
    
    const texture = {} as WebGLTexture;
    program.setUniform('u_color', texture);
    
    expect(shaderManager.getTextureUnitInfo().used).toBe(1);
    
    shaderManager.resetTextureUnits();
    expect(shaderManager.getTextureUnitInfo().used).toBe(0);
  });
  
  test('should validate shader source', () => {
    const result = shaderManager.validateShaderSource(vertexShaderSource, fragmentShaderSource);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
  
  test('should detect invalid shader source', () => {
    vi.mocked(mockGL.getShaderParameter).mockReturnValue(false);
    vi.mocked(mockGL.getShaderInfoLog).mockReturnValue('Syntax error');
    
    const result = shaderManager.validateShaderSource('invalid vertex', 'invalid fragment');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
  
  test('should get all shader info', () => {
    shaderManager.createProgram('test1', vertexShaderSource, fragmentShaderSource);
    shaderManager.createProgram('test2', vertexShaderSource, fragmentShaderSource);
    
    const allInfo = shaderManager.getAllShaderInfo();
    expect(allInfo).toHaveLength(2);
    expect(allInfo[0].id).toBe('test1');
    expect(allInfo[1].id).toBe('test2');
  });
  
  test('should preprocess shader source with defines', () => {
    const source = `#version 300 es
void main() {}`;
    
    const processed = shaderManager.preprocessShaderSource(source, {
      'MAX_LIGHTS': 4,
      'USE_SHADOWS': 1
    });
    
    expect(processed).toContain('#define MAX_LIGHTS 4');
    expect(processed).toContain('#define USE_SHADOWS 1');
  });
  
  test('should create program with defines', () => {
    const program = shaderManager.createProgramWithDefines(
      'test_defines', 
      vertexShaderSource, 
      fragmentShaderSource,
      { 'MAX_LIGHTS': 4 }
    );
    
    expect(program).toBeDefined();
    expect(program.id).toBe('test_defines');
  });
});

describe('WebGLShaderProgram', () => {
  let mockGL: WebGL2RenderingContext;
  let program: WebGLShaderProgram;
  let mockWebGLProgram: WebGLProgram;
  
  beforeEach(() => {
    mockGL = createMockWebGL2Context();
    mockWebGLProgram = {} as WebGLProgram;
    const mockShaderManager = new ShaderManager(mockGL);
    program = new WebGLShaderProgram(mockGL, 'test', mockWebGLProgram, mockShaderManager);
  });
  
  afterEach(() => {
    program.dispose();
  });
  
  test('should use program', () => {
    program.use();
    expect(mockGL.useProgram).toHaveBeenCalledWith(mockWebGLProgram);
  });
  
  test('should set number uniform', () => {
    program.setUniform('u_color', 1.5);
    expect(mockGL.uniform1f).toHaveBeenCalled();
  });
  
  test('should set Vec3 uniform', () => {
    const vec3 = new Vec3(1, 2, 3);
    program.setUniform('u_color', vec3);
    expect(mockGL.uniform3f).toHaveBeenCalledWith(expect.anything(), 1, 2, 3);
  });
  
  test('should set Vec4 uniform', () => {
    const vec4 = new Vec4(1, 2, 3, 4);
    program.setUniform('u_color', vec4);
    expect(mockGL.uniform4f).toHaveBeenCalledWith(expect.anything(), 1, 2, 3, 4);
  });
  
  test('should set Mat4 uniform', () => {
    const mat4 = Mat4.identity();
    program.setUniform('u_mvpMatrix', mat4);
    expect(mockGL.uniformMatrix4fv).toHaveBeenCalledWith(
      expect.anything(), 
      false, 
      mat4.getData()
    );
  });
  
  test('should set Float32Array uniform', () => {
    const array = new Float32Array([1, 2, 3]);
    program.setUniform('u_color', array);
    expect(mockGL.uniform3fv).toHaveBeenCalledWith(expect.anything(), array);
  });
  
  test('should set array uniform', () => {
    const array = [1, 2, 3, 4];
    program.setUniform('u_color', array);
    expect(mockGL.uniform4fv).toHaveBeenCalled();
  });
  
  test('should set texture uniform', () => {
    const texture = {} as WebGLTexture;
    program.setUniform('u_color', texture); // Use existing uniform
    
    expect(mockGL.activeTexture).toHaveBeenCalled();
    expect(mockGL.bindTexture).toHaveBeenCalledWith(mockGL.TEXTURE_2D, texture);
    expect(mockGL.uniform1i).toHaveBeenCalled();
  });
  
  test('should warn for non-existent uniform', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    program.setUniform('nonexistent', 1.0);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Uniform 'nonexistent' not found in shader program 'test'"
    );
    
    consoleSpy.mockRestore();
  });
  
  test('should set attribute', () => {
    const buffer = {} as WebGLBuffer;
    program.setAttribute('a_position', buffer, 3);
    
    expect(mockGL.bindBuffer).toHaveBeenCalledWith(mockGL.ARRAY_BUFFER, buffer);
    expect(mockGL.enableVertexAttribArray).toHaveBeenCalledWith(0); // a_position location
    expect(mockGL.vertexAttribPointer).toHaveBeenCalledWith(0, 3, mockGL.FLOAT, false, 0, 0);
  });
  
  test('should warn for non-existent attribute', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const buffer = {} as WebGLBuffer;
    
    program.setAttribute('nonexistent', buffer, 3);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Attribute 'nonexistent' not found in shader program 'test'"
    );
    
    consoleSpy.mockRestore();
  });
  
  test('should check uniform existence', () => {
    expect(program.hasUniform('u_mvpMatrix')).toBe(true);
    expect(program.hasUniform('nonexistent')).toBe(false);
  });
  
  test('should check attribute existence', () => {
    expect(program.hasAttribute('a_position')).toBe(true);
    expect(program.hasAttribute('nonexistent')).toBe(false);
  });
  
  test('should dispose program', () => {
    program.dispose();
    expect(mockGL.deleteProgram).toHaveBeenCalledWith(mockWebGLProgram);
  });
});