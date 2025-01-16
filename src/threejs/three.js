import * as THREE from "three";
import vertexShader from "./shaders/vertexShader.glsl";
import fragmentShader from "./shaders/fragmentShader.glsl";
import { animate } from "motion";
// Canvas
const canvas = document.querySelector("canvas.webgl");
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const images = [...document.querySelectorAll("img")];
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const scene = new THREE.Scene();
const calculateImagePositions = () => {
  return images.map((image) => {
    let bounds = image.getBoundingClientRect();
    let geometry = new THREE.PlaneGeometry(1, 1, 20, 20);

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(image.src);
    texture.needsUpdate = true;

    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      // wireframe: true,
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: texture },
        uHover: { value: new THREE.Vector2(0.5, 0.5) },
        uHoverState: { value: 0 },
      },
    });
    image.addEventListener("mouseenter", () => {
      animate(0, 1, {
        duration: 1,
        onUpdate: (value) => (material.uniforms.uHoverState.value = value),
        easing: "easeInOut",
      });
    });
    image.addEventListener("mouseleave", () => {
      animate(1,0,
         {
           duration: 1, ease: "easeInOut", onUpdate: (value) => material.uniforms.uHoverState.value = value})
    });

    // Mesh
    const mesh = new THREE.Mesh(geometry, material);
    geometry.scale(bounds.width, bounds.height, 1);
    scene.add(mesh);

    return {
      mesh: mesh,
      image: image,
      top: bounds.top,
      left: bounds.left,
      width: bounds.width,
      height: bounds.height,
    };
  });
};
let imagePositions = calculateImagePositions();
console.log(imagePositions);

const updateImagePositions = () => {
  imagePositions.forEach((imagePosition) => {
    const bounds = imagePosition.image.getBoundingClientRect();
    imagePosition.mesh.position.x =
      bounds.left - sizes.width / 2 + bounds.width / 2;
    imagePosition.mesh.position.y =
      -bounds.top + sizes.height / 2 - bounds.height / 2;
  });
};
updateImagePositions();

const camera = new THREE.PerspectiveCamera(
  50,
  sizes.width / sizes.height,
  100,
  2000
);
camera.position.z = 600;
camera.fov =
  (Math.atan(sizes.height / 2 / camera.position.z) * 2 * 180) / Math.PI;
camera.updateProjectionMatrix();
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const clock = new THREE.Clock();
const tick = () => {
  renderer.render(scene, camera);

  updateImagePositions();

  const elapsedTime = clock.getElapsedTime();
  imagePositions.forEach((imagePosition) => {
    imagePosition.mesh.material.uniforms.uTime.value = elapsedTime;
  });

  window.requestAnimationFrame(tick);
};

tick();

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  setTimeout(() => {
    updateImagePositions();
  }, 2000);
  // Update renderer
  renderer.setSize(sizes.width, sizes.height);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  camera.updateProjectionMatrix();
});

window.addEventListener("mousemove", (e) => {
  mouse.x = (e.clientX / sizes.width) * 2 - 1;
  mouse.y = -(e.clientY / sizes.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length > 0) {
    let object = intersects[0].object;
    object.material.uniforms.uHover.value = intersects[0].uv;
  }
});

