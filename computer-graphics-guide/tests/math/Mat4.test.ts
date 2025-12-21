import { describe, test, expect } from 'vitest';
import { Mat4 } from '../../src/math/Mat4';
import { Vec3 } from '../../src/math/Vec3';
import { Vec4 } from '../../src/math/Vec4';

describe('Mat4', () => {
  describe('构造函数和静态方法', () => {
    test('默认构造函数应该创建单位矩阵', () => {
      const m = new Mat4();
      const identity = Mat4.identity();
      expect(m.equals(identity)).toBe(true);
    });

    test('带数据的构造函数应该正确设置值', () => {
      const data = [
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 16
      ];
      const m = new Mat4(data);
      expect(m.get(0, 0)).toBe(1);
      expect(m.get(1, 0)).toBe(5);
      expect(m.get(3, 3)).toBe(16);
    });

    test('数据长度不正确应该抛出错误', () => {
      expect(() => new Mat4([1, 2, 3])).toThrow('Matrix data must have exactly 16 elements');
    });

    test('静态单位矩阵应该正确', () => {
      const identity = Mat4.identity();
      expect(identity.get(0, 0)).toBe(1);
      expect(identity.get(1, 1)).toBe(1);
      expect(identity.get(2, 2)).toBe(1);
      expect(identity.get(3, 3)).toBe(1);
      expect(identity.get(0, 1)).toBe(0);
    });

    test('静态零矩阵应该正确', () => {
      const zero = Mat4.zero();
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          expect(zero.get(i, j)).toBe(0);
        }
      }
    });
  });

  describe('变换矩阵', () => {
    test('平移矩阵应该正确', () => {
      const translation = Mat4.translation(1, 2, 3);
      expect(translation.get(0, 3)).toBe(1);
      expect(translation.get(1, 3)).toBe(2);
      expect(translation.get(2, 3)).toBe(3);
      expect(translation.get(3, 3)).toBe(1);
    });

    test('缩放矩阵应该正确', () => {
      const scale = Mat4.scale(2, 3, 4);
      expect(scale.get(0, 0)).toBe(2);
      expect(scale.get(1, 1)).toBe(3);
      expect(scale.get(2, 2)).toBe(4);
      expect(scale.get(3, 3)).toBe(1);
    });

    test('X轴旋转矩阵应该正确', () => {
      const rotation = Mat4.rotationX(Math.PI / 2);
      expect(rotation.get(0, 0)).toBeCloseTo(1);
      expect(rotation.get(1, 1)).toBeCloseTo(0, 6);
      expect(rotation.get(1, 2)).toBeCloseTo(-1, 6);
      expect(rotation.get(2, 1)).toBeCloseTo(1, 6);
      expect(rotation.get(2, 2)).toBeCloseTo(0, 6);
    });

    test('Y轴旋转矩阵应该正确', () => {
      const rotation = Mat4.rotationY(Math.PI / 2);
      expect(rotation.get(0, 0)).toBeCloseTo(0, 6);
      expect(rotation.get(0, 2)).toBeCloseTo(1, 6);
      expect(rotation.get(1, 1)).toBeCloseTo(1);
      expect(rotation.get(2, 0)).toBeCloseTo(-1, 6);
      expect(rotation.get(2, 2)).toBeCloseTo(0, 6);
    });

    test('Z轴旋转矩阵应该正确', () => {
      const rotation = Mat4.rotationZ(Math.PI / 2);
      expect(rotation.get(0, 0)).toBeCloseTo(0, 6);
      expect(rotation.get(0, 1)).toBeCloseTo(-1, 6);
      expect(rotation.get(1, 0)).toBeCloseTo(1, 6);
      expect(rotation.get(1, 1)).toBeCloseTo(0, 6);
      expect(rotation.get(2, 2)).toBeCloseTo(1);
    });

    test('任意轴旋转矩阵应该正确', () => {
      const axis = new Vec3(0, 0, 1);
      const rotation = Mat4.rotation(axis, Math.PI / 2);
      const zRotation = Mat4.rotationZ(Math.PI / 2);
      expect(rotation.equals(zRotation, 1e-6)).toBe(true);
    });
  });

  describe('投影矩阵', () => {
    test('透视投影矩阵应该正确', () => {
      const perspective = Mat4.perspective(Math.PI / 2, 1, 0.1, 100);
      expect(perspective.get(0, 0)).toBeCloseTo(1, 6);
      expect(perspective.get(1, 1)).toBeCloseTo(1, 6);
      expect(perspective.get(3, 2)).toBe(-1);
      expect(perspective.get(2, 3)).toBeCloseTo(-0.2002, 3);
    });

    test('正交投影矩阵应该正确', () => {
      const ortho = Mat4.orthographic(-1, 1, -1, 1, 0.1, 100);
      expect(ortho.get(0, 0)).toBeCloseTo(1, 6);
      expect(ortho.get(1, 1)).toBeCloseTo(1, 6);
      expect(ortho.get(2, 2)).toBeCloseTo(-0.02002, 4);
      expect(ortho.get(3, 3)).toBe(1);
    });
  });

  describe('视图矩阵', () => {
    test('lookAt矩阵应该正确', () => {
      const eye = new Vec3(0, 0, 1);
      const target = new Vec3(0, 0, 0);
      const up = new Vec3(0, 1, 0);
      const lookAt = Mat4.lookAt(eye, target, up);
      
      // 验证视图矩阵的基本属性
      expect(lookAt.get(2, 2)).toBeCloseTo(1, 6); // forward direction
      expect(lookAt.get(2, 3)).toBeCloseTo(-1, 6);  // eye position translation
    });
  });

  describe('矩阵运算', () => {
    test('矩阵乘法应该正确', () => {
      const m1 = Mat4.translation(1, 2, 3);
      const m2 = Mat4.scale(2, 3, 4);
      const result = m1.multiply(m2);
      
      // 平移 * 缩放 = 先缩放后平移
      expect(result.get(0, 0)).toBe(2);
      expect(result.get(1, 1)).toBe(3);
      expect(result.get(2, 2)).toBe(4);
      expect(result.get(0, 3)).toBe(1);
      expect(result.get(1, 3)).toBe(2);
      expect(result.get(2, 3)).toBe(3);
    });

    test('矩阵与向量相乘应该正确', () => {
      const translation = Mat4.translation(1, 2, 3);
      const vector = new Vec4(1, 1, 1, 1);
      const result = translation.multiplyVec4(vector);
      expect(result).toEqual(new Vec4(2, 3, 4, 1));
    });

    test('矩阵转置应该正确', () => {
      const m = new Mat4([
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 16
      ]);
      const transposed = m.transpose();
      expect(transposed.get(0, 1)).toBe(2);
      expect(transposed.get(1, 0)).toBe(5);
      expect(transposed.get(2, 3)).toBe(15);
      expect(transposed.get(3, 2)).toBe(12);
    });

    test('行列式计算应该正确', () => {
      const identity = Mat4.identity();
      expect(identity.determinant()).toBe(1);
      
      const scale = Mat4.scale(2, 3, 4);
      expect(scale.determinant()).toBe(24); // 2 * 3 * 4 * 1
    });

    test('矩阵求逆应该正确', () => {
      const translation = Mat4.translation(1, 2, 3);
      const inverse = translation.inverse();
      const product = translation.multiply(inverse);
      const identity = Mat4.identity();
      expect(product.equals(identity, 1e-6)).toBe(true);
    });

    test('不可逆矩阵应该抛出错误', () => {
      const singular = Mat4.zero();
      expect(() => singular.inverse()).toThrow('Matrix is not invertible');
    });
  });

  describe('矩阵元素访问', () => {
    test('get和set方法应该正确工作', () => {
      const m = Mat4.identity();
      m.set(1, 2, 5);
      expect(m.get(1, 2)).toBe(5);
    });

    test('getData应该返回原始数据', () => {
      const m = Mat4.identity();
      const data = m.getData();
      expect(data).toBeInstanceOf(Float32Array);
      expect(data.length).toBe(16);
      expect(data[0]).toBe(1);
      expect(data[5]).toBe(1);
    });
  });

  describe('其他操作', () => {
    test('相等性检查应该正确', () => {
      const m1 = Mat4.identity();
      const m2 = Mat4.identity();
      const m3 = Mat4.scale(1.0001, 1, 1);
      
      expect(m1.equals(m2)).toBe(true);
      expect(m1.equals(m3)).toBe(false);
      expect(m1.equals(m3, 0.001)).toBe(true);
    });

    test('克隆应该创建新的实例', () => {
      const m1 = Mat4.translation(1, 2, 3);
      const m2 = m1.clone();
      
      expect(m2.equals(m1)).toBe(true);
      expect(m2).not.toBe(m1);
    });

    test('转换为数组应该正确', () => {
      const m = Mat4.identity();
      const array = m.toArray();
      expect(array).toBeInstanceOf(Array);
      expect(array.length).toBe(16);
      expect(array[0]).toBe(1);
      expect(array[5]).toBe(1);
    });

    test('转换为字符串应该正确', () => {
      const m = Mat4.identity();
      const str = m.toString();
      expect(str).toContain('Mat4');
      expect(str).toContain('1.000');
      expect(str).toContain('0.000');
    });
  });

  describe('复合变换', () => {
    test('TRS变换应该正确', () => {
      // 创建一个复合变换：先缩放，再旋转，最后平移
      const scale = Mat4.scale(2, 2, 2);
      const rotation = Mat4.rotationZ(Math.PI / 4);
      const translation = Mat4.translation(1, 1, 0);
      
      const trs = translation.multiply(rotation).multiply(scale);
      
      // 测试一个点的变换
      const point = new Vec4(1, 0, 0, 1);
      const transformed = trs.multiplyVec4(point);
      
      // 预期结果：(1,0,0) -> 缩放到(2,0,0) -> 旋转45度到(√2,√2,0) -> 平移到(1+√2,1+√2,0)
      const sqrt2 = Math.sqrt(2);
      expect(transformed.x).toBeCloseTo(1 + sqrt2, 6);
      expect(transformed.y).toBeCloseTo(1 + sqrt2, 6);
      expect(transformed.z).toBeCloseTo(0, 6);
      expect(transformed.w).toBeCloseTo(1, 6);
    });
  });
});