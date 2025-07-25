import { Scene, SceneObject, Light } from '../../src/scene/Scene';
import { Transform } from '../../src/scene/Transform';
import { Vec3 } from '../../src/math';

describe('Scene', () => {
  let scene: Scene;

  beforeEach(() => {
    scene = new Scene();
  });

  describe('Object Management', () => {
    test('should add object to scene', () => {
      const object = scene.addObject({
        name: 'Test Object'
      });

      expect(object.id).toBeDefined();
      expect(object.name).toBe('Test Object');
      expect(object.visible).toBe(true);
      expect(object.children).toEqual([]);
      expect(scene.getObject(object.id)).toBe(object);
    });

    test('should add object with custom transform', () => {
      const position = new Vec3(1, 2, 3);
      const rotation = new Vec3(0.1, 0.2, 0.3);
      const scale = new Vec3(2, 2, 2);

      const object = scene.addObject({
        name: 'Transformed Object',
        transform: { position, rotation, scale }
      });

      expect(object.transform.position).toEqual(position);
      expect(object.transform.rotation).toEqual(rotation);
      expect(object.transform.scale).toEqual(scale);
    });

    test('should remove object from scene', () => {
      const object = scene.addObject({ name: 'Test Object' });
      const removed = scene.removeObject(object.id);

      expect(removed).toBe(true);
      expect(scene.getObject(object.id)).toBeUndefined();
    });

    test('should return false when removing non-existent object', () => {
      const removed = scene.removeObject('non-existent-id');
      expect(removed).toBe(false);
    });

    test('should find object by name', () => {
      const object = scene.addObject({ name: 'Unique Name' });
      const found = scene.findObjectByName('Unique Name');

      expect(found).toBe(object);
    });

    test('should return undefined for non-existent name', () => {
      const found = scene.findObjectByName('Non-existent Name');
      expect(found).toBeUndefined();
    });

    test('should get all objects', () => {
      const obj1 = scene.addObject({ name: 'Object 1' });
      const obj2 = scene.addObject({ name: 'Object 2' });

      const allObjects = scene.getAllObjects();
      expect(allObjects).toHaveLength(2);
      expect(allObjects).toContain(obj1);
      expect(allObjects).toContain(obj2);
    });

    test('should get root objects', () => {
      const obj1 = scene.addObject({ name: 'Root 1' });
      const obj2 = scene.addObject({ name: 'Root 2' });

      const rootObjects = scene.getRootObjects();
      expect(rootObjects).toHaveLength(2);
      expect(rootObjects).toContain(obj1);
      expect(rootObjects).toContain(obj2);
    });
  });

  describe('Visibility Management', () => {
    test('should get visible objects', () => {
      const visibleObj = scene.addObject({ name: 'Visible', visible: true });
      const invisibleObj = scene.addObject({ name: 'Invisible', visible: false });

      const visibleObjects = scene.getVisibleObjects();
      expect(visibleObjects).toHaveLength(1);
      expect(visibleObjects).toContain(visibleObj);
      expect(visibleObjects).not.toContain(invisibleObj);
    });

    test('should handle child visibility correctly', () => {
      const parent = scene.addObject({ name: 'Parent', visible: true });
      const child = scene.addObject({ name: 'Child', visible: true });
      
      scene.setParent(child.id, parent.id);

      const visibleObjects = scene.getVisibleObjects();
      expect(visibleObjects).toHaveLength(2);
      expect(visibleObjects).toContain(parent);
      expect(visibleObjects).toContain(child);
    });

    test('should not include children of invisible parents', () => {
      const parent = scene.addObject({ name: 'Parent', visible: false });
      const child = scene.addObject({ name: 'Child', visible: true });
      
      scene.setParent(child.id, parent.id);

      const visibleObjects = scene.getVisibleObjects();
      expect(visibleObjects).toHaveLength(0);
    });
  });

  describe('Hierarchy Management', () => {
    test('should set parent-child relationship', () => {
      const parent = scene.addObject({ name: 'Parent' });
      const child = scene.addObject({ name: 'Child' });

      const success = scene.setParent(child.id, parent.id);

      expect(success).toBe(true);
      expect(child.parent).toBe(parent);
      expect(parent.children).toContain(child);
      expect(scene.getRootObjects()).not.toContain(child);
    });

    test('should remove child from root when setting parent', () => {
      const parent = scene.addObject({ name: 'Parent' });
      const child = scene.addObject({ name: 'Child' });

      expect(scene.getRootObjects()).toContain(child);

      scene.setParent(child.id, parent.id);

      expect(scene.getRootObjects()).not.toContain(child);
      expect(scene.getRootObjects()).toContain(parent);
    });

    test('should set object as root when parent is null', () => {
      const parent = scene.addObject({ name: 'Parent' });
      const child = scene.addObject({ name: 'Child' });

      scene.setParent(child.id, parent.id);
      expect(scene.getRootObjects()).not.toContain(child);

      scene.setParent(child.id, null);
      expect(child.parent).toBeUndefined();
      expect(scene.getRootObjects()).toContain(child);
    });

    test('should prevent circular references', () => {
      const obj1 = scene.addObject({ name: 'Object 1' });
      const obj2 = scene.addObject({ name: 'Object 2' });

      scene.setParent(obj2.id, obj1.id);
      const success = scene.setParent(obj1.id, obj2.id);

      expect(success).toBe(false);
      expect(obj1.parent).toBeUndefined();
    });

    test('should remove children when removing parent', () => {
      const parent = scene.addObject({ name: 'Parent' });
      const child = scene.addObject({ name: 'Child' });

      scene.setParent(child.id, parent.id);
      scene.removeObject(parent.id);

      expect(scene.getObject(parent.id)).toBeUndefined();
      expect(scene.getObject(child.id)).toBeUndefined();
    });
  });

  describe('Light Management', () => {
    test('should add light to scene', () => {
      const light = scene.addLight({
        name: 'Test Light',
        type: 'directional',
        color: new Vec3(1, 1, 1),
        intensity: 1.0,
        enabled: true
      });

      expect(light.id).toBeDefined();
      expect(light.name).toBe('Test Light');
      expect(light.type).toBe('directional');
      expect(scene.getLight(light.id)).toBe(light);
    });

    test('should remove light from scene', () => {
      const light = scene.addLight({
        name: 'Test Light',
        type: 'point',
        color: new Vec3(1, 0, 0),
        intensity: 0.5,
        enabled: true
      });

      const removed = scene.removeLight(light.id);

      expect(removed).toBe(true);
      expect(scene.getLight(light.id)).toBeUndefined();
    });

    test('should get enabled lights only', () => {
      const enabledLight = scene.addLight({
        name: 'Enabled Light',
        type: 'point',
        color: new Vec3(1, 1, 1),
        intensity: 1.0,
        enabled: true
      });

      const disabledLight = scene.addLight({
        name: 'Disabled Light',
        type: 'directional',
        color: new Vec3(0, 1, 0),
        intensity: 0.8,
        enabled: false
      });

      const enabledLights = scene.getEnabledLights();
      expect(enabledLights).toHaveLength(1);
      expect(enabledLights).toContain(enabledLight);
      expect(enabledLights).not.toContain(disabledLight);
    });

    test('should update light properties', () => {
      const light = scene.addLight({
        name: 'Test Light',
        type: 'point',
        color: new Vec3(1, 1, 1),
        intensity: 1.0,
        enabled: true
      });

      const success = scene.updateLight(light.id, {
        intensity: 0.5,
        color: new Vec3(1, 0, 0),
        enabled: false
      });

      expect(success).toBe(true);
      expect(light.intensity).toBe(0.5);
      expect(light.color).toEqual(new Vec3(1, 0, 0));
      expect(light.enabled).toBe(false);
    });
  });

  describe('Scene Traversal', () => {
    test('should traverse scene graph in depth-first order', () => {
      const root = scene.addObject({ name: 'Root' });
      const child1 = scene.addObject({ name: 'Child1' });
      const child2 = scene.addObject({ name: 'Child2' });
      const grandchild = scene.addObject({ name: 'Grandchild' });

      scene.setParent(child1.id, root.id);
      scene.setParent(child2.id, root.id);
      scene.setParent(grandchild.id, child1.id);

      const traversalOrder: string[] = [];
      const depths: number[] = [];

      scene.traverse((object, depth) => {
        traversalOrder.push(object.name);
        depths.push(depth);
      });

      expect(traversalOrder).toEqual(['Root', 'Child1', 'Grandchild', 'Child2']);
      expect(depths).toEqual([0, 1, 2, 1]);
    });
  });

  describe('Scene Statistics', () => {
    test('should provide accurate scene statistics', () => {
      const obj1 = scene.addObject({ name: 'Object 1', visible: true });
      const obj2 = scene.addObject({ name: 'Object 2', visible: false });
      const child = scene.addObject({ name: 'Child', visible: true });

      scene.setParent(child.id, obj1.id);

      scene.addLight({
        name: 'Light 1',
        type: 'directional',
        color: new Vec3(1, 1, 1),
        intensity: 1.0,
        enabled: true
      });

      scene.addLight({
        name: 'Light 2',
        type: 'point',
        color: new Vec3(1, 0, 0),
        intensity: 0.5,
        enabled: false
      });

      const stats = scene.getStats();

      expect(stats.objectCount).toBe(3);
      expect(stats.visibleObjectCount).toBe(2); // obj1 and child
      expect(stats.lightCount).toBe(2);
      expect(stats.enabledLightCount).toBe(1);
      expect(stats.maxDepth).toBe(1); // child is at depth 1
    });
  });

  describe('Scene Operations', () => {
    test('should clear scene', () => {
      scene.addObject({ name: 'Object' });
      scene.addLight({
        name: 'Light',
        type: 'point',
        color: new Vec3(1, 1, 1),
        intensity: 1.0,
        enabled: true
      });

      scene.clear();

      expect(scene.getAllObjects()).toHaveLength(0);
      expect(scene.getAllLights()).toHaveLength(0);
      expect(scene.getRootObjects()).toHaveLength(0);
    });

    test('should clone object', () => {
      const original = scene.addObject({
        name: 'Original',
        visible: true,
        userData: { customData: 'test' }
      });

      const cloned = scene.cloneObject(original.id, 'Cloned');

      expect(cloned).toBeDefined();
      expect(cloned!.name).toBe('Cloned');
      expect(cloned!.visible).toBe(original.visible);
      expect(cloned!.userData).toEqual(original.userData);
      expect(cloned!.id).not.toBe(original.id);
    });

    test('should clone object with children', () => {
      const parent = scene.addObject({ name: 'Parent' });
      const child = scene.addObject({ name: 'Child' });

      scene.setParent(child.id, parent.id);

      const clonedParent = scene.cloneObject(parent.id);

      expect(clonedParent).toBeDefined();
      expect(clonedParent!.children).toHaveLength(1);
      expect(clonedParent!.children[0].name).toBe('Child (Clone)');
    });
  });
});