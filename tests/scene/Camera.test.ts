import { PerspectiveCamera, OrthographicCamera, Vec2 } from '../../src/scene/Camera';
import { Vec3, Mat4 } from '../../src/math';

describe('Camera System', () => {
    describe('PerspectiveCamera', () => {
        let camera: PerspectiveCamera;

        beforeEach(() => {
            camera = new PerspectiveCamera();
        });

        describe('Construction', () => {
            test('should create camera with default values', () => {
                expect(camera.fov).toBeCloseTo(Math.PI / 4);
                expect(camera.aspect).toBe(1.0);
                expect(camera.near).toBe(0.1);
                expect(camera.far).toBe(1000.0);
                expect(camera.position).toEqual(new Vec3(0, 0, 5));
                expect(camera.target).toEqual(Vec3.zero());
                expect(camera.up).toEqual(Vec3.up());
            });

            test('should create camera with custom values', () => {
                const customCamera = new PerspectiveCamera(
                    Math.PI / 3, // 60 degrees
                    16 / 9, // 16:9 aspect ratio
                    0.01, // near
                    2000, // far
                    new Vec3(10, 5, 10), // position
                    new Vec3(0, 0, 0), // target
                    new Vec3(0, 1, 0) // up
                );

                expect(customCamera.fov).toBeCloseTo(Math.PI / 3);
                expect(customCamera.aspect).toBeCloseTo(16 / 9);
                expect(customCamera.near).toBe(0.01);
                expect(customCamera.far).toBe(2000);
                expect(customCamera.position).toEqual(new Vec3(10, 5, 10));
                expect(customCamera.target).toEqual(new Vec3(0, 0, 0));
                expect(customCamera.up).toEqual(new Vec3(0, 1, 0));
            });
        });

        describe('Matrix Generation', () => {
            test('should generate view matrix', () => {
                const viewMatrix = camera.getViewMatrix();
                expect(viewMatrix).toBeInstanceOf(Mat4);

                // 验证视图矩阵的基本属性
                const expectedMatrix = Mat4.lookAt(camera.position, camera.target, camera.up);
                expect(viewMatrix.equals(expectedMatrix, 1e-5)).toBe(true);
            });

            test('should generate projection matrix', () => {
                const projMatrix = camera.getProjectionMatrix();
                expect(projMatrix).toBeInstanceOf(Mat4);

                // 验证投影矩阵的基本属性
                const expectedMatrix = Mat4.perspective(camera.fov, camera.aspect, camera.near, camera.far);
                expect(projMatrix.equals(expectedMatrix, 1e-5)).toBe(true);
            });

            test('should cache matrices when unchanged', () => {
                const viewMatrix1 = camera.getViewMatrix();
                const viewMatrix2 = camera.getViewMatrix();
                const projMatrix1 = camera.getProjectionMatrix();
                const projMatrix2 = camera.getProjectionMatrix();

                expect(viewMatrix1.equals(viewMatrix2)).toBe(true);
                expect(projMatrix1.equals(projMatrix2)).toBe(true);
            });

            test('should invalidate view matrix cache when camera moves', () => {
                const viewMatrix1 = camera.getViewMatrix();

                camera.setPosition(new Vec3(1, 2, 3));
                const viewMatrix2 = camera.getViewMatrix();

                expect(viewMatrix1.equals(viewMatrix2)).toBe(false);
            });

            test('should invalidate projection matrix cache when parameters change', () => {
                const projMatrix1 = camera.getProjectionMatrix();

                camera.setFov(Math.PI / 3);
                const projMatrix2 = camera.getProjectionMatrix();

                expect(projMatrix1.equals(projMatrix2)).toBe(false);
            });
        });

        describe('Camera Properties', () => {
            test('should set and get position', () => {
                const newPosition = new Vec3(10, 20, 30);
                camera.setPosition(newPosition);
                expect(camera.position).toEqual(newPosition);
            });

            test('should set and get target', () => {
                const newTarget = new Vec3(5, 10, 15);
                camera.setTarget(newTarget);
                expect(camera.target).toEqual(newTarget);
            });

            test('should set and get up vector', () => {
                const newUp = new Vec3(0, 0, 1);
                camera.setUp(newUp);
                expect(camera.up).toEqual(newUp);
            });

            test('should set field of view', () => {
                const newFov = Math.PI / 3;
                camera.setFov(newFov);
                expect(camera.fov).toBe(newFov);
            });

            test('should set clipping planes', () => {
                camera.setClippingPlanes(0.01, 5000);
                expect(camera.near).toBe(0.01);
                expect(camera.far).toBe(5000);
            });

            test('should update aspect ratio', () => {
                const newAspect = 16 / 9;
                camera.updateAspectRatio(newAspect);
                expect(camera.aspect).toBeCloseTo(newAspect);
            });
        });

        describe('Direction Vectors', () => {
            test('should get correct forward vector', () => {
                const forward = camera.getForward();
                const expected = camera.target.subtract(camera.position).normalize();
                expect(forward.equals(expected, 1e-5)).toBe(true);
            });

            test('should get correct right vector', () => {
                const right = camera.getRight();
                const forward = camera.getForward();
                const expected = forward.cross(camera.up).normalize();
                expect(right.equals(expected, 1e-5)).toBe(true);
            });

            test('should get correct up vector', () => {
                const up = camera.getUp();
                const forward = camera.getForward();
                const right = camera.getRight();
                const expected = right.cross(forward).normalize();
                expect(up.equals(expected, 1e-5)).toBe(true);
            });
        });

        describe('Camera Operations', () => {
            test('should orbit around target', () => {
                const originalPosition = camera.position.clone();
                const originalDistance = camera.position.subtract(camera.target).length();

                camera.orbitAroundTarget(Math.PI / 4, 0); // 45 degrees azimuth

                const newDistance = camera.position.subtract(camera.target).length();
                expect(newDistance).toBeCloseTo(originalDistance, 1e-5);
                expect(camera.position.equals(originalPosition)).toBe(false);
            });

            test('should zoom in and out', () => {
                const originalDistance = camera.position.subtract(camera.target).length();

                camera.zoom(0.5); // Zoom in
                const newDistance = camera.position.subtract(camera.target).length();

                expect(newDistance).toBeCloseTo(originalDistance * 0.5, 1e-5);
            });

            test('should pan camera and target together', () => {
                const originalPosition = camera.position.clone();
                const originalTarget = camera.target.clone();

                camera.pan(1, 0); // Pan right

                const positionDelta = camera.position.subtract(originalPosition);
                const targetDelta = camera.target.subtract(originalTarget);

                expect(positionDelta.equals(targetDelta, 1e-5)).toBe(true);
            });
        });

        describe('Screen to World Conversion', () => {
            test('should convert screen coordinates to world direction', () => {
                const screenPos: Vec2 = { x: 0.5, y: 0.5 }; // Center of screen
                const worldDir = camera.screenToWorld(screenPos);

                expect(worldDir).toBeInstanceOf(Vec3);
                expect(worldDir.length()).toBeCloseTo(1.0, 1e-5); // Should be normalized
            });
        });

        describe('Camera Cloning', () => {
            test('should clone camera correctly', () => {
                camera.setPosition(new Vec3(1, 2, 3));
                camera.setTarget(new Vec3(4, 5, 6));
                camera.setFov(Math.PI / 3);

                const cloned = camera.clone();

                expect(cloned.position).toEqual(camera.position);
                expect(cloned.target).toEqual(camera.target);
                expect(cloned.up).toEqual(camera.up);
                expect(cloned.fov).toBe(camera.fov);
                expect(cloned.aspect).toBe(camera.aspect);
                expect(cloned.near).toBe(camera.near);
                expect(cloned.far).toBe(camera.far);

                // Ensure it's a deep copy
                cloned.setPosition(new Vec3(10, 20, 30));
                expect(camera.position).not.toEqual(cloned.position);
            });
        });
    });

    describe('OrthographicCamera', () => {
        let camera: OrthographicCamera;

        beforeEach(() => {
            camera = new OrthographicCamera();
        });

        describe('Construction', () => {
            test('should create camera with default values', () => {
                expect(camera.left).toBe(-5);
                expect(camera.right).toBe(5);
                expect(camera.bottom).toBe(-5);
                expect(camera.top).toBe(5);
                expect(camera.near).toBe(0.1);
                expect(camera.far).toBe(1000.0);
                expect(camera.position).toEqual(new Vec3(0, 0, 5));
                expect(camera.target).toEqual(Vec3.zero());
                expect(camera.up).toEqual(Vec3.up());
                expect(camera.aspect).toBe(1.0);
            });

            test('should create camera with custom values', () => {
                const customCamera = new OrthographicCamera(
                    -10, 10, -8, 8, // bounds
                    0.01, 2000, // near, far
                    new Vec3(10, 5, 10), // position
                    new Vec3(0, 0, 0), // target
                    new Vec3(0, 1, 0) // up
                );

                expect(customCamera.left).toBe(-10);
                expect(customCamera.right).toBe(10);
                expect(customCamera.bottom).toBe(-8);
                expect(customCamera.top).toBe(8);
                expect(customCamera.near).toBe(0.01);
                expect(customCamera.far).toBe(2000);
                expect(customCamera.position).toEqual(new Vec3(10, 5, 10));
                expect(customCamera.target).toEqual(new Vec3(0, 0, 0));
                expect(customCamera.up).toEqual(new Vec3(0, 1, 0));
            });
        });

        describe('Matrix Generation', () => {
            test('should generate view matrix', () => {
                const viewMatrix = camera.getViewMatrix();
                expect(viewMatrix).toBeInstanceOf(Mat4);

                const expectedMatrix = Mat4.lookAt(camera.position, camera.target, camera.up);
                expect(viewMatrix.equals(expectedMatrix, 1e-5)).toBe(true);
            });

            test('should generate projection matrix', () => {
                const projMatrix = camera.getProjectionMatrix();
                expect(projMatrix).toBeInstanceOf(Mat4);

                const expectedMatrix = Mat4.orthographic(
                    camera.left, camera.right, camera.bottom, camera.top, camera.near, camera.far
                );
                expect(projMatrix.equals(expectedMatrix, 1e-5)).toBe(true);
            });
        });

        describe('Orthographic Properties', () => {
            test('should set orthographic bounds', () => {
                camera.setOrthographicBounds(-20, 20, -15, 15);

                expect(camera.left).toBe(-20);
                expect(camera.right).toBe(20);
                expect(camera.bottom).toBe(-15);
                expect(camera.top).toBe(15);
                expect(camera.aspect).toBeCloseTo(40 / 30);
            });

            test('should update aspect ratio correctly', () => {
                const newAspect = 16 / 9;
                camera.updateAspectRatio(newAspect);

                expect(camera.aspect).toBeCloseTo(newAspect);

                // Height should remain the same, width should change
                const height = camera.top - camera.bottom;
                const width = camera.right - camera.left;
                expect(width / height).toBeCloseTo(newAspect, 1e-5);
            });
        });

        describe('Camera Operations', () => {
            test('should zoom orthographic projection', () => {
                const originalWidth = camera.right - camera.left;
                const originalHeight = camera.top - camera.bottom;

                camera.zoom(0.5); // Zoom in

                const newWidth = camera.right - camera.left;
                const newHeight = camera.top - camera.bottom;

                expect(newWidth).toBeCloseTo(originalWidth * 0.5, 1e-5);
                expect(newHeight).toBeCloseTo(originalHeight * 0.5, 1e-5);
            });

            test('should pan camera and target together', () => {
                const originalPosition = camera.position.clone();
                const originalTarget = camera.target.clone();

                camera.pan(1, 0); // Pan right

                const positionDelta = camera.position.subtract(originalPosition);
                const targetDelta = camera.target.subtract(originalTarget);

                expect(positionDelta.equals(targetDelta, 1e-5)).toBe(true);
            });
        });

        describe('Screen to World Conversion', () => {
            test('should convert screen coordinates to world direction', () => {
                const screenPos: Vec2 = { x: 0.5, y: 0.5 }; // Center of screen
                const worldDir = camera.screenToWorld(screenPos);

                expect(worldDir).toBeInstanceOf(Vec3);
                expect(worldDir.length()).toBeCloseTo(1.0, 1e-5); // Should be normalized

                // For orthographic camera, direction should be forward direction
                const forward = camera.getForward();
                expect(worldDir.equals(forward, 1e-5)).toBe(true);
            });
        });

        describe('Camera Cloning', () => {
            test('should clone camera correctly', () => {
                camera.setPosition(new Vec3(1, 2, 3));
                camera.setTarget(new Vec3(4, 5, 6));
                camera.setOrthographicBounds(-10, 10, -8, 8);

                const cloned = camera.clone();

                expect(cloned.position).toEqual(camera.position);
                expect(cloned.target).toEqual(camera.target);
                expect(cloned.up).toEqual(camera.up);
                expect(cloned.left).toBe(camera.left);
                expect(cloned.right).toBe(camera.right);
                expect(cloned.bottom).toBe(camera.bottom);
                expect(cloned.top).toBe(camera.top);
                expect(cloned.near).toBe(camera.near);
                expect(cloned.far).toBe(camera.far);

                // Ensure it's a deep copy
                cloned.setPosition(new Vec3(10, 20, 30));
                expect(camera.position).not.toEqual(cloned.position);
            });
        });
    });
});