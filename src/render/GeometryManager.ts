import { Vec3 } from '../math';

/**
 * 几何体数据接口
 */
export interface Geometry {
  vertices: Float32Array;
  indices: Uint16Array;
  normals?: Float32Array;
  texCoords?: Float32Array;
  tangents?: Float32Array;
}

/**
 * 顶点缓冲区对象包装类
 */
export class VertexBuffer {
  private buffer: WebGLBuffer | null = null;
  private gl: WebGL2RenderingContext;
  private data: Float32Array;
  private usage: number;

  constructor(gl: WebGL2RenderingContext, data: Float32Array, usage: number = gl.STATIC_DRAW) {
    this.gl = gl;
    this.data = data;
    this.usage = usage;
    this.createBuffer();
  }

  private createBuffer(): void {
    this.buffer = this.gl.createBuffer();
    if (!this.buffer) {
      throw new Error('Failed to create vertex buffer');
    }
    
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.data, this.usage);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
  }

  bind(): void {
    if (this.buffer) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    }
  }

  unbind(): void {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
  }

  updateData(data: Float32Array): void {
    this.data = data;
    if (this.buffer) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, this.data, this.usage);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }
  }

  dispose(): void {
    if (this.buffer) {
      this.gl.deleteBuffer(this.buffer);
      this.buffer = null;
    }
  }

  get size(): number {
    return this.data.length;
  }
}

/**
 * 索引缓冲区对象包装类
 */
export class IndexBuffer {
  private buffer: WebGLBuffer | null = null;
  private gl: WebGL2RenderingContext;
  private data: Uint16Array;
  private usage: number;

  constructor(gl: WebGL2RenderingContext, data: Uint16Array, usage: number = gl.STATIC_DRAW) {
    this.gl = gl;
    this.data = data;
    this.usage = usage;
    this.createBuffer();
  }

  private createBuffer(): void {
    this.buffer = this.gl.createBuffer();
    if (!this.buffer) {
      throw new Error('Failed to create index buffer');
    }
    
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.data, this.usage);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
  }

  bind(): void {
    if (this.buffer) {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffer);
    }
  }

  unbind(): void {
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
  }

  updateData(data: Uint16Array): void {
    this.data = data;
    if (this.buffer) {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffer);
      this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.data, this.usage);
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
    }
  }

  dispose(): void {
    if (this.buffer) {
      this.gl.deleteBuffer(this.buffer);
      this.buffer = null;
    }
  }

  get count(): number {
    return this.data.length;
  }
}

/**
 * 几何体管理器类
 */
export class GeometryManager {
  private gl: WebGL2RenderingContext;
  private geometryCache = new Map<string, Geometry>();
  private bufferCache = new Map<string, { vbo: VertexBuffer; ibo: IndexBuffer }>();

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
  }

  /**
   * 创建立方体几何体
   */
  createCube(size: number = 1.0): Geometry {
    const cacheKey = `cube_${size}`;
    
    if (this.geometryCache.has(cacheKey)) {
      return this.geometryCache.get(cacheKey)!;
    }

    const halfSize = size * 0.5;
    
    // 立方体顶点数据 (位置)
    const vertices = new Float32Array([
      // 前面
      -halfSize, -halfSize,  halfSize,
       halfSize, -halfSize,  halfSize,
       halfSize,  halfSize,  halfSize,
      -halfSize,  halfSize,  halfSize,
      
      // 后面
      -halfSize, -halfSize, -halfSize,
      -halfSize,  halfSize, -halfSize,
       halfSize,  halfSize, -halfSize,
       halfSize, -halfSize, -halfSize,
      
      // 上面
      -halfSize,  halfSize, -halfSize,
      -halfSize,  halfSize,  halfSize,
       halfSize,  halfSize,  halfSize,
       halfSize,  halfSize, -halfSize,
      
      // 下面
      -halfSize, -halfSize, -halfSize,
       halfSize, -halfSize, -halfSize,
       halfSize, -halfSize,  halfSize,
      -halfSize, -halfSize,  halfSize,
      
      // 右面
       halfSize, -halfSize, -halfSize,
       halfSize,  halfSize, -halfSize,
       halfSize,  halfSize,  halfSize,
       halfSize, -halfSize,  halfSize,
      
      // 左面
      -halfSize, -halfSize, -halfSize,
      -halfSize, -halfSize,  halfSize,
      -halfSize,  halfSize,  halfSize,
      -halfSize,  halfSize, -halfSize
    ]);

    // 立方体索引数据
    const indices = new Uint16Array([
      0,  1,  2,    0,  2,  3,    // 前面
      4,  5,  6,    4,  6,  7,    // 后面
      8,  9,  10,   8,  10, 11,   // 上面
      12, 13, 14,   12, 14, 15,   // 下面
      16, 17, 18,   16, 18, 19,   // 右面
      20, 21, 22,   20, 22, 23    // 左面
    ]);

    // 法线数据
    const normals = new Float32Array([
      // 前面
      0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1,
      // 后面
      0, 0, -1,  0, 0, -1,  0, 0, -1,  0, 0, -1,
      // 上面
      0, 1, 0,   0, 1, 0,   0, 1, 0,   0, 1, 0,
      // 下面
      0, -1, 0,  0, -1, 0,  0, -1, 0,  0, -1, 0,
      // 右面
      1, 0, 0,   1, 0, 0,   1, 0, 0,   1, 0, 0,
      // 左面
      -1, 0, 0,  -1, 0, 0,  -1, 0, 0,  -1, 0, 0
    ]);

    // 纹理坐标
    const texCoords = new Float32Array([
      // 前面
      0, 0,  1, 0,  1, 1,  0, 1,
      // 后面
      1, 0,  1, 1,  0, 1,  0, 0,
      // 上面
      0, 1,  0, 0,  1, 0,  1, 1,
      // 下面
      1, 1,  0, 1,  0, 0,  1, 0,
      // 右面
      1, 0,  1, 1,  0, 1,  0, 0,
      // 左面
      0, 0,  1, 0,  1, 1,  0, 1
    ]);

    const geometry: Geometry = {
      vertices,
      indices,
      normals,
      texCoords
    };

    // 验证几何体数据
    this.validateGeometry(geometry);
    
    // 缓存几何体
    this.geometryCache.set(cacheKey, geometry);
    
    return geometry;
  }

  /**
   * 创建球体几何体
   */
  createSphere(radius: number = 1.0, segments: number = 32): Geometry {
    const cacheKey = `sphere_${radius}_${segments}`;
    
    if (this.geometryCache.has(cacheKey)) {
      return this.geometryCache.get(cacheKey)!;
    }

    const vertices: number[] = [];
    const indices: number[] = [];
    const normals: number[] = [];
    const texCoords: number[] = [];

    // 生成球体顶点
    for (let lat = 0; lat <= segments; lat++) {
      const theta = (lat * Math.PI) / segments;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      for (let lon = 0; lon <= segments; lon++) {
        const phi = (lon * 2 * Math.PI) / segments;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        const x = cosPhi * sinTheta;
        const y = cosTheta;
        const z = sinPhi * sinTheta;

        // 顶点位置
        vertices.push(radius * x, radius * y, radius * z);
        
        // 法线 (对于球体，法线就是归一化的位置向量)
        normals.push(x, y, z);
        
        // 纹理坐标
        const u = 1 - (lon / segments);
        const v = 1 - (lat / segments);
        texCoords.push(u, v);
      }
    }

    // 生成球体索引
    for (let lat = 0; lat < segments; lat++) {
      for (let lon = 0; lon < segments; lon++) {
        const first = lat * (segments + 1) + lon;
        const second = first + segments + 1;

        // 第一个三角形
        indices.push(first, second, first + 1);
        // 第二个三角形
        indices.push(second, second + 1, first + 1);
      }
    }

    const geometry: Geometry = {
      vertices: new Float32Array(vertices),
      indices: new Uint16Array(indices),
      normals: new Float32Array(normals),
      texCoords: new Float32Array(texCoords)
    };

    // 验证几何体数据
    this.validateGeometry(geometry);
    
    // 缓存几何体
    this.geometryCache.set(cacheKey, geometry);
    
    return geometry;
  }

  /**
   * 创建平面几何体
   */
  createPlane(width: number = 1.0, height: number = 1.0, widthSegments: number = 1, heightSegments: number = 1): Geometry {
    const cacheKey = `plane_${width}_${height}_${widthSegments}_${heightSegments}`;
    
    if (this.geometryCache.has(cacheKey)) {
      return this.geometryCache.get(cacheKey)!;
    }

    const vertices: number[] = [];
    const indices: number[] = [];
    const normals: number[] = [];
    const texCoords: number[] = [];

    const halfWidth = width * 0.5;
    const halfHeight = height * 0.5;

    // 生成平面顶点
    for (let iy = 0; iy <= heightSegments; iy++) {
      const y = -halfHeight + (iy / heightSegments) * height;
      const v = iy / heightSegments;

      for (let ix = 0; ix <= widthSegments; ix++) {
        const x = -halfWidth + (ix / widthSegments) * width;
        const u = ix / widthSegments;

        // 顶点位置 (平面在XY平面上，Z=0)
        vertices.push(x, y, 0);
        
        // 法线 (平面法线指向Z轴正方向)
        normals.push(0, 0, 1);
        
        // 纹理坐标
        texCoords.push(u, v);
      }
    }

    // 生成平面索引
    for (let iy = 0; iy < heightSegments; iy++) {
      for (let ix = 0; ix < widthSegments; ix++) {
        const a = ix + (widthSegments + 1) * iy;
        const b = ix + (widthSegments + 1) * (iy + 1);
        const c = (ix + 1) + (widthSegments + 1) * (iy + 1);
        const d = (ix + 1) + (widthSegments + 1) * iy;

        // 第一个三角形
        indices.push(a, b, d);
        // 第二个三角形
        indices.push(b, c, d);
      }
    }

    const geometry: Geometry = {
      vertices: new Float32Array(vertices),
      indices: new Uint16Array(indices),
      normals: new Float32Array(normals),
      texCoords: new Float32Array(texCoords)
    };

    // 验证几何体数据
    this.validateGeometry(geometry);
    
    // 缓存几何体
    this.geometryCache.set(cacheKey, geometry);
    
    return geometry;
  }

  /**
   * 创建顶点缓冲区对象
   */
  createVertexBuffer(geometry: Geometry): VertexBuffer {
    return new VertexBuffer(this.gl, geometry.vertices);
  }

  /**
   * 创建索引缓冲区对象
   */
  createIndexBuffer(geometry: Geometry): IndexBuffer {
    return new IndexBuffer(this.gl, geometry.indices);
  }

  /**
   * 创建并缓存缓冲区对象
   */
  createBuffers(geometry: Geometry, cacheKey?: string): { vbo: VertexBuffer; ibo: IndexBuffer } {
    const key = cacheKey || `buffer_${Date.now()}_${Math.random()}`;
    
    if (this.bufferCache.has(key)) {
      return this.bufferCache.get(key)!;
    }

    const vbo = this.createVertexBuffer(geometry);
    const ibo = this.createIndexBuffer(geometry);
    
    const buffers = { vbo, ibo };
    this.bufferCache.set(key, buffers);
    
    return buffers;
  }

  /**
   * 验证几何体数据
   */
  private validateGeometry(geometry: Geometry): void {
    const { vertices, indices, normals, texCoords } = geometry;
    
    // 检查顶点数据
    if (vertices.length === 0 || vertices.length % 3 !== 0) {
      throw new Error('Invalid vertex data: must be multiple of 3');
    }
    
    // 检查索引数据
    if (indices.length === 0 || indices.length % 3 !== 0) {
      throw new Error('Invalid index data: must be multiple of 3');
    }
    
    const vertexCount = vertices.length / 3;
    
    // 检查法线数据
    if (normals && normals.length !== vertices.length) {
      throw new Error('Normal data length must match vertex data length');
    }
    
    // 检查纹理坐标数据
    if (texCoords && texCoords.length !== (vertexCount * 2)) {
      throw new Error('Texture coordinate data length must be 2/3 of vertex data length');
    }
    
    // 检查索引范围
    const maxIndex = Math.max(...indices);
    if (maxIndex >= vertexCount) {
      throw new Error(`Index out of range: ${maxIndex} >= ${vertexCount}`);
    }
    
    console.log(`Geometry validation passed: ${vertexCount} vertices, ${indices.length / 3} triangles`);
  }

  /**
   * 优化几何体数据
   */
  optimizeGeometry(geometry: Geometry): Geometry {
    // 这里可以实现各种优化算法，比如：
    // 1. 顶点去重
    // 2. 索引优化
    // 3. 法线重新计算
    // 4. 切线计算
    
    // 目前只是简单返回原始数据
    // 在实际项目中可以根据需要实现具体的优化算法
    return geometry;
  }

  /**
   * 计算几何体的切线向量
   */
  calculateTangents(geometry: Geometry): Float32Array | undefined {
    const { vertices, indices, texCoords } = geometry;
    
    if (!texCoords) {
      console.warn('Cannot calculate tangents without texture coordinates');
      return undefined;
    }
    
    const vertexCount = vertices.length / 3;
    const tangents = new Float32Array(vertexCount * 3);
    
    // 简化的切线计算
    for (let i = 0; i < indices.length; i += 3) {
      const i0 = indices[i] * 3;
      const i1 = indices[i + 1] * 3;
      const i2 = indices[i + 2] * 3;
      
      const v0 = new Vec3(vertices[i0], vertices[i0 + 1], vertices[i0 + 2]);
      const v1 = new Vec3(vertices[i1], vertices[i1 + 1], vertices[i1 + 2]);
      const v2 = new Vec3(vertices[i2], vertices[i2 + 1], vertices[i2 + 2]);
      
      const edge1 = v1.subtract(v0);
      const edge2 = v2.subtract(v0);
      
      // 简化的切线计算 (实际项目中需要更复杂的算法)
      // 使用第一条边作为切线方向，实际应该考虑纹理坐标
      const tangent = edge1.length() > 0 ? edge1.normalize() : edge2.normalize();
      
      tangents[i0] = tangent.x;
      tangents[i0 + 1] = tangent.y;
      tangents[i0 + 2] = tangent.z;
      
      tangents[i1] = tangent.x;
      tangents[i1 + 1] = tangent.y;
      tangents[i1 + 2] = tangent.z;
      
      tangents[i2] = tangent.x;
      tangents[i2 + 1] = tangent.y;
      tangents[i2 + 2] = tangent.z;
    }
    
    return tangents;
  }

  /**
   * 获取几何体统计信息
   */
  getGeometryStats(geometry: Geometry): {
    vertexCount: number;
    triangleCount: number;
    hasNormals: boolean;
    hasTexCoords: boolean;
    hasTangents: boolean;
  } {
    return {
      vertexCount: geometry.vertices.length / 3,
      triangleCount: geometry.indices.length / 3,
      hasNormals: !!geometry.normals,
      hasTexCoords: !!geometry.texCoords,
      hasTangents: !!geometry.tangents
    };
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    // 清理缓冲区缓存
    for (const buffers of this.bufferCache.values()) {
      buffers.vbo.dispose();
      buffers.ibo.dispose();
    }
    this.bufferCache.clear();
    
    // 清理几何体缓存
    this.geometryCache.clear();
    
    console.log('GeometryManager cache cleared');
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.clearCache();
  }
}