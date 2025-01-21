import * as THREE from "three";
import vertexShader from "./shaders/vertexShader.glsl";
import fragmentShader from "./shaders/fragmentShader.glsl";
import { animate } from "motion";
import { int } from "three/tsl";

const canvas = document.querySelector("canvas.webgl");
const images = [...document.querySelectorAll("img")];
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const mouse = new THREE.Vector2(-1, -1);
const raycaster = new THREE.Raycaster();
let currentIntersect = null;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 500;
camera.fov =
  (Math.atan(sizes.height / 2 / camera.position.z) * 2 * 180) / Math.PI;
camera.updateProjectionMatrix();

scene.add(camera);
const meshes = []; // Store the meshes to update their positions on scroll.. or resize
const textureLoader = new THREE.TextureLoader();
const createImages = () => {
  images.forEach((image) => {
    const imageBounds = image.getBoundingClientRect();
    const x = imageBounds.left - sizes.width * 0.5 + imageBounds.width * 0.5;
    const y = -imageBounds.top + sizes.height * 0.5 - imageBounds.height * 0.5;
    const geometry = new THREE.PlaneGeometry(
      imageBounds.width,
      imageBounds.height,
      10,
      10
    );
    const texture = textureLoader.load(image.src);
    const material = new THREE.ShaderMaterial({
      // wireframe: true,
      uniforms: {
        uTexture: { value: texture },
        uTextureSize: {
          value: new THREE.Vector2(image.naturalWidth, image.naturalHeight), // Use intrinsic image dimensions
        },
        uResolution: {
          value: new THREE.Vector2(imageBounds.width, imageBounds.height),
        },
        uTime: { value: 0 }, // Add time uniform
        uMouse: { value: new THREE.Vector2(-1, -1) },
        uHoverState: { value: 0 },
      },
      uScrollVelocity: { value: 0 },
      vertexShader,
      fragmentShader,
    });
    image.addEventListener("mouseenter", () => {
      animate(0, 1, {
        duration: 0.7,
        onUpdate: (value) => {
          material.uniforms.uHoverState.value = value;
        },
      });
    });
    image.addEventListener("mouseleave", () => {
      animate(1, 0, {
        duration: 0.7,
        onUpdate: (value) => {
          material.uniforms.uHoverState.value = value;
        },
      });
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, 0);
    meshes.push({ mesh, image });
    scene.add(mesh);
  });
};

const updateImageSize = () => {
  meshes.forEach(({ mesh, image }) => {
    const imageBounds = image.getBoundingClientRect();

    // Calculate the scale factors relative to the initial geometry size
    const scaleX = imageBounds.width / mesh.geometry.parameters.width;
    const scaleY = imageBounds.height / mesh.geometry.parameters.height;

    // Update the mesh's scale
    mesh.scale.set(scaleX, scaleY, 1); // Scale in X and Y, leave Z unchanged
  });
};

const updateImagesPosition = () => {
  meshes.forEach(({ mesh, image }) => {
    const imageBounds = image.getBoundingClientRect();
    const x = imageBounds.left - sizes.width * 0.5 + imageBounds.width * 0.5;
    const y = -imageBounds.top + sizes.height * 0.5 - imageBounds.height * 0.5;
    mesh.position.set(x, y, 0);
  });
};

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
const clock = new THREE.Clock();
const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  meshes.forEach(({ mesh }) => {
    mesh.material.uniforms.uTime.value = elapsedTime;
  });
  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};
tick();

//Event Listeners.
window.addEventListener("mousemove", (event) => {
  // Convert to normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the raycaster
  raycaster.setFromCamera(mouse, camera);

  // Find intersections
  const intersects = raycaster.intersectObjects(scene.children);



  if (intersects.length > 0) {
    console.log(intersects[0]);
    let obj = intersects[0].object;
    obj.material.uniforms.uMouse.value = intersects[0].uv;
  }
});

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  updateImageSize();
  updateImagesPosition();
  camera.fov =
    (Math.atan(sizes.height / 2 / camera.position.z) * 2 * 180) / Math.PI;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

window.addEventListener("scroll", () => {
  updateImagesPosition();
});
createImages();
