import * as THREE from 'three';

export const BLOG_PATH_POINTS = [
  new THREE.Vector3(-18,  0,    22),
  new THREE.Vector3(-21,  0.6,  8),
  new THREE.Vector3(-23, -0.3, -8),
  new THREE.Vector3(-22,  0.9, -26),
  new THREE.Vector3(-25, -0.5, -44),
  new THREE.Vector3(-23,  0.4, -62),
  new THREE.Vector3(-25, -0.3, -80),
  new THREE.Vector3(-22,  0.7, -98),
  new THREE.Vector3(-25, -0.4, -116),
  new THREE.Vector3(-23,  0.2, -134),
  new THREE.Vector3(-24,  0,   -150),
];

export const blogCurve = new THREE.CatmullRomCurve3(
  BLOG_PATH_POINTS, false, 'catmullrom', 0.5
);
