import { describe, test, expect } from 'vitest';
import { Vec4 } from '../../src/math/Vec4';

describe('Vec4', () => {
  describe('构造函数和静态方法', () => {
    test('默认构造函数应该创建正确的向量', () => {
      const v = new Vec4();
      expect(v.x).toBe(0);
      expect(v.y).toBe(0);
      expect(v.z).toBe(0);
      expect(v.w).toBe(1);
    });

    test('带参数的构造函数应该正确设置值', () => {
      const v = new Vec4(1, 2, 3, 4);
      expect(v.x).toBe(1);
      expect(v.y).toBe(2);
      expect(v.z).toBe(3);
      expect(v.w).toBe(4);
    });

    test('静态方法应该创建正确的向量', () => {
      expect(Vec4.zero()).toEqual(new Vec4(0, 0, 0, 0));
      expect(Vec4.one()).toEqual(new Vec4(1, 1, 1, 1));
    });

    test('从Vec3创建Vec4应该正确', () => {
      const v3 = { x: 1, y: 2, z: 3 };
      const v4 = Vec4.fromVec3(v3);
      expect(v4).toEqual(new Vec4(1, 2, 3, 1));
      
      const v4WithW = Vec4.fromVec3(v3, 0.5);
      expect(v4WithW).toEqual(new Vec4(1, 2, 3, 0.5));
    });
  });

  describe('基础运算', () => {
    test('向量加法应该正确计算', () => {
      const v1 = new Vec4(1, 2, 3, 4);
      const v2 = new Vec4(5, 6, 7, 8);
      const result = v1.add(v2);
      expect(result).toEqual(new Vec4(6, 8, 10, 12));
    });

    test('向量减法应该正确计算', () => {
      const v1 = new Vec4(5, 6, 7, 8);
      const v2 = new Vec4(1, 2, 3, 4);
      const result = v1.subtract(v2);
      expect(result).toEqual(new Vec4(4, 4, 4, 4));
    });

    test('标量乘法应该正确计算', () => {
      const v = new Vec4(1, 2, 3, 4);
      const result = v.multiply(2);
      expect(result).toEqual(new Vec4(2, 4, 6, 8));
    });

    test('标量除法应该正确计算', () => {
      const v = new Vec4(2, 4, 6, 8);
      const result = v.divide(2);
      expect(result).toEqual(new Vec4(1, 2, 3, 4));
    });

    test('除以零应该抛出错误', () => {
      const v = new Vec4(1, 2, 3, 4);
      expect(() => v.divide(0)).toThrow('Division by zero');
    });
  });

  describe('点积', () => {
    test('点积应该正确计算', () => {
      const v1 = new Vec4(1, 2, 3, 4);
      const v2 = new Vec4(5, 6, 7, 8);
      const result = v1.dot(v2);
      expect(result).toBe(70); // 1*5 + 2*6 + 3*7 + 4*8 = 5 + 12 + 21 + 32 = 70
    });
  });

  describe('长度和归一化', () => {
    test('长度计算应该正确', () => {
      const v = new Vec4(1, 2, 2, 0);
      expect(v.length()).toBe(3);
    });

    test('长度平方计算应该正确', () => {
      const v = new Vec4(1, 2, 2, 0);
      expect(v.lengthSquared()).toBe(9);
    });

    test('归一化应该产生单位向量', () => {
      const v = new Vec4(1, 2, 2, 0);
      const normalized = v.normalize();
      expect(normalized.length()).toBeCloseTo(1.0, 6);
    });

    test('零向量归一化应该返回零向量', () => {
      const v = Vec4.zero();
      const normalized = v.normalize();
      expect(normalized).toEqual(Vec4.zero());
    });
  });

  describe('透视除法', () => {
    test('透视除法应该正确计算', () => {
      const v = new Vec4(2, 4, 6, 2);
      const result = v.perspectiveDivide();
      expect(result).toEqual(new Vec4(1, 2, 3, 1));
    });

    test('w为零时透视除法应该抛出错误', () => {
      const v = new Vec4(1, 2, 3, 0);
      expect(() => v.perspectiveDivide()).toThrow('Cannot perform perspective divide with w = 0');
    });
  });

  describe('线性插值', () => {
    test('线性插值应该正确计算', () => {
      const v1 = new Vec4(0, 0, 0, 0);
      const v2 = new Vec4(2, 4, 6, 8);
      const result = v1.lerp(v2, 0.5);
      expect(result).toEqual(new Vec4(1, 2, 3, 4));
    });

    test('线性插值边界值应该正确', () => {
      const v1 = new Vec4(1, 2, 3, 4);
      const v2 = new Vec4(5, 6, 7, 8);
      expect(v1.lerp(v2, 0)).toEqual(v1);
      expect(v1.lerp(v2, 1)).toEqual(v2);
    });
  });

  describe('其他操作', () => {
    test('向量取反应该正确', () => {
      const v = new Vec4(1, -2, 3, -4);
      const negated = v.negate();
      expect(negated).toEqual(new Vec4(-1, 2, -3, 4));
    });

    test('相等性检查应该正确', () => {
      const v1 = new Vec4(1, 2, 3, 4);
      const v2 = new Vec4(1, 2, 3, 4);
      const v3 = new Vec4(1, 2, 3, 4.0001);
      
      expect(v1.equals(v2)).toBe(true);
      expect(v1.equals(v3)).toBe(false);
      expect(v1.equals(v3, 0.001)).toBe(true);
    });

    test('克隆应该创建新的实例', () => {
      const v1 = new Vec4(1, 2, 3, 4);
      const v2 = v1.clone();
      
      expect(v2).toEqual(v1);
      expect(v2).not.toBe(v1);
    });

    test('转换为数组应该正确', () => {
      const v = new Vec4(1, 2, 3, 4);
      expect(v.toArray()).toEqual([1, 2, 3, 4]);
    });

    test('转换为字符串应该正确', () => {
      const v = new Vec4(1, 2, 3, 4);
      expect(v.toString()).toBe('Vec4(1, 2, 3, 4)');
    });
  });
});