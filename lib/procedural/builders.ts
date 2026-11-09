import * as THREE from "three";
import type { InstrumentId } from "@/content/instruments";
import {
  brassMaterial,
  clothMaterial,
  darkMetalMaterial,
  darkWoodMaterial,
  rattanMaterial,
  skinMaterial,
  woodMaterial,
} from "./materials";

function addMesh(
  parent: THREE.Object3D,
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  name: string,
): THREE.Mesh {
  const mesh = new THREE.Mesh(geometry, material.clone());
  mesh.name = name;
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  parent.add(mesh);
  return mesh;
}

function addTube(
  parent: THREE.Object3D,
  points: THREE.Vector3[],
  radius: number,
  material: THREE.Material,
  name: string,
): THREE.Mesh {
  const curve = new THREE.CatmullRomCurve3(points);
  const geometry = new THREE.TubeGeometry(curve, 26, radius, 5, false);
  return addMesh(parent, geometry, material, name);
}

function addRing(
  parent: THREE.Object3D,
  radius: number,
  tube: number,
  y: number,
  material: THREE.Material,
  name: string,
  rotationX = Math.PI / 2,
): THREE.Mesh {
  const mesh = addMesh(
    parent,
    new THREE.TorusGeometry(radius, tube, 8, 48),
    material,
    name,
  );
  mesh.rotation.x = rotationX;
  mesh.position.y = y;
  return mesh;
}

function addStand(
  parent: THREE.Object3D,
  radius: number,
  height: number,
  material: THREE.Material,
  name: string,
): THREE.Group {
  const stand = new THREE.Group();
  stand.name = name;

  for (let index = 0; index < 4; index += 1) {
    const angle = (index / 4) * Math.PI * 2 + Math.PI / 4;
    const leg = addMesh(
      stand,
      new THREE.CylinderGeometry(0.035, 0.045, height, 8),
      material,
      name,
    );
    leg.position.set(
      Math.cos(angle) * radius * 0.66,
      height / 2,
      Math.sin(angle) * radius * 0.66,
    );
    leg.rotation.z = Math.cos(angle) * 0.16;
    leg.rotation.x = -Math.sin(angle) * 0.16;
  }

  const foot = addMesh(
    stand,
    new THREE.TorusGeometry(radius, 0.03, 6, 36),
    material,
    name,
  );
  foot.rotation.x = Math.PI / 2;
  foot.position.y = 0.02;

  parent.add(stand);
  return stand;
}

function buildGendangBeleq(): THREE.Group {
  const group = new THREE.Group();
  group.name = "gendang-beleq";

  const profile = [
    [0.5, 0.12],
    [0.56, 0.24],
    [0.7, 0.5],
    [0.79, 0.9],
    [0.81, 1.24],
    [0.75, 1.62],
    [0.65, 1.96],
    [0.57, 2.2],
    [0.54, 2.3],
  ].map(([radius, y]) => new THREE.Vector2(radius, y));

  const body = addMesh(
    group,
    new THREE.LatheGeometry(profile, 48),
    woodMaterial(),
    "badan",
  );
  body.position.y = 0;

  const headTop = addMesh(
    group,
    new THREE.CircleGeometry(0.54, 48),
    skinMaterial(),
    "kulit",
  );
  headTop.rotation.x = -Math.PI / 2;
  headTop.position.y = 2.302;

  const headBottom = addMesh(
    group,
    new THREE.CircleGeometry(0.505, 48),
    skinMaterial(),
    "kulit",
  );
  headBottom.rotation.x = Math.PI / 2;
  headBottom.position.y = 0.118;

  addRing(group, 0.555, 0.042, 2.3, darkWoodMaterial(), "kulit");
  addRing(group, 0.52, 0.04, 0.12, darkWoodMaterial(), "kulit");

  const ropeMaterial = rattanMaterial();
  for (let index = 0; index < 8; index += 1) {
    const angle = (index / 8) * Math.PI * 2;
    const next = angle + 0.42;
    addTube(
      group,
      [
        new THREE.Vector3(
          Math.cos(angle) * 0.55,
          2.26,
          Math.sin(angle) * 0.55,
        ),
        new THREE.Vector3(
          Math.cos(angle + 0.18) * 0.74,
          1.25,
          Math.sin(angle + 0.18) * 0.74,
        ),
        new THREE.Vector3(
          Math.cos(next) * 0.53,
          0.16,
          Math.sin(next) * 0.53,
        ),
      ],
      0.018,
      ropeMaterial,
      "tali",
    );
  }

  addStand(group, 0.96, 0.52, darkWoodMaterial(), "badan");

  const mallet = new THREE.Group();
  mallet.name = "pemukul";
  mallet.position.set(0.98, 0.18, 0.4);
  mallet.rotation.z = -0.52;

  const stick = addMesh(
    mallet,
    new THREE.CylinderGeometry(0.022, 0.028, 1.05, 8),
    darkWoodMaterial(),
    "pemukul",
  );
  stick.position.y = 0.55;

  const malletHead = addMesh(
    mallet,
    new THREE.SphereGeometry(0.105, 16, 12),
    clothMaterial(),
    "pemukul",
  );
  malletHead.position.y = 1.1;

  group.add(mallet);
  return group;
}

function buildGong(): THREE.Group {
  const group = new THREE.Group();
  group.name = "gong-oncer";

  const wood = darkWoodMaterial();
  const frame = new THREE.Group();
  frame.name = "gong";

  for (const side of [-1, 1]) {
    const post = addMesh(
      frame,
      new THREE.CylinderGeometry(0.055, 0.07, 2.45, 10),
      wood,
      "gong",
    );
    post.position.set(side * 1.22, 1.22, 0);
  }

  const beam = addMesh(
    frame,
    new THREE.CylinderGeometry(0.055, 0.055, 2.55, 10),
    wood,
    "gong",
  );
  beam.rotation.z = Math.PI / 2;
  beam.position.y = 2.45;

  for (const side of [-1, 1]) {
    const foot = addMesh(
      frame,
      new THREE.BoxGeometry(0.5, 0.08, 0.38),
      wood,
      "gong",
    );
    foot.position.set(side * 1.22, 0.04, 0);
  }

  const gong = new THREE.Group();
  gong.name = "gong";
  gong.position.y = 1.4;
  gong.position.z = 0.08;

  const disc = addMesh(
    gong,
    new THREE.CylinderGeometry(1.02, 1.02, 0.07, 64),
    brassMaterial(),
    "gong",
  );
  disc.rotation.x = Math.PI / 2;

  const rim = addMesh(
    gong,
    new THREE.TorusGeometry(1.015, 0.045, 10, 64),
    brassMaterial(),
    "gong",
  );
  rim.position.z = 0.035;

  const boss = addMesh(
    gong,
    new THREE.CylinderGeometry(0.27, 0.31, 0.13, 40),
    brassMaterial(),
    "pencu",
  );
  boss.rotation.x = Math.PI / 2;
  boss.position.z = 0.1;

  const bossRing = addMesh(
    gong,
    new THREE.TorusGeometry(0.29, 0.022, 8, 40),
    brassMaterial(),
    "pencu",
  );
  bossRing.position.z = 0.15;

  const hanger = addMesh(
    gong,
    new THREE.TorusGeometry(0.06, 0.014, 6, 18),
    rattanMaterial(),
    "gong",
  );
  hanger.position.y = 1.08;
  hanger.rotation.x = Math.PI / 2;

  frame.add(gong);

  const oncer = new THREE.Group();
  oncer.name = "oncer";
  oncer.position.y = 2.16;

  for (let index = 0; index < 5; index += 1) {
    const small = addMesh(
      oncer,
      new THREE.CylinderGeometry(0.17, 0.17, 0.05, 24),
      brassMaterial(),
      "oncer",
    );
    small.rotation.x = Math.PI / 2;
    small.position.set(-0.72 + index * 0.36, 0, 0);
  }

  frame.add(oncer);
  group.add(frame);
  return group;
}

function buildCilokaq(): THREE.Group {
  const group = new THREE.Group();
  group.name = "cilokaq";

  const body = addMesh(
    group,
    new THREE.BoxGeometry(0.88, 1.02, 0.24),
    woodMaterial(),
    "badan",
  );
  body.position.y = 0.72;

  const bodyEdge = addMesh(
    group,
    new THREE.BoxGeometry(0.98, 0.09, 0.29),
    darkWoodMaterial(),
    "badan",
  );
  bodyEdge.position.y = 1.2;

  const soundHole = addMesh(
    group,
    new THREE.TorusGeometry(0.12, 0.022, 8, 32),
    darkWoodMaterial(),
    "badan",
  );
  soundHole.position.set(0, 0.83, 0.125);

  const bridge = addMesh(
    group,
    new THREE.BoxGeometry(0.42, 0.07, 0.06),
    darkWoodMaterial(),
    "badan",
  );
  bridge.position.set(0, 0.68, 0.19);

  const neck = addMesh(
    group,
    new THREE.BoxGeometry(0.17, 1.28, 0.13),
    woodMaterial(),
    "leher",
  );
  neck.position.set(0, 1.84, 0.02);

  const head = addMesh(
    group,
    new THREE.BoxGeometry(0.34, 0.36, 0.14),
    darkWoodMaterial(),
    "leher",
  );
  head.position.set(0, 2.55, 0.02);

  for (let fret = 0; fret < 7; fret += 1) {
    const fretBar = addMesh(
      group,
      new THREE.BoxGeometry(0.19, 0.018, 0.025),
      brassMaterial(),
      "leher",
    );
    fretBar.position.set(0, 1.38 + fret * 0.14, 0.14);
  }

  for (let stringIndex = 0; stringIndex < 3; stringIndex += 1) {
    const string = addMesh(
      group,
      new THREE.CylinderGeometry(0.007, 0.007, 2.05, 6),
      brassMaterial(),
      "dawai",
    );
    string.position.set(-0.13 + stringIndex * 0.13, 1.48, 0.18);
  }

  for (const side of [-1, 1]) {
    const peg = addMesh(
      group,
      new THREE.CylinderGeometry(0.022, 0.022, 0.28, 8),
      brassMaterial(),
      "leher",
    );
    peg.rotation.z = Math.PI / 2;
    peg.position.set(side * 0.24, 2.5, 0.02);
  }

  addStand(group, 0.58, 0.34, darkWoodMaterial(), "badan");
  return group;
}

function buildSerune(): THREE.Group {
  const group = new THREE.Group();
  group.name = "serune";

  const body = addMesh(
    group,
    new THREE.CylinderGeometry(0.085, 0.14, 1.85, 24),
    woodMaterial(),
    "badan",
  );
  body.position.y = 1.12;

  const bellProfile = [
    [0.15, 0],
    [0.19, 0.11],
    [0.3, 0.26],
    [0.44, 0.42],
  ].map(([radius, y]) => new THREE.Vector2(radius, y));

  const bell = addMesh(
    group,
    new THREE.LatheGeometry(bellProfile, 32),
    woodMaterial(),
    "corong",
  );
  bell.position.y = 2.04;

  const mouthpiece = addMesh(
    group,
    new THREE.CylinderGeometry(0.035, 0.045, 0.18, 12),
    darkWoodMaterial(),
    "badan",
  );
  mouthpiece.position.y = 0.17;

  for (let hole = 0; hole < 6; hole += 1) {
    const fingerHole = addMesh(
      group,
      new THREE.CylinderGeometry(0.024, 0.024, 0.012, 12),
      darkMetalMaterial(),
      "lubang",
    );
    fingerHole.rotation.x = Math.PI / 2;
    fingerHole.position.set(0, 0.62 + hole * 0.2, 0.135);
  }

  for (const y of [0.62, 1.3, 1.86]) {
    const band = addRing(group, 0.145, 0.018, y, rattanMaterial(), "badan");
    band.scale.z = 0.8;
  }

  addStand(group, 0.5, 0.32, darkWoodMaterial(), "badan");
  return group;
}

function buildGenangDrum(): THREE.Group {
  const drum = new THREE.Group();
  drum.name = "genang";

  const profile = [
    [0.32, 0.05],
    [0.38, 0.18],
    [0.5, 0.45],
    [0.54, 0.68],
    [0.5, 0.92],
    [0.4, 1.1],
    [0.36, 1.18],
  ].map(([radius, y]) => new THREE.Vector2(radius, y));

  addMesh(drum, new THREE.LatheGeometry(profile, 36), woodMaterial(), "genang");

  const top = addMesh(
    drum,
    new THREE.CircleGeometry(0.36, 32),
    skinMaterial(),
    "genang",
  );
  top.rotation.x = -Math.PI / 2;
  top.position.y = 1.182;

  for (let index = 0; index < 6; index += 1) {
    const angle = (index / 6) * Math.PI * 2;
    addTube(
      drum,
      [
        new THREE.Vector3(Math.cos(angle) * 0.36, 1.17, Math.sin(angle) * 0.36),
        new THREE.Vector3(Math.cos(angle) * 0.52, 0.62, Math.sin(angle) * 0.52),
        new THREE.Vector3(
          Math.cos(angle + 0.3) * 0.34,
          0.08,
          Math.sin(angle + 0.3) * 0.34,
        ),
      ],
      0.014,
      rattanMaterial(),
      "genang",
    );
  }

  addStand(drum, 0.52, 0.5, darkWoodMaterial(), "genang");
  return drum;
}

function buildGongGenang(): THREE.Group {
  const group = new THREE.Group();
  group.name = "gong-genang";

  const gong = buildGong();
  gong.scale.setScalar(0.7);
  gong.position.set(-0.62, 0, 0.05);
  group.add(gong);

  const drum = buildGenangDrum();
  drum.scale.setScalar(0.86);
  drum.position.set(0.92, 0.02, 0.2);
  group.add(drum);

  return group;
}

function buildSilu(): THREE.Group {
  const group = new THREE.Group();
  group.name = "silu";

  const body = addMesh(
    group,
    new THREE.CylinderGeometry(0.055, 0.075, 1.9, 20),
    darkWoodMaterial(),
    "badan",
  );
  body.position.y = 1.14;

  const bellProfile = [
    [0.075, 0],
    [0.09, 0.12],
    [0.18, 0.3],
    [0.3, 0.48],
  ].map(([radius, y]) => new THREE.Vector2(radius, y));

  const bell = addMesh(
    group,
    new THREE.LatheGeometry(bellProfile, 32),
    woodMaterial(),
    "corong",
  );
  bell.position.y = 2.08;

  const mouthpiece = addMesh(
    group,
    new THREE.CylinderGeometry(0.028, 0.04, 0.16, 12),
    rattanMaterial(),
    "badan",
  );
  mouthpiece.position.y = 0.17;

  for (let hole = 0; hole < 5; hole += 1) {
    const fingerHole = addMesh(
      group,
      new THREE.CylinderGeometry(0.019, 0.019, 0.012, 12),
      darkMetalMaterial(),
      "lubang",
    );
    fingerHole.rotation.x = Math.PI / 2;
    fingerHole.position.set(0, 0.7 + hole * 0.21, 0.07);
  }

  for (const y of [0.6, 1.4, 1.98]) {
    const band = addRing(group, 0.085, 0.014, y, rattanMaterial(), "badan");
    band.scale.z = 0.8;
  }

  addStand(group, 0.36, 0.26, darkWoodMaterial(), "badan");
  return group;
}

const builders: Record<InstrumentId, () => THREE.Group> = {
  gendang: buildGendangBeleq,
  gong: buildGong,
  cilokaq: buildCilokaq,
  serune: buildSerune,
  genang: buildGongGenang,
  silu: buildSilu,
};

export function buildInstrument(id: InstrumentId): THREE.Group {
  return builders[id]();
}

export function disposeObject(object: THREE.Object3D): void {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.geometry.dispose();
    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];
    materials.forEach((material) => material.dispose());
  });
}
