import * as THREE from "three";

function seededRandom(seed: number): () => number {
  let value = seed;
  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let result = Math.imul(value ^ (value >>> 15), 1 | value);
    result = (result + Math.imul(result ^ (result >>> 7), 61 | result)) ^ result;
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function paintTexture(
  size: number,
  paint: (context: CanvasRenderingContext2D, random: () => number) => void,
  repeat: [number, number] = [1, 1],
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  const random = seededRandom(20261109);

  if (context) paint(context, random);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat[0], repeat[1]);
  texture.anisotropy = 4;
  return texture;
}

let woodTexture: THREE.CanvasTexture | null = null;
let skinTexture: THREE.CanvasTexture | null = null;
let rattanTexture: THREE.CanvasTexture | null = null;

function getWoodTexture(): THREE.CanvasTexture {
  if (woodTexture) return woodTexture;

  woodTexture = paintTexture(512, (context, random) => {
    const gradient = context.createLinearGradient(0, 0, 512, 0);
    gradient.addColorStop(0, "#5f351e");
    gradient.addColorStop(0.32, "#8a532c");
    gradient.addColorStop(0.58, "#a86b3c");
    gradient.addColorStop(0.8, "#7c4826");
    gradient.addColorStop(1, "#4f2b18");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 512);

    for (let line = 0; line < 130; line += 1) {
      const x = random() * 512;
      context.beginPath();
      context.strokeStyle = `rgba(38, 20, 10, ${0.04 + random() * 0.14})`;
      context.lineWidth = 0.6 + random() * 1.8;
      for (let y = 0; y <= 512; y += 16) {
        const wobble = Math.sin(y * 0.02 + line) * (2 + random() * 5);
        if (y === 0) context.moveTo(x + wobble, y);
        else context.lineTo(x + wobble, y);
      }
      context.stroke();
    }

    for (let knot = 0; knot < 6; knot += 1) {
      const x = 60 + random() * 390;
      const y = 60 + random() * 390;
      context.strokeStyle = "rgba(45, 24, 12, 0.35)";
      context.lineWidth = 1.4;
      for (let ring = 1; ring < 4; ring += 1) {
        context.beginPath();
        context.ellipse(x, y, ring * 7, ring * 18, 0.3, 0, Math.PI * 2);
        context.stroke();
      }
    }
  }, [2, 3]);

  return woodTexture;
}

function getSkinTexture(): THREE.CanvasTexture {
  if (skinTexture) return skinTexture;

  skinTexture = paintTexture(512, (context, random) => {
    const gradient = context.createRadialGradient(256, 226, 20, 256, 256, 280);
    gradient.addColorStop(0, "#ead7ad");
    gradient.addColorStop(0.55, "#d8bd8b");
    gradient.addColorStop(0.85, "#b99462");
    gradient.addColorStop(1, "#8e6a43");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 512);

    for (let speck = 0; speck < 900; speck += 1) {
      const x = random() * 512;
      const y = random() * 512;
      const radius = 0.4 + random() * 1.9;
      context.beginPath();
      context.fillStyle = `rgba(84, 54, 28, ${0.02 + random() * 0.09})`;
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }

    for (let ring = 0; ring < 9; ring += 1) {
      context.beginPath();
      context.strokeStyle = `rgba(120, 82, 44, ${0.04 + random() * 0.05})`;
      context.lineWidth = 1 + random() * 2;
      context.arc(256, 256, 40 + ring * 26 + random() * 8, 0, Math.PI * 2);
      context.stroke();
    }
  });

  return skinTexture;
}

function getRattanTexture(): THREE.CanvasTexture {
  if (rattanTexture) return rattanTexture;

  rattanTexture = paintTexture(256, (context, random) => {
    context.fillStyle = "#b48a56";
    context.fillRect(0, 0, 256, 256);

    for (let line = -256; line < 512; line += 18) {
      context.beginPath();
      context.strokeStyle = `rgba(75, 48, 24, ${0.18 + random() * 0.2})`;
      context.lineWidth = 2 + random() * 2;
      context.moveTo(line, 0);
      context.lineTo(line + 256, 256);
      context.stroke();
    }

    for (let speck = 0; speck < 160; speck += 1) {
      context.fillStyle = `rgba(255, 225, 170, ${0.03 + random() * 0.08})`;
      context.fillRect(random() * 256, random() * 256, 2, 2);
    }
  }, [3, 3]);

  return rattanTexture;
}

export function woodMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    map: getWoodTexture(),
    color: new THREE.Color("#dda977"),
    roughness: 0.62,
    metalness: 0.04,
    envMapIntensity: 0.7,
  });
}

export function darkWoodMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    map: getWoodTexture(),
    color: new THREE.Color("#8a5732"),
    roughness: 0.7,
    metalness: 0.03,
    envMapIntensity: 0.6,
  });
}

export function skinMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    map: getSkinTexture(),
    color: new THREE.Color("#f0dfb8"),
    roughness: 0.74,
    metalness: 0.02,
  });
}

export function brassMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color("#e2b466"),
    roughness: 0.34,
    metalness: 0.82,
    envMapIntensity: 1.6,
  });
}

export function rattanMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    map: getRattanTexture(),
    color: new THREE.Color("#d3a86c"),
    roughness: 0.82,
    metalness: 0.02,
  });
}

export function clothMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color("#b85f43"),
    roughness: 0.9,
    metalness: 0,
  });
}

export function darkMetalMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color("#28332c"),
    roughness: 0.55,
    metalness: 0.7,
  });
}
