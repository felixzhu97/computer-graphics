import { Vec3 } from '../math';
import { Transform } from './Transform';
import { Geometry } from '../render/GeometryManager';

/**
 * 材质接口 - 简化版本，用于场景对象
 */
export interface Material {
  name: string;
  color?: Vec3;
  opacity?: number;
  [key: string]: any;
}

/**
 * 光源接口
 */
export interface Light {
  id: string;
  name: string;
  type: 'directional' | 'point' | 'spot' | 'ambient';
  position?: Vec3;
  direction?: Vec3;
  color: Vec3;
  intensity: number;
  enabled: boolean;
}

/**
 * 场景对象接口
 */
export interface SceneObject {
  id: string;
  name: string;
  transform: Transform;
  geometry?: Geometry;
  material?: Material;
  visible: boolean;
  parent?: SceneObject;
  children: SceneObject[];
  userData: { [key: string]: any };
}

/**
 * 场景对象创建选项
 */
export interface SceneObjectOptions {
  name?: string;
  geometry?: Geometry;
  material?: Material;
  visible?: boolean;
  transform?: {
    position?: Vec3;
    rotation?: Vec3;
    scale?: Vec3;
  };
  userData?: { [key: string]: any };
}

/**
 * 场景类 - 管理3D场景中的所有对象和光源
 */
export class Scene {
  private objects = new Map<string, SceneObject>();
  private lights = new Map<string, Light>();
  private rootObjects: SceneObject[] = [];
  private nextObjectId = 1;
  private nextLightId = 1;

  /**
   * 添加对象到场景
   */
  addObject(options: SceneObjectOptions = {}): SceneObject {
    const id = `object_${this.nextObjectId++}`;
    const name = options.name || `Object ${this.nextObjectId - 1}`;
    
    // 创建变换
    const transform = new Transform(
      options.transform?.position,
      options.transform?.rotation,
      options.transform?.scale
    );

    const object: SceneObject = {
      id,
      name,
      transform,
      geometry: options.geometry,
      material: options.material,
      visible: options.visible !== false, // 默认可见
      children: [],
      userData: options.userData || {}
    };

    this.objects.set(id, object);
    this.rootObjects.push(object);

    console.log(`Added object to scene: ${name} (${id})`);
    return object;
  }

  /**
   * 添加已存在的对象到场景
   */
  addExistingObject(object: SceneObject): void {
    if (this.objects.has(object.id)) {
      console.warn(`Object with id ${object.id} already exists in scene`);
      return;
    }

    this.objects.set(object.id, object);
    
    // 如果没有父对象，添加到根对象列表
    if (!object.parent) {
      this.rootObjects.push(object);
    }

    console.log(`Added existing object to scene: ${object.name} (${object.id})`);
  }

  /**
   * 从场景中移除对象
   */
  removeObject(id: string): boolean {
    const object = this.objects.get(id);
    if (!object) {
      console.warn(`Object with id ${id} not found in scene`);
      return false;
    }

    // 移除子对象
    for (const child of object.children) {
      this.removeObject(child.id);
    }

    // 从父对象的子对象列表中移除
    if (object.parent) {
      const parentChildren = object.parent.children;
      const index = parentChildren.indexOf(object);
      if (index !== -1) {
        parentChildren.splice(index, 1);
      }
    } else {
      // 从根对象列表中移除
      const index = this.rootObjects.indexOf(object);
      if (index !== -1) {
        this.rootObjects.splice(index, 1);
      }
    }

    this.objects.delete(id);
    console.log(`Removed object from scene: ${object.name} (${id})`);
    return true;
  }

  /**
   * 获取对象
   */
  getObject(id: string): SceneObject | undefined {
    return this.objects.get(id);
  }

  /**
   * 根据名称查找对象
   */
  findObjectByName(name: string): SceneObject | undefined {
    for (const object of this.objects.values()) {
      if (object.name === name) {
        return object;
      }
    }
    return undefined;
  }

  /**
   * 获取所有对象
   */
  getAllObjects(): SceneObject[] {
    return Array.from(this.objects.values());
  }

  /**
   * 获取根对象（没有父对象的对象）
   */
  getRootObjects(): SceneObject[] {
    return [...this.rootObjects];
  }

  /**
   * 获取可见对象
   */
  getVisibleObjects(): SceneObject[] {
    const visibleObjects: SceneObject[] = [];
    
    const checkVisibility = (object: SceneObject): void => {
      if (object.visible) {
        visibleObjects.push(object);
        // 递归检查子对象
        for (const child of object.children) {
          checkVisibility(child);
        }
      }
    };

    for (const rootObject of this.rootObjects) {
      checkVisibility(rootObject);
    }

    return visibleObjects;
  }

  /**
   * 设置对象的父子关系
   */
  setParent(childId: string, parentId: string | null): boolean {
    const child = this.objects.get(childId);
    if (!child) {
      console.warn(`Child object with id ${childId} not found`);
      return false;
    }

    // 移除旧的父子关系
    if (child.parent) {
      const oldParentChildren = child.parent.children;
      const index = oldParentChildren.indexOf(child);
      if (index !== -1) {
        oldParentChildren.splice(index, 1);
      }
    } else {
      // 从根对象列表中移除
      const index = this.rootObjects.indexOf(child);
      if (index !== -1) {
        this.rootObjects.splice(index, 1);
      }
    }

    if (parentId === null) {
      // 设置为根对象
      child.parent = undefined;
      this.rootObjects.push(child);
    } else {
      const parent = this.objects.get(parentId);
      if (!parent) {
        console.warn(`Parent object with id ${parentId} not found`);
        return false;
      }

      // 检查循环引用
      if (this.wouldCreateCycle(child, parent)) {
        console.warn(`Setting parent would create a cycle`);
        return false;
      }

      child.parent = parent;
      parent.children.push(child);
    }

    console.log(`Set parent relationship: ${child.name} -> ${child.parent?.name || 'root'}`);
    return true;
  }

  /**
   * 检查是否会创建循环引用
   */
  private wouldCreateCycle(child: SceneObject, potentialParent: SceneObject): boolean {
    let current: SceneObject | undefined = potentialParent;
    while (current) {
      if (current === child) {
        return true;
      }
      current = current.parent;
    }
    return false;
  }

  /**
   * 添加光源
   */
  addLight(light: Omit<Light, 'id'>): Light {
    const id = `light_${this.nextLightId++}`;
    const fullLight: Light = {
      id,
      ...light
    };

    this.lights.set(id, fullLight);
    console.log(`Added light to scene: ${fullLight.name} (${id})`);
    return fullLight;
  }

  /**
   * 移除光源
   */
  removeLight(id: string): boolean {
    const light = this.lights.get(id);
    if (!light) {
      console.warn(`Light with id ${id} not found in scene`);
      return false;
    }

    this.lights.delete(id);
    console.log(`Removed light from scene: ${light.name} (${id})`);
    return true;
  }

  /**
   * 获取光源
   */
  getLight(id: string): Light | undefined {
    return this.lights.get(id);
  }

  /**
   * 获取所有光源
   */
  getAllLights(): Light[] {
    return Array.from(this.lights.values());
  }

  /**
   * 获取启用的光源
   */
  getEnabledLights(): Light[] {
    return Array.from(this.lights.values()).filter(light => light.enabled);
  }

  /**
   * 更新光源属性
   */
  updateLight(id: string, properties: Partial<Omit<Light, 'id'>>): boolean {
    const light = this.lights.get(id);
    if (!light) {
      console.warn(`Light with id ${id} not found in scene`);
      return false;
    }

    Object.assign(light, properties);
    console.log(`Updated light: ${light.name} (${id})`);
    return true;
  }

  /**
   * 遍历场景图（深度优先）
   */
  traverse(callback: (object: SceneObject, depth: number) => void): void {
    const traverseRecursive = (object: SceneObject, depth: number): void => {
      callback(object, depth);
      for (const child of object.children) {
        traverseRecursive(child, depth + 1);
      }
    };

    for (const rootObject of this.rootObjects) {
      traverseRecursive(rootObject, 0);
    }
  }

  /**
   * 获取场景统计信息
   */
  getStats(): {
    objectCount: number;
    visibleObjectCount: number;
    lightCount: number;
    enabledLightCount: number;
    maxDepth: number;
  } {
    let maxDepth = 0;
    
    this.traverse((object, depth) => {
      maxDepth = Math.max(maxDepth, depth);
    });

    return {
      objectCount: this.objects.size,
      visibleObjectCount: this.getVisibleObjects().length,
      lightCount: this.lights.size,
      enabledLightCount: this.getEnabledLights().length,
      maxDepth
    };
  }

  /**
   * 清空场景
   */
  clear(): void {
    this.objects.clear();
    this.lights.clear();
    this.rootObjects.length = 0;
    this.nextObjectId = 1;
    this.nextLightId = 1;
    console.log('Scene cleared');
  }

  /**
   * 克隆场景对象
   */
  cloneObject(id: string, newName?: string): SceneObject | undefined {
    const original = this.objects.get(id);
    if (!original) {
      console.warn(`Object with id ${id} not found for cloning`);
      return undefined;
    }

    const clonedObject = this.addObject({
      name: newName || `${original.name} (Clone)`,
      geometry: original.geometry,
      material: original.material,
      visible: original.visible,
      transform: {
        position: original.transform.position,
        rotation: original.transform.rotation,
        scale: original.transform.scale
      },
      userData: { ...original.userData }
    });

    // 递归克隆子对象
    for (const child of original.children) {
      const clonedChild = this.cloneObject(child.id, `${child.name} (Clone)`);
      if (clonedChild) {
        this.setParent(clonedChild.id, clonedObject.id);
      }
    }

    console.log(`Cloned object: ${original.name} -> ${clonedObject.name}`);
    return clonedObject;
  }

  /**
   * 导出场景数据
   */
  exportScene(): any {
    const sceneData = {
      objects: Array.from(this.objects.values()).map(obj => ({
        id: obj.id,
        name: obj.name,
        transform: {
          position: obj.transform.position,
          rotation: obj.transform.rotation,
          scale: obj.transform.scale
        },
        visible: obj.visible,
        parentId: obj.parent?.id,
        userData: obj.userData
      })),
      lights: Array.from(this.lights.values())
    };

    return sceneData;
  }

  /**
   * 从数据导入场景
   */
  importScene(sceneData: any): void {
    this.clear();

    // 首先创建所有对象（不设置父子关系）
    const objectMap = new Map<string, SceneObject>();
    
    for (const objData of sceneData.objects || []) {
      const transform = new Transform(
        new Vec3(objData.transform.position.x, objData.transform.position.y, objData.transform.position.z),
        new Vec3(objData.transform.rotation.x, objData.transform.rotation.y, objData.transform.rotation.z),
        new Vec3(objData.transform.scale.x, objData.transform.scale.y, objData.transform.scale.z)
      );

      const object: SceneObject = {
        id: objData.id,
        name: objData.name,
        transform,
        visible: objData.visible,
        children: [],
        userData: objData.userData || {}
      };

      this.objects.set(object.id, object);
      objectMap.set(object.id, object);
    }

    // 然后设置父子关系
    for (const objData of sceneData.objects || []) {
      if (objData.parentId) {
        this.setParent(objData.id, objData.parentId);
      } else {
        const object = objectMap.get(objData.id);
        if (object) {
          this.rootObjects.push(object);
        }
      }
    }

    // 导入光源
    for (const lightData of sceneData.lights || []) {
      this.lights.set(lightData.id, lightData);
    }

    console.log('Scene imported successfully');
  }
}