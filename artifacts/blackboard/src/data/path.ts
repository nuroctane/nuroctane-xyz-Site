import * as THREE from 'three';

export const PATH_POINTS = [
  new THREE.Vector3(0, 0, 25),
  new THREE.Vector3(-1.5, 0.8, 10),
  new THREE.Vector3(2.0, -0.4, -5),
  new THREE.Vector3(-2.5, 1.2, -22),
  new THREE.Vector3(1.8, 0.2, -40),
  new THREE.Vector3(-1.2, -0.8, -58),
  new THREE.Vector3(2.5, 0.6, -76),
  new THREE.Vector3(-2.0, 1.0, -94),
  new THREE.Vector3(1.5, -0.5, -112),
  new THREE.Vector3(-2.8, 0.3, -130),
  new THREE.Vector3(1.0, 0.8, -148),
  new THREE.Vector3(-1.5, -0.2, -166),
  new THREE.Vector3(0, 0, -182),
  // Extended tail — portals at z=-186 now sit within the navigable path
  new THREE.Vector3(0, 0, -200),
];

export const curve = new THREE.CatmullRomCurve3(PATH_POINTS, false, 'catmullrom', 0.5);
