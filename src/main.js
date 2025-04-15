// MAIN IMPORTS
import * as THREE from 'three';
import * as text from './text';

// THREE Setup
const bgScene = new THREE.Scene();
const bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const bgGeometry = new THREE.PlaneGeometry(2, 2);

const bgUniforms = {
  u_time: { value: 0 },
  u_scroll: { value: 0 },
  u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
};

const bgVertexShader = `
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const bgFragmentShader = `
  precision mediump float;
  uniform float u_time;
  uniform float u_scroll;
  uniform vec2 u_resolution;
  varying vec2 vUv;
  
  void main(){
    vec2 uv = vUv;
    // Basisfarben für einen dunklen, kühlen Verlauf
    vec3 color1 = vec3(0.0, 0.05, 0.1);
    vec3 color2 = vec3(0.0, 0.2, 0.3);
    // Dynamischer Verlauf, beeinflusst von Zeit und Scroll
    float gradient = uv.y + 0.1 * sin(u_time * 0.5 + uv.x * 5.0);
    gradient += u_scroll * 0.2;
    vec3 color = mix(color1, color2, gradient);
    gl_FragColor = vec4(color, 1.0);
  }
`;

const bgMaterial = new THREE.ShaderMaterial({
  uniforms: bgUniforms,
  vertexShader: bgVertexShader,
  fragmentShader: bgFragmentShader,
  depthWrite: false
});
const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
bgScene.add(bgMesh);

// THREE.js Scene
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0d0d0d, 0.05);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);
camera.position.set(0, 0, 20);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('bg-canvas'),
  alpha: true,
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x0d0d0d, 0);

const particleCount = 500;
const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
const particleMaterial = new THREE.MeshStandardMaterial({
  color: 0xCF9FFF,
  transparent: true,
  opacity: 1,
  blending: THREE.AdditiveBlending,
  emissive: 0xCF9FFF,
  emissiveIntensity: 100,
});
const particlesInstanced = new THREE.InstancedMesh(particleGeometry, particleMaterial, particleCount);
scene.add(particlesInstanced);

const particlePositions = [];
const particleVelocities = [];
const dummy = new THREE.Object3D();

for (let i = 0; i < particleCount; i++) {
  const x = (Math.random() - 0.5) * 60;
  const y = (Math.random() - 0.5) * 50;
  const z = -10 + Math.random() * 15;
  particlePositions.push({ x, y, z });
  const vx = (Math.random() - 0.5) * 0.002;
  const vy = (Math.random() - 0.5) * 0.002;
  const vz = (Math.random() - 0.5) * 0.002;
  particleVelocities.push({ vx, vy, vz });

  dummy.position.set(x, y, z);
  dummy.updateMatrix();
  particlesInstanced.setMatrixAt(i, dummy.matrix);
}
particlesInstanced.instanceMatrix.needsUpdate = true;

const spawnPoints = [];
const gridRows = 5;
const gridCols = 5;
const startX = -20, endX = 20;
const startY = -20, endY = 20;
const spacingX = (endX - startX) / (gridCols - 1);
const spacingY = (endY - startY) / (gridRows - 1);
for (let i = 0; i < gridCols; i++) {
  for (let j = 0; j < gridRows; j++) {
    let x = startX + i * spacingX;
    let y = startY + j * spacingY;
    spawnPoints.push(new THREE.Vector3(x, y, -2));
  }
}

const occupiedSpawnPoints = new Array(spawnPoints.length).fill(false);

const wireframeShapes = [];

const fadeInTime = 3;
const fadeOutTime = 3;

function spawnWireframeShape() {
  const freeIndices = [];
  for (let i = 0; i < occupiedSpawnPoints.length; i++) {
    if (!occupiedSpawnPoints[i]) freeIndices.push(i);
  }
  if (freeIndices.length === 0) return;

  const spawnIndex = freeIndices[Math.floor(Math.random() * freeIndices.length)];
  occupiedSpawnPoints[spawnIndex] = true;

  let geometry;
  const shapeType = Math.floor(Math.random() * 4);

  switch (shapeType) {
    case 0: // Sphere
      geometry = new THREE.SphereGeometry(
        1,
        8 + Math.floor(Math.random() * 8),
        8 + Math.floor(Math.random() * 8)
      );
      break;
    case 1: // Icosahedron
      geometry = new THREE.IcosahedronGeometry(
        1,
        Math.floor(Math.random() * 2)
      );
      break;
    case 2: // Torus
      geometry = new THREE.TorusGeometry(
        1,
        0.1 + Math.random() * 0.2,
        8 + Math.floor(Math.random() * 8),
        12 + Math.floor(Math.random() * 12)
      );
      break;
    case 3: // Torus Knot
      geometry = new THREE.TorusKnotGeometry(
        1,
        0.08 + Math.random() * 0.15,
        60 + Math.floor(Math.random() * 20),
        8 + Math.floor(Math.random() * 4)
      );
      break;
  }

  const hue = Math.random() * 0.6 + 0.5;
  const color = new THREE.Color().setHSL(hue, 1, 0.5);

  const material = new THREE.MeshStandardMaterial({
    color: color,
    wireframe: true,
    transparent: true,
    opacity: 1,
    emissive: color,
    emissiveIntensity: 10
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(spawnPoints[spawnIndex]);

  const scale = 3 + Math.random() * 5;
  mesh.scale.set(scale, scale, scale);

  const velocity = new THREE.Vector3(
    (Math.random() - 0.5) * 0.005,
    (Math.random() - 0.5) * 0.005,
    (Math.random() - 0.5) * 0.005
  );

  const maxLifetime = 20 + Math.random() * 10;

  scene.add(mesh);
  wireframeShapes.push({ mesh, velocity, lifetime: 0, maxLifetime, spawnIndex });
}

let targetCameraY = 0;
const targetCameraZ = 20;

window.addEventListener('scroll', () => {
  targetCameraY = window.scrollY * 0.005;
  bgUniforms.u_scroll.value = window.scrollY / document.body.scrollHeight;
});

function animate() {
  requestAnimationFrame(animate);
  bgUniforms.u_time.value += 0.01;

  camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCameraY, 0.05);
  camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCameraZ, 0.05);

  for (let i = 0; i < particleCount; i++) {
    let pos = particlePositions[i];
    let vel = particleVelocities[i];
    pos.x += vel.vx;
    pos.y += vel.vy;
    pos.z += vel.vz;
    if (pos.x < -20 || pos.x > 20) vel.vx *= -1;
    if (pos.y < -20 || pos.y > 20) vel.vy *= -1;
    if (pos.z < -10 || pos.z > 5) vel.vz *= -1;

    dummy.position.set(pos.x, pos.y, pos.z);
    dummy.updateMatrix();
    particlesInstanced.setMatrixAt(i, dummy.matrix);
  }
  particlesInstanced.instanceMatrix.needsUpdate = true;

  if (wireframeShapes.length < 3) {
    while (wireframeShapes.length < 3) {
      spawnWireframeShape();
    }
  } else if (wireframeShapes.length < 6) {
    if (Math.random() < 0.005) {
      spawnWireframeShape();
    }
  }

  for (let i = wireframeShapes.length - 1; i >= 0; i--) {
    const shape = wireframeShapes[i];
    shape.lifetime += 0.016;

    if (shape.lifetime < fadeInTime) {
      shape.mesh.material.opacity = THREE.MathUtils.clamp(shape.lifetime / fadeInTime, 0, 1);
    }
    else if (shape.lifetime < shape.maxLifetime - fadeOutTime) {
      shape.mesh.material.opacity = 1;
    }
    else {
      shape.mesh.material.opacity = THREE.MathUtils.clamp((shape.maxLifetime - shape.lifetime) / fadeOutTime, 0, 1);
    }

    shape.mesh.rotation.x += 0.0003;
    shape.mesh.rotation.y += 0.0003;

    shape.mesh.position.add(shape.velocity);

    if (shape.lifetime > shape.maxLifetime) {
      occupiedSpawnPoints[shape.spawnIndex] = false;
      scene.remove(shape.mesh);
      wireframeShapes.splice(i, 1);
    }
  }

  renderer.autoClear = false;
  renderer.clear();
  renderer.render(bgScene, bgCamera);
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  bgUniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
});

// MAIN
var currentLanguage = 'en';
var current_card;
var title;
var description;
var is_detail = false;

document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".contact-form");
  const inputs = form.querySelectorAll("input, textarea");
  const successMessage = document.getElementById("success");
  const backButton = document.getElementById("back");

  inputs.forEach(input => {
    input.addEventListener("input", () => validateField(input));
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    let valid = true;
    inputs.forEach(input => {
      if (!validateField(input)) valid = false;
    });
    if (!valid) return;

    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        form.style.display = "none";
        successMessage.style.display = "block";
        backButton.style.display = "inline-block";
      } else {
        if (currentLanguage == "en") {
          alert("An error occurred while sending. Please try again later.");
        } else "Beim Senden ist ein Fehler aufgetreten. Bitte versuche es später erneut."
      }
    } catch (error) {
      if (currentLanguage == "en") {
        alert("Failed Connection.");
      } else alert("Es ist ein Verbindungsfehler aufgetreten.")
    }
  });

  function validateField(field) {
    const errorSpan = field.parentElement.querySelector(".error-message");
    let valid = true;

    if (field.type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value.trim())) {
        if (currentLanguage == "en") {
          errorSpan.textContent = "Please enter a valid email address.";
        } else "Bitte eine gültige E-Mail Adresse eingeben.";
        valid = false;
      }
    } else {
      if (!field.value.trim()) {
        if (currentLanguage == "en") {
          errorSpan.textContent = "This field cannot be empty.";
        } else "Dieses Feld darf nicht leer sein.";
        valid = false;
      }
    }

    if (valid) {
      field.classList.remove("invalid");
      field.classList.add("valid");
      errorSpan.textContent = "";
    } else {
      field.classList.add("invalid");
      field.classList.remove("valid");
    }

    return valid;
  }

  let currentDetailSlide = 0;

  function updateSlideIndicator(total, current) {
    document.getElementById('slide-indicator').innerText = `Bild ${current + 1} von ${total}`;
  }

  function updateActiveThumbnail(activeIndex) {
    document.querySelectorAll('#thumbnail-overview img').forEach((img, index) => {
      if (index === activeIndex) {
        img.classList.add('active');
      } else {
        img.classList.remove('active');
      }
    });
  }

  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => {

      current_card = card;
      is_detail = true;
      if (currentLanguage == "en") {
        title = card.getAttribute('data-title-en');
      } else title = card.getAttribute('data-title-de');
      if (currentLanguage == "en") {
        description = card.getAttribute('data-description-en');
      } else description = card.getAttribute('data-description-de');
      const imagesData = card.getAttribute('data-images');
      const images = imagesData.split(',').map(src => src.trim());
      const link = card.getAttribute('data-link');

      document.getElementById('detail-title').innerText = title;
      document.getElementById('detail-description').innerText = description;
      document.getElementById('detail-link').setAttribute("href", link);

      const wrapper = document.querySelector('.carousel-wrapper-detail');
      wrapper.innerHTML = '';
      const thumbnailOverview = document.getElementById('thumbnail-overview');
      thumbnailOverview.innerHTML = '';

      images.forEach((src, index) => {

        const imgElement = document.createElement('img');
        imgElement.src = src;
        imgElement.alt = title;
        wrapper.appendChild(imgElement);

        const thumbImg = document.createElement('img');
        thumbImg.src = src;
        thumbImg.alt = title;
        thumbImg.dataset.index = index;
        if (index === 0) {
          thumbImg.classList.add('active');
        }
        thumbnailOverview.appendChild(thumbImg);
      });

      currentDetailSlide = 0;
      wrapper.style.transform = 'translateX(0%)';
      updateSlideIndicator(images.length, currentDetailSlide);


      document.querySelectorAll('#thumbnail-overview img').forEach(thumb => {
        thumb.addEventListener('click', (e) => {
          const targetIndex = parseInt(e.target.dataset.index);
          currentDetailSlide = targetIndex;
          gsap.to(wrapper, {
            x: -currentDetailSlide * 100 + '%',
            duration: 0.5,
            ease: 'power2.inOut'
          });
          updateSlideIndicator(images.length, currentDetailSlide);
          updateActiveThumbnail(targetIndex);
        });
      });

      gsap.to("#project-overview", {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          gsap.delayedCall(2, () => {
            ScrollTrigger.refresh();
          });
          document.getElementById("project-wip").style.display = "none"; // Can be deleted soon 
          document.getElementById("project-headline").style.display = "none";
          document.getElementById("project-overview").style.display = "none";
          document.getElementById("project-detail").style.display = "block";
          gsap.fromTo("#project-detail", { opacity: 0 }, { opacity: 1, duration: 0.5 });
        }
      });
      // If detail section visible
      const projectDetail = document.getElementById('back-to-overview');
      setTimeout(() => {
        projectDetail.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 2000);
    });
  });

  const leftOverlay = document.querySelector('.left-overlay');
  const rightOverlay = document.querySelector('.right-overlay');

  leftOverlay.addEventListener('click', () => {
    const slides = document.querySelectorAll('.carousel-wrapper-detail img');
    const totalSlides = slides.length;
    currentDetailSlide = (currentDetailSlide - 1 + totalSlides) % totalSlides;
    gsap.to(document.querySelector('.carousel-wrapper-detail'), {
      x: -currentDetailSlide * 100 + '%',
      duration: 0.5,
      ease: 'power2.inOut'
    });
    updateSlideIndicator(totalSlides, currentDetailSlide);
    updateActiveThumbnail(currentDetailSlide);
  });

  rightOverlay.addEventListener('click', () => {
    const slides = document.querySelectorAll('.carousel-wrapper-detail img');
    const totalSlides = slides.length;
    currentDetailSlide = (currentDetailSlide + 1) % totalSlides;
    gsap.to(document.querySelector('.carousel-wrapper-detail'), {
      x: -currentDetailSlide * 100 + '%',
      duration: 0.5,
      ease: 'power2.inOut'
    });
    updateSlideIndicator(totalSlides, currentDetailSlide);
    updateActiveThumbnail(currentDetailSlide);
  });

  document.getElementById('back-to-overview').addEventListener('click', () => {
    is_detail = false;
    gsap.to("#project-detail", {
      opacity: 0,
      duration: 0.5,
      onComplete: () => {
        gsap.delayedCall(0.5, () => {
          ScrollTrigger.refresh();
        });
        document.getElementById("project-wip").style.display = "block"; // Can be deleted soon 
        document.getElementById("project-headline").style.display = "block";
        document.getElementById("project-detail").style.display = "none";
        document.getElementById("project-overview").style.display = "grid";
        gsap.fromTo("#project-overview", { opacity: 0 }, { opacity: 1, duration: 0.5 });
      }
    });
  });

  // Arrows
  const overlayLeft = document.querySelector('.left-overlay');
  const overlayRight = document.querySelector('.right-overlay');
  const arrowLeft = document.getElementById('arrowLeft');
  const arrowRight = document.getElementById('arrowRight')

  overlayLeft.addEventListener('mouseenter', () => {
    arrowLeft.style.textShadow = '0 0 15px rgba(0, 255, 198, 0.5)';
  });

  overlayLeft.addEventListener('mouseleave', () => {
    arrowLeft.style.color = '';
    arrowLeft.style.textShadow = '';
  });

  overlayRight.addEventListener('mouseenter', () => {
    arrowRight.style.textShadow = '0 0 15px rgba(0, 255, 198, 0.5)';
  });

  overlayRight.addEventListener('mouseleave', () => {
    arrowRight.style.color = '';
    arrowRight.style.textShadow = '';
  });


});

const translationsNavigation = {
  en: {
    home: 'Home',
    about: 'About Me',
    projects: 'Projects',
    contact: 'Contact',
    privacy: 'Privacy Policy',
    imprint: 'Imprint'
  },
  de: {
    home: 'Startseite',
    about: 'Über mich',
    projects: 'Projekte',
    contact: 'Kontakt',
    privacy: 'Datenschutzerklärung',
    imprint: 'Impressum'
  }
};
const translationH1 = text.h1;
const translationH2 = text.h2;
const translationH3 = text.h3;
const translationP = text.p;
const translationBtn = text.btn;
const translationLabel = text.label;

function updateDetailLanguage() {
  if (is_detail) {
    if (currentLanguage == "en") {
      document.getElementById('detail-title').innerText = current_card.getAttribute('data-title-en');
      document.getElementById('detail-description').innerText = current_card.getAttribute('data-description-en');
    } else {
      document.getElementById('detail-title').innerText = current_card.getAttribute('data-title-de');
      document.getElementById('detail-description').innerText = current_card.getAttribute('data-description-de');
    }
    console.log("Works")
  }
  console.log(is_detail)
}

document.getElementById('de-flag').addEventListener('click', () => {
  currentLanguage = 'de';
  updateLanguage();
  updateDetailLanguage();
});

document.getElementById('en-flag').addEventListener('click', () => {
  currentLanguage = 'en';
  updateLanguage();
  updateDetailLanguage();
});

function updateLanguage() {
  const spanElement = document.createElement("span");
  spanElement.textContent = "Lukas Maximilian Kodalle"
  spanElement.className = "highlight"

  document.querySelectorAll('.nav-links a').forEach(link => {
    const key = link.getAttribute('data-key');
    if (key) link.textContent = translationsNavigation[currentLanguage][key];
  });
  document.querySelectorAll('.footer li a').forEach(link => {
    const key = link.getAttribute('data-key');
    if (key) link.textContent = translationsNavigation[currentLanguage][key];
  });
  document.querySelectorAll('h1').forEach(h1 => {
    const key = h1.getAttribute('data-key');
    if (key) h1.textContent = translationH1[currentLanguage][key];
    if (key == "hero") {
      h1.appendChild(spanElement);
      gsap.fromTo(".hero h1 span",
        {
          textShadow: "0 0 0 rgba(0, 255, 198, 0)"
        },
        {
          textShadow: "0 0 30px rgba(0, 255, 198, 0.5)",
          duration: 3,
          delay: 0,
          ease: "power2.out"
        }
      )
    }
  });
  document.querySelectorAll('h2').forEach(h2 => {
    const key = h2.getAttribute('data-key');
    if (key) h2.textContent = translationH2[currentLanguage][key];
  });
  document.querySelectorAll('h3').forEach(h3 => {
    const key = h3.getAttribute('data-key');
    if (key) h3.textContent = translationH3[currentLanguage][key];
  });
  document.querySelectorAll('p').forEach(p => {
    const key = p.getAttribute('data-key');
    if (key) p.innerHTML = translationP[currentLanguage][key]
  });
  document.querySelectorAll('.btn').forEach(btn => {
    const key = btn.getAttribute('data-key');
    if (key) btn.textContent = translationBtn[currentLanguage][key]
  });
  document.querySelectorAll('label').forEach(label => {
    const key = label.getAttribute('data-key');
    if (key) label.textContent = translationLabel[currentLanguage][key]
  });
  // Language Change in URL
  document.documentElement.lang = currentLanguage;
}

gsap.fromTo(".hero h1", { opacity: 0, filter: "blur(20px)" }, { opacity: 1, y: "-5vh", filter: "blur(0px)", duration: 2.5, ease: "power2.out" });
gsap.fromTo(".hero p", { opacity: 0, filter: "blur(20px)" }, { opacity: 1, y: "-5vh", filter: "blur(0px)", duration: 2, delay: 1, ease: "power2.out" });
gsap.fromTo(".hero h1 span",
  {
    textShadow: "0 0 0 rgba(0, 255, 198, 0)"
  },
  {
    textShadow: "0 0 30px rgba(0, 255, 198, 0.5)",
    duration: 3,
    delay: 2,
    ease: "power2.out"
  }
);
gsap.fromTo(".hero .btn",
  {
    opacity: 0,
    filter: "blur(20px)",
    //boxShadow: "0 0 0 rgba(0, 255, 198, 0)"
  },
  {
    opacity: 1,
    filter: "blur(0px)",
    //boxShadow: "0 0px 30px rgba(0, 255, 198, 0.5)",
    duration: 2,
    delay: 2,
    ease: "power2.out"
  }
); // WIP TEMPORARY
gsap.fromTo(".wip-header",
  {
    opacity: 0,
    filter: "blur(20px)",
  },
  {
    opacity: 1,
    filter: "blur(0px)",
    duration: 2,
    delay: 2.5,
    ease: "power2.out"
  }
);
gsap.fromTo("section .btn",
  {
    filter: "blur(20px)",
    //boxShadow: "0 0 0 rgba(0, 255, 198, 0)"
  },
  {
    filter: "blur(0px)",
    //boxShadow: "0 0 15px rgba(0, 255, 198, 0.5)",
    duration: 2,
    ease: "power2.out"
  }
);
gsap.fromTo(".contact img",
  {
    opacity: 0,
    filter: "blur(15px)",
  },
  {
    opacity: 1,
    filter: "blur(0px)",
    duration: 2,
    delay: 1,
    ease: "power2.out"
  }
)
gsap.fromTo("section h2",
  {
    textShadow: "0 0 0 rgba(0, 255, 198, 0)"
  },
  {
    textShadow: "0 0 30px rgba(0, 255, 198, 0.5)",
    duration: 3,
    delay: 2,
    ease: "power2.out"
  }
);
gsap.utils.toArray("section").forEach(section => {
  gsap.fromTo(
    section,
    {
      opacity: 0,
      filter: "blur(15px)",
    },
    {
      opacity: 1,
      filter: "blur(0px)",
      duration: 1,
      immediateRender: true,
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play reverse play reverse",
        markers: true
      }
    }
  );
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    target.scrollIntoView({ behavior: 'smooth' });
  });
});

// Active Link
window.addEventListener("scroll", () => {
  let scrollPos = window.scrollY + window.innerHeight / 2;
  document.querySelectorAll("nav a").forEach(link => {
    let section = document.querySelector(link.getAttribute("href"));
    if (section.offsetTop <= scrollPos && section.offsetTop + section.offsetHeight > scrollPos) {
      document.querySelectorAll("nav a").forEach(el => el.classList.remove("active"));
      link.classList.add("active");
    }
  });
});

// Hamburger Menu
const menuToggle = document.createElement('div');
menuToggle.classList.add('menu-toggle');
menuToggle.innerHTML = "☰";
document.querySelector('.navbar').appendChild(menuToggle);

const navLinks = document.querySelector('.nav-links');
menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});