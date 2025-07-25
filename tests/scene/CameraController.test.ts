import { 
  OrbitController, 
  FirstPersonController, 
  CameraControllerFactory 
} from '../../src/scene/CameraController';
import { PerspectiveCamera } from '../../src/scene/Camera';
import { Vec3 } from '../../src/math';

describe('Camera Controllers', () => {
  describe('OrbitController', () => {
    let camera: PerspectiveCamera;
    let controller: OrbitController;

    beforeEach(() => {
      camera = new PerspectiveCamera();
      controller = new OrbitController(camera);
    });

    describe('Construction', () => {
      test('should create orbit controller with default settings', () => {
        expect(controller.isEnabled()).toBe(true);
        expect(controller.getCamera()).toBe(camera);
      });

      test('should create orbit controller with custom target', () => {
        const target = new Vec3(5, 10, 15);
        const customController = new OrbitController(camera, target);
        
        expect(customController.getTarget()).toEqual(target);
        expect(camera.target).toEqual(target);
      });
    });

    describe('Configuration', () => {
      test('should set rotate speed', () => {
        controller.setRotateSpeed(2.0);
        // Speed is private, but we can test its effect through mouse movement
        expect(() => controller.setRotateSpeed(2.0)).not.toThrow();
      });

      test('should set zoom speed', () => {
        controller.setZoomSpeed(0.5);
        expect(() => controller.setZoomSpeed(0.5)).not.toThrow();
      });

      test('should set pan speed', () => {
        controller.setPanSpeed(1.5);
        expect(() => controller.setPanSpeed(1.5)).not.toThrow();
      });

      test('should set distance limits', () => {
        controller.setDistanceLimits(1.0, 100.0);
        expect(() => controller.setDistanceLimits(1.0, 100.0)).not.toThrow();
      });

      test('should set polar angle limits', () => {
        controller.setPolarAngleLimits(0.1, Math.PI - 0.1);
        expect(() => controller.setPolarAngleLimits(0.1, Math.PI - 0.1)).not.toThrow();
      });

      test('should enable/disable controls', () => {
        controller.setEnableRotate(false);
        controller.setEnableZoom(false);
        controller.setEnablePan(false);
        expect(() => {
          controller.setEnableRotate(false);
          controller.setEnableZoom(false);
          controller.setEnablePan(false);
        }).not.toThrow();
      });
    });

    describe('Mouse Interaction', () => {
      test('should handle left mouse button rotation', () => {
        const originalPosition = camera.position.clone();
        
        controller.onMouseMove(10, 5, true, false, false);
        
        expect(camera.position.equals(originalPosition)).toBe(false);
      });

      test('should handle right mouse button panning', () => {
        const originalPosition = camera.position.clone();
        const originalTarget = camera.target.clone();
        
        controller.onMouseMove(10, 5, false, true, false);
        
        const positionDelta = camera.position.subtract(originalPosition);
        const targetDelta = camera.target.subtract(originalTarget);
        
        // Both camera and target should move together during panning
        expect(positionDelta.equals(targetDelta, 1e-5)).toBe(true);
      });

      test('should handle middle mouse button panning', () => {
        const originalPosition = camera.position.clone();
        const originalTarget = camera.target.clone();
        
        controller.onMouseMove(10, 5, false, false, true);
        
        const positionDelta = camera.position.subtract(originalPosition);
        const targetDelta = camera.target.subtract(originalTarget);
        
        expect(positionDelta.equals(targetDelta, 1e-5)).toBe(true);
      });

      test('should handle mouse wheel zoom', () => {
        const originalDistance = camera.position.subtract(camera.target).length();
        
        controller.onMouseWheel(1); // Zoom in
        
        const newDistance = camera.position.subtract(camera.target).length();
        expect(newDistance).toBeLessThan(originalDistance);
      });

      test('should not respond when disabled', () => {
        controller.setEnabled(false);
        const originalPosition = camera.position.clone();
        
        controller.onMouseMove(10, 5, true, false, false);
        controller.onMouseWheel(1);
        
        expect(camera.position.equals(originalPosition)).toBe(true);
      });
    });

    describe('Target Management', () => {
      test('should set and get target', () => {
        const newTarget = new Vec3(10, 20, 30);
        controller.setTarget(newTarget);
        
        expect(controller.getTarget()).toEqual(newTarget);
        expect(camera.target).toEqual(newTarget);
      });
    });

    describe('Reset Functionality', () => {
      test('should reset to default state', () => {
        const originalPosition = camera.position.clone();
        const originalTarget = camera.target.clone();
        const originalUp = camera.up.clone();
        
        // Make some changes
        controller.onMouseMove(50, 25, true, false, false);
        controller.onMouseWheel(1);
        
        // Reset
        controller.reset();
        
        expect(camera.position.equals(originalPosition, 1e-5)).toBe(true);
        expect(camera.target.equals(originalTarget, 1e-5)).toBe(true);
        expect(camera.up.equals(originalUp, 1e-5)).toBe(true);
      });
    });

    describe('Update Method', () => {
      test('should enforce distance limits during update', () => {
        controller.setDistanceLimits(2.0, 10.0);
        
        // Move camera too close
        camera.position = camera.target.add(new Vec3(0.5, 0, 0));
        controller.update(0.016); // 60fps
        
        const distance = camera.position.subtract(camera.target).length();
        expect(distance).toBeGreaterThanOrEqual(2.0);
      });
    });
  });

  describe('FirstPersonController', () => {
    let camera: PerspectiveCamera;
    let controller: FirstPersonController;

    beforeEach(() => {
      camera = new PerspectiveCamera();
      controller = new FirstPersonController(camera);
    });

    describe('Construction', () => {
      test('should create first person controller', () => {
        expect(controller.isEnabled()).toBe(true);
        expect(controller.getCamera()).toBe(camera);
      });

      test('should initialize look direction from camera', () => {
        const lookDir = controller.getLookDirection();
        expect(typeof lookDir.yaw).toBe('number');
        expect(typeof lookDir.pitch).toBe('number');
      });
    });

    describe('Configuration', () => {
      test('should set move speed', () => {
        controller.setMoveSpeed(10.0);
        expect(() => controller.setMoveSpeed(10.0)).not.toThrow();
      });

      test('should set look speed', () => {
        controller.setLookSpeed(2.0);
        expect(() => controller.setLookSpeed(2.0)).not.toThrow();
      });

      test('should set mouse sensitivity', () => {
        controller.setMouseSensitivity(0.001);
        expect(() => controller.setMouseSensitivity(0.001)).not.toThrow();
      });

      test('should set pitch limits', () => {
        controller.setPitchLimits(-Math.PI/3, Math.PI/3);
        expect(() => controller.setPitchLimits(-Math.PI/3, Math.PI/3)).not.toThrow();
      });
    });

    describe('Mouse Look', () => {
      test('should handle mouse movement for looking', () => {
        const originalLookDir = controller.getLookDirection();
        
        controller.onMouseMove(10, 5, false, false, false);
        
        const newLookDir = controller.getLookDirection();
        expect(newLookDir.yaw).not.toBeCloseTo(originalLookDir.yaw);
        expect(newLookDir.pitch).not.toBeCloseTo(originalLookDir.pitch);
      });

      test('should clamp pitch within limits', () => {
        controller.setPitchLimits(-Math.PI/4, Math.PI/4);
        
        // Try to look way up
        controller.onMouseMove(0, -1000, false, false, false);
        
        const lookDir = controller.getLookDirection();
        expect(lookDir.pitch).toBeLessThanOrEqual(Math.PI/4);
        expect(lookDir.pitch).toBeGreaterThanOrEqual(-Math.PI/4);
      });

      test('should set look direction directly', () => {
        const yaw = Math.PI / 4;
        const pitch = Math.PI / 6;
        
        controller.setLookDirection(yaw, pitch);
        
        const lookDir = controller.getLookDirection();
        expect(lookDir.yaw).toBeCloseTo(yaw);
        expect(lookDir.pitch).toBeCloseTo(pitch);
      });
    });

    describe('Keyboard Movement', () => {
      test('should handle WASD movement keys', () => {
        const originalPosition = camera.position.clone();
        
        controller.onKeyDown('w');
        controller.update(0.1); // 100ms
        controller.onKeyUp('w');
        
        expect(camera.position.equals(originalPosition)).toBe(false);
      });

      test('should handle space and shift for vertical movement', () => {
        const originalY = camera.position.y;
        
        controller.onKeyDown(' '); // Space key
        controller.update(0.1);
        controller.onKeyUp(' ');
        
        expect(camera.position.y).toBeGreaterThan(originalY);
        
        controller.onKeyDown('Shift');
        controller.update(0.1);
        controller.onKeyUp('Shift');
        
        expect(camera.position.y).toBeLessThan(originalY + 0.5); // Should have moved down
      });

      test('should not move when disabled', () => {
        controller.setEnabled(false);
        const originalPosition = camera.position.clone();
        
        controller.onKeyDown('w');
        controller.update(0.1);
        
        expect(camera.position.equals(originalPosition)).toBe(true);
      });
    });

    describe('Reset Functionality', () => {
      test('should reset to default state', () => {
        const originalPosition = camera.position.clone();
        const originalLookDir = controller.getLookDirection();
        
        // Make some changes
        controller.onKeyDown('w');
        controller.update(0.1);
        controller.onMouseMove(50, 25, false, false, false);
        
        // Reset
        controller.reset();
        
        expect(camera.position.equals(originalPosition, 1e-5)).toBe(true);
        
        const resetLookDir = controller.getLookDirection();
        expect(resetLookDir.yaw).toBeCloseTo(originalLookDir.yaw);
        expect(resetLookDir.pitch).toBeCloseTo(originalLookDir.pitch);
      });
    });

    describe('Update Method', () => {
      test('should update camera target based on look direction', () => {
        const originalTarget = camera.target.clone();
        
        controller.onMouseMove(10, 0, false, false, false);
        controller.update(0.016);
        
        expect(camera.target.equals(originalTarget)).toBe(false);
      });
    });
  });

  describe('CameraControllerFactory', () => {
    let camera: PerspectiveCamera;

    beforeEach(() => {
      camera = new PerspectiveCamera();
    });

    test('should create orbit controller', () => {
      const controller = CameraControllerFactory.createOrbitController(camera);
      expect(controller).toBeInstanceOf(OrbitController);
      expect(controller.getCamera()).toBe(camera);
    });

    test('should create orbit controller with target', () => {
      const target = new Vec3(1, 2, 3);
      const controller = CameraControllerFactory.createOrbitController(camera, target);
      expect(controller).toBeInstanceOf(OrbitController);
      expect(controller.getTarget()).toEqual(target);
    });

    test('should create first person controller', () => {
      const controller = CameraControllerFactory.createFirstPersonController(camera);
      expect(controller).toBeInstanceOf(FirstPersonController);
      expect(controller.getCamera()).toBe(camera);
    });
  });
});