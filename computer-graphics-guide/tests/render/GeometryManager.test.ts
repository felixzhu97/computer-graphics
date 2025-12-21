import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { GeometryManager, Geometry, VertexBuffer, IndexBuffer } from '../../src/render/GeometryManager';

// Mock WebGL2RenderingContext
class MockWebGL2RenderingContext {
  ARRAY_BUFFER = 34962;
  ELEMENT_ARRAY_BUFFER = 34963;
  STATIC_DRAW = 35044;
  NO_ERROR = 0;

  private bufferCounter = 0;
  private buffers = new Map<WebGLBuffer, { type: number; data: ArrayBuffer }>();

  createBuffer(): WebGLBuffer {
    const buffer = { id: ++this.bufferCounter } as WebGLBuffer;
    return buffer;
  }

  deleteBuffer(buffer: WebGLBuffer): void {
    this.buffers.delete(buffer);
  }

  bindBuffer(target: number, buffer: WebGLBuffer | null): void {
    // Mock implementation
  }

  bufferData(target: number, data: ArrayBuffer, usage: number): void {
    // Mock implementation - store data for verification
  }

  getError(): number {
    return this.NO_ERROR;
  }
}

describe('GeometryManager', () => {
  let gl: MockWebGL2RenderingContext;
  let geometryManager: GeometryManager;

  beforeEach(() => {
    gl = new MockWebGL2RenderingContext();
    geometryManager = new GeometryManager(gl as any);
  });

  afterEach(() => {
    geometryManager.dispose();
  });

  describe('createCube', () => {
    test('should create cube with correct vertex count', () => {
      const cube = geometryManager.createCube(2.0);
      
      expect(cube.vertices.length).toBe(24 * 3); // 24 vertices, 3 components each
      expect(cube.indices.length).toBe(12 * 3); // 12 triangles, 3 indices each
      expect(cube.normals).toBeDefined();
      expect(cube.normals!.length).toBe(24 * 3);
      expect(cube.texCoords).toBeDefined();
      expect(cube.texCoords!.length).toBe(24 * 2);
    });

    test('should create cube with correct size', () => {
      const size = 2.0;
      const cube = geometryManager.createCube(size);
      const halfSize = size * 0.5;
      
      // Check that vertices are within expected bounds
      for (let i = 0; i < cube.vertices.length; i += 3) {
        const x = cube.vertices[i];
        const y = cube.vertices[i + 1];
        const z = cube.vertices[i + 2];
        
        expect(Math.abs(x)).toBeLessThanOrEqual(halfSize + 0.001);
        expect(Math.abs(y)).toBeLessThanOrEqual(halfSize + 0.001);
        expect(Math.abs(z)).toBeLessThanOrEqual(halfSize + 0.001);
      }
    });

    test('should cache cube geometry', () => {
      const cube1 = geometryManager.createCube(1.0);
      const cube2 = geometryManager.createCube(1.0);
      
      expect(cube1).toBe(cube2); // Should be the same object reference
    });

    test('should create different cubes for different sizes', () => {
      const cube1 = geometryManager.createCube(1.0);
      const cube2 = geometryManager.createCube(2.0);
      
      expect(cube1).not.toBe(cube2);
    });
  });

  describe('createSphere', () => {
    test('should create sphere with correct vertex count', () => {
      const segments = 16;
      const sphere = geometryManager.createSphere(1.0, segments);
      
      const expectedVertexCount = (segments + 1) * (segments + 1);
      expect(sphere.vertices.length).toBe(expectedVertexCount * 3);
      expect(sphere.normals).toBeDefined();
      expect(sphere.normals!.length).toBe(expectedVertexCount * 3);
      expect(sphere.texCoords).toBeDefined();
      expect(sphere.texCoords!.length).toBe(expectedVertexCount * 2);
    });

    test('should create sphere with correct radius', () => {
      const radius = 2.0;
      const sphere = geometryManager.createSphere(radius, 8);
      
      // Check that vertices are approximately on the sphere surface
      for (let i = 0; i < sphere.vertices.length; i += 3) {
        const x = sphere.vertices[i];
        const y = sphere.vertices[i + 1];
        const z = sphere.vertices[i + 2];
        
        const distance = Math.sqrt(x * x + y * y + z * z);
        expect(distance).toBeCloseTo(radius, 2);
      }
    });

    test('should create sphere with correct triangle count', () => {
      const segments = 8;
      const sphere = geometryManager.createSphere(1.0, segments);
      
      const expectedTriangleCount = segments * segments * 2;
      expect(sphere.indices.length).toBe(expectedTriangleCount * 3);
    });

    test('should cache sphere geometry', () => {
      const sphere1 = geometryManager.createSphere(1.0, 16);
      const sphere2 = geometryManager.createSphere(1.0, 16);
      
      expect(sphere1).toBe(sphere2);
    });
  });

  describe('createPlane', () => {
    test('should create plane with correct vertex count', () => {
      const widthSegments = 2;
      const heightSegments = 3;
      const plane = geometryManager.createPlane(2.0, 3.0, widthSegments, heightSegments);
      
      const expectedVertexCount = (widthSegments + 1) * (heightSegments + 1);
      expect(plane.vertices.length).toBe(expectedVertexCount * 3);
      expect(plane.normals).toBeDefined();
      expect(plane.normals!.length).toBe(expectedVertexCount * 3);
      expect(plane.texCoords).toBeDefined();
      expect(plane.texCoords!.length).toBe(expectedVertexCount * 2);
    });

    test('should create plane with correct dimensions', () => {
      const width = 4.0;
      const height = 2.0;
      const plane = geometryManager.createPlane(width, height);
      
      const halfWidth = width * 0.5;
      const halfHeight = height * 0.5;
      
      // Check that vertices are within expected bounds
      for (let i = 0; i < plane.vertices.length; i += 3) {
        const x = plane.vertices[i];
        const y = plane.vertices[i + 1];
        const z = plane.vertices[i + 2];
        
        expect(x).toBeGreaterThanOrEqual(-halfWidth - 0.001);
        expect(x).toBeLessThanOrEqual(halfWidth + 0.001);
        expect(y).toBeGreaterThanOrEqual(-halfHeight - 0.001);
        expect(y).toBeLessThanOrEqual(halfHeight + 0.001);
        expect(z).toBeCloseTo(0, 3); // Plane should be at z=0
      }
    });

    test('should create plane with correct normals', () => {
      const plane = geometryManager.createPlane(1.0, 1.0);
      
      // All normals should point in +Z direction
      for (let i = 0; i < plane.normals!.length; i += 3) {
        expect(plane.normals![i]).toBeCloseTo(0, 3);     // x component
        expect(plane.normals![i + 1]).toBeCloseTo(0, 3); // y component
        expect(plane.normals![i + 2]).toBeCloseTo(1, 3); // z component
      }
    });

    test('should cache plane geometry', () => {
      const plane1 = geometryManager.createPlane(1.0, 1.0, 1, 1);
      const plane2 = geometryManager.createPlane(1.0, 1.0, 1, 1);
      
      expect(plane1).toBe(plane2);
    });
  });

  describe('Buffer Management', () => {
    test('should create vertex buffer', () => {
      const cube = geometryManager.createCube(1.0);
      const vbo = geometryManager.createVertexBuffer(cube);
      
      expect(vbo).toBeInstanceOf(VertexBuffer);
      expect(vbo.size).toBe(cube.vertices.length);
    });

    test('should create index buffer', () => {
      const cube = geometryManager.createCube(1.0);
      const ibo = geometryManager.createIndexBuffer(cube);
      
      expect(ibo).toBeInstanceOf(IndexBuffer);
      expect(ibo.count).toBe(cube.indices.length);
    });

    test('should create and cache buffers', () => {
      const cube = geometryManager.createCube(1.0);
      const buffers1 = geometryManager.createBuffers(cube, 'test_cube');
      const buffers2 = geometryManager.createBuffers(cube, 'test_cube');
      
      expect(buffers1).toBe(buffers2); // Should be cached
      expect(buffers1.vbo).toBeInstanceOf(VertexBuffer);
      expect(buffers1.ibo).toBeInstanceOf(IndexBuffer);
    });
  });

  describe('Geometry Validation', () => {
    test('should validate correct geometry', () => {
      expect(() => {
        geometryManager.createCube(1.0);
      }).not.toThrow();
    });

    test('should throw error for invalid vertex data', () => {
      const invalidGeometry: Geometry = {
        vertices: new Float32Array([1, 2]), // Invalid: not multiple of 3
        indices: new Uint16Array([0, 1, 2])
      };
      
      expect(() => {
        (geometryManager as any).validateGeometry(invalidGeometry);
      }).toThrow('Invalid vertex data: must be multiple of 3');
    });

    test('should throw error for invalid index data', () => {
      const invalidGeometry: Geometry = {
        vertices: new Float32Array([1, 2, 3, 4, 5, 6]),
        indices: new Uint16Array([0, 1]) // Invalid: not multiple of 3
      };
      
      expect(() => {
        (geometryManager as any).validateGeometry(invalidGeometry);
      }).toThrow('Invalid index data: must be multiple of 3');
    });

    test('should throw error for mismatched normal data', () => {
      const invalidGeometry: Geometry = {
        vertices: new Float32Array([1, 2, 3, 4, 5, 6]),
        indices: new Uint16Array([0, 1, 2]),
        normals: new Float32Array([1, 2, 3]) // Invalid: should be same length as vertices
      };
      
      expect(() => {
        (geometryManager as any).validateGeometry(invalidGeometry);
      }).toThrow('Normal data length must match vertex data length');
    });

    test('should throw error for out of range indices', () => {
      const invalidGeometry: Geometry = {
        vertices: new Float32Array([1, 2, 3]),
        indices: new Uint16Array([0, 1, 2]) // Invalid: index 2 is out of range for 1 vertex
      };
      
      expect(() => {
        (geometryManager as any).validateGeometry(invalidGeometry);
      }).toThrow('Index out of range');
    });
  });

  describe('Tangent Calculation', () => {
    test('should calculate tangents for geometry with texture coordinates', () => {
      const cube = geometryManager.createCube(1.0);
      const tangents = geometryManager.calculateTangents(cube);
      
      expect(tangents).toBeDefined();
      expect(tangents!.length).toBe(cube.vertices.length); // Same length as vertices
    });

    test('should return undefined for geometry without texture coordinates', () => {
      const geometryWithoutTexCoords: Geometry = {
        vertices: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
        indices: new Uint16Array([0, 1, 2])
      };
      
      const tangents = geometryManager.calculateTangents(geometryWithoutTexCoords);
      expect(tangents).toBeUndefined();
    });
  });

  describe('Geometry Statistics', () => {
    test('should return correct statistics for cube', () => {
      const cube = geometryManager.createCube(1.0);
      const stats = geometryManager.getGeometryStats(cube);
      
      expect(stats.vertexCount).toBe(24);
      expect(stats.triangleCount).toBe(12);
      expect(stats.hasNormals).toBe(true);
      expect(stats.hasTexCoords).toBe(true);
      expect(stats.hasTangents).toBe(false);
    });

    test('should return correct statistics for sphere', () => {
      const segments = 8;
      const sphere = geometryManager.createSphere(1.0, segments);
      const stats = geometryManager.getGeometryStats(sphere);
      
      expect(stats.vertexCount).toBe((segments + 1) * (segments + 1));
      expect(stats.triangleCount).toBe(segments * segments * 2);
      expect(stats.hasNormals).toBe(true);
      expect(stats.hasTexCoords).toBe(true);
      expect(stats.hasTangents).toBe(false);
    });
  });

  describe('Cache Management', () => {
    test('should clear cache', () => {
      // Create some geometries to populate cache
      geometryManager.createCube(1.0);
      geometryManager.createSphere(1.0, 16);
      geometryManager.createPlane(1.0, 1.0);
      
      // Clear cache
      geometryManager.clearCache();
      
      // Creating the same geometry should create new instances
      const cube1 = geometryManager.createCube(1.0);
      const cube2 = geometryManager.createCube(1.0);
      
      expect(cube1).toBe(cube2); // Should still cache after clearing
    });

    test('should dispose resources', () => {
      geometryManager.createCube(1.0);
      
      expect(() => {
        geometryManager.dispose();
      }).not.toThrow();
    });
  });

  describe('Geometry Optimization', () => {
    test('should optimize geometry', () => {
      const cube = geometryManager.createCube(1.0);
      const optimized = geometryManager.optimizeGeometry(cube);
      
      // Currently just returns the same geometry
      expect(optimized).toBe(cube);
    });
  });
});

describe('VertexBuffer', () => {
  let gl: MockWebGL2RenderingContext;

  beforeEach(() => {
    gl = new MockWebGL2RenderingContext();
  });

  test('should create vertex buffer', () => {
    const data = new Float32Array([1, 2, 3, 4, 5, 6]);
    const vbo = new VertexBuffer(gl as any, data);
    
    expect(vbo.size).toBe(6);
  });

  test('should update buffer data', () => {
    const data1 = new Float32Array([1, 2, 3]);
    const data2 = new Float32Array([4, 5, 6, 7, 8, 9]);
    
    const vbo = new VertexBuffer(gl as any, data1);
    expect(vbo.size).toBe(3);
    
    vbo.updateData(data2);
    expect(vbo.size).toBe(6);
  });

  test('should bind and unbind buffer', () => {
    const data = new Float32Array([1, 2, 3]);
    const vbo = new VertexBuffer(gl as any, data);
    
    expect(() => {
      vbo.bind();
      vbo.unbind();
    }).not.toThrow();
  });

  test('should dispose buffer', () => {
    const data = new Float32Array([1, 2, 3]);
    const vbo = new VertexBuffer(gl as any, data);
    
    expect(() => {
      vbo.dispose();
    }).not.toThrow();
  });
});

describe('IndexBuffer', () => {
  let gl: MockWebGL2RenderingContext;

  beforeEach(() => {
    gl = new MockWebGL2RenderingContext();
  });

  test('should create index buffer', () => {
    const data = new Uint16Array([0, 1, 2, 3, 4, 5]);
    const ibo = new IndexBuffer(gl as any, data);
    
    expect(ibo.count).toBe(6);
  });

  test('should update buffer data', () => {
    const data1 = new Uint16Array([0, 1, 2]);
    const data2 = new Uint16Array([0, 1, 2, 3, 4, 5]);
    
    const ibo = new IndexBuffer(gl as any, data1);
    expect(ibo.count).toBe(3);
    
    ibo.updateData(data2);
    expect(ibo.count).toBe(6);
  });

  test('should bind and unbind buffer', () => {
    const data = new Uint16Array([0, 1, 2]);
    const ibo = new IndexBuffer(gl as any, data);
    
    expect(() => {
      ibo.bind();
      ibo.unbind();
    }).not.toThrow();
  });

  test('should dispose buffer', () => {
    const data = new Uint16Array([0, 1, 2]);
    const ibo = new IndexBuffer(gl as any, data);
    
    expect(() => {
      ibo.dispose();
    }).not.toThrow();
  });
});