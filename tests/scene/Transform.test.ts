import { Transform } from '../../src/scene/Transform';
import { Vec3, Mat4 } from '../../src/math';

describe('Transform', () => {
  let transform: Transform;

  beforeEach(() => {
    transform = new Transform();
  });

  describe('Construction', () => {
    test('should create transform with default values', () => {
      expect(transform.position).toEqual(Vec3.zero());
      expect(transform.rotation).toEqual(Vec3.zero());
      expect(transform.scale).toEqual(Vec3.one());
    });

    test('should create transform with custom values', () => {
      const position = new Vec3(1, 2, 3);
      const rotation = new Vec3(0.1, 0.2, 0.3);
      const scale = new Vec3(2, 2, 2);

      const customTransform = new Transform(position, rotation, scale);

      expect(customTransform.position).toEqual(position);
      expect(customTransform.rotation).toEqual(rotation);
      expect(customTransform.scale).toEqual(scale);
    });
  });

  describe('Property Access', () => {
    test('should set and get position', () => {
      const newPosition = new Vec3(5, 10, 15);
      transform.position = newPosition;
      expect(transform.position).toEqual(newPosition);
    });

    test('should set and get rotation', () => {
      const newRotation = new Vec3(Math.PI / 4, Math.PI / 2, Math.PI);
      transform.rotation = newRotation;
      expect(transform.rotation).toEqual(newRotation);
    });

    test('should set and get scale', () => {
      const newScale = new Vec3(0.5, 2, 1.5);
      transform.scale = newScale;
      expect(transform.scale).toEqual(newScale);
    });
  });

  describe('Transform Operations', () => {
    test('should translate correctly', () => {
      const initialPosition = new Vec3(1, 2, 3);
      const delta = new Vec3(4, 5, 6);
      
      transform.position = initialPosition;
      transform.translate(delta);
      
      expect(transform.position).toEqual(new Vec3(5, 7, 9));
    });

    test('should rotate correctly', () => {
      const initialRotation = new Vec3(0.1, 0.2, 0.3);
      const delta = new Vec3(0.4, 0.5, 0.6);
      
      transform.rotation = initialRotation;
      transform.rotate(delta);
      
      expect(transform.rotation.equals(new Vec3(0.5, 0.7, 0.9), 1e-10)).toBe(true);
    });

    test('should scale correctly', () => {
      const initialScale = new Vec3(2, 3, 4);
      const factor = new Vec3(0.5, 2, 1.5);
      
      transform.scale = initialScale;
      transform.scaleBy(factor);
      
      expect(transform.scale).toEqual(new Vec3(1, 6, 6));
    });
  });

  describe('Matrix Generation', () => {
    test('should generate identity matrix for default transform', () => {
      const matrix = transform.getMatrix();
      const identity = Mat4.identity();
      
      expect(matrix.equals(identity)).toBe(true);
    });

    test('should generate translation matrix', () => {
      const position = new Vec3(5, 10, 15);
      transform.position = position;
      
      const matrix = transform.getMatrix();
      const expectedMatrix = Mat4.translation(5, 10, 15);
      
      expect(matrix.equals(expectedMatrix)).toBe(true);
    });

    test('should generate scale matrix', () => {
      const scale = new Vec3(2, 3, 4);
      transform.scale = scale;
      
      const matrix = transform.getMatrix();
      const expectedMatrix = Mat4.scale(2, 3, 4);
      
      expect(matrix.equals(expectedMatrix)).toBe(true);
    });

    test('should generate rotation matrix', () => {
      const rotation = new Vec3(Math.PI / 2, 0, 0); // 90 degrees around X-axis
      transform.rotation = rotation;
      
      const matrix = transform.getMatrix();
      const expectedMatrix = Mat4.rotationX(Math.PI / 2);
      
      expect(matrix.equals(expectedMatrix, 1e-5)).toBe(true);
    });

    test('should combine transformations in correct order (TRS)', () => {
      const position = new Vec3(1, 2, 3);
      const rotation = new Vec3(0, Math.PI / 4, 0); // 45 degrees around Y-axis
      const scale = new Vec3(2, 2, 2);
      
      transform.position = position;
      transform.rotation = rotation;
      transform.scale = scale;
      
      const matrix = transform.getMatrix();
      
      // Expected: Translation * Rotation * Scale
      const scaleMatrix = Mat4.scale(2, 2, 2);
      const rotationMatrix = Mat4.rotationY(Math.PI / 4);
      const translationMatrix = Mat4.translation(1, 2, 3);
      const expectedMatrix = translationMatrix.multiply(rotationMatrix).multiply(scaleMatrix);
      
      expect(matrix.equals(expectedMatrix, 1e-5)).toBe(true);
    });
  });

  describe('Direction Vectors', () => {
    test('should get correct forward vector for default transform', () => {
      const forward = transform.getForward();
      expect(forward.equals(new Vec3(0, 0, -1), 1e-5)).toBe(true);
    });

    test('should get correct right vector for default transform', () => {
      const right = transform.getRight();
      expect(right.equals(new Vec3(1, 0, 0), 1e-5)).toBe(true);
    });

    test('should get correct up vector for default transform', () => {
      const up = transform.getUp();
      expect(up.equals(new Vec3(0, 1, 0), 1e-5)).toBe(true);
    });

    test('should get correct forward vector after Y rotation', () => {
      transform.rotation = new Vec3(0, Math.PI / 2, 0); // 90 degrees around Y-axis
      const forward = transform.getForward();
      // After 90 degree Y rotation, forward should point to positive X
      expect(forward.equals(new Vec3(-1, 0, 0), 1e-5)).toBe(true);
    });
  });

  describe('Matrix Decomposition', () => {
    test('should decompose translation matrix correctly', () => {
      const originalPosition = new Vec3(5, 10, 15);
      const matrix = Mat4.translation(5, 10, 15);
      
      transform.setFromMatrix(matrix);
      
      expect(transform.position.equals(originalPosition, 1e-5)).toBe(true);
      expect(transform.rotation.equals(Vec3.zero(), 1e-5)).toBe(true);
      expect(transform.scale.equals(Vec3.one(), 1e-5)).toBe(true);
    });

    test('should decompose scale matrix correctly', () => {
      const originalScale = new Vec3(2, 3, 4);
      const matrix = Mat4.scale(2, 3, 4);
      
      transform.setFromMatrix(matrix);
      
      expect(transform.position.equals(Vec3.zero(), 1e-5)).toBe(true);
      expect(transform.rotation.equals(Vec3.zero(), 1e-5)).toBe(true);
      expect(transform.scale.equals(originalScale, 1e-5)).toBe(true);
    });
  });

  describe('Utility Methods', () => {
    test('should clone transform correctly', () => {
      const position = new Vec3(1, 2, 3);
      const rotation = new Vec3(0.1, 0.2, 0.3);
      const scale = new Vec3(2, 2, 2);
      
      transform.position = position;
      transform.rotation = rotation;
      transform.scale = scale;
      
      const cloned = transform.clone();
      
      expect(cloned.position).toEqual(position);
      expect(cloned.rotation).toEqual(rotation);
      expect(cloned.scale).toEqual(scale);
      
      // Ensure it's a deep copy
      cloned.position = new Vec3(10, 20, 30);
      expect(transform.position).toEqual(position);
    });

    test('should reset transform to default values', () => {
      transform.position = new Vec3(1, 2, 3);
      transform.rotation = new Vec3(0.1, 0.2, 0.3);
      transform.scale = new Vec3(2, 2, 2);
      
      transform.reset();
      
      expect(transform.position).toEqual(Vec3.zero());
      expect(transform.rotation).toEqual(Vec3.zero());
      expect(transform.scale).toEqual(Vec3.one());
    });

    test('should convert to string correctly', () => {
      const position = new Vec3(1, 2, 3);
      const rotation = new Vec3(0.1, 0.2, 0.3);
      const scale = new Vec3(2, 2, 2);
      
      transform.position = position;
      transform.rotation = rotation;
      transform.scale = scale;
      
      const str = transform.toString();
      expect(str).toContain('Transform');
      expect(str).toContain('pos:');
      expect(str).toContain('rot:');
      expect(str).toContain('scale:');
    });
  });

  describe('Matrix Caching', () => {
    test('should cache matrix when no changes are made', () => {
      const matrix1 = transform.getMatrix();
      const matrix2 = transform.getMatrix();
      
      // Should return the same cached matrix
      expect(matrix1.equals(matrix2)).toBe(true);
    });

    test('should invalidate cache when transform changes', () => {
      const matrix1 = transform.getMatrix();
      
      transform.position = new Vec3(1, 2, 3);
      const matrix2 = transform.getMatrix();
      
      // Should return different matrices
      expect(matrix1.equals(matrix2)).toBe(false);
    });
  });
});