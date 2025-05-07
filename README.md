# material-maker-threejs

[Live Demo]()

basic three.js demo viewer for Material Maker (Standard PBR Material)

## Export Target
The custom target(download [here]()) creates a .json ([MeshStandardMaterial](https://threejs.org/docs/#api/en/materials/MeshStandardMaterial)) file with associated textures, which can be imported using [MaterialLoader](https://threejs.org/docs/#api/en/loaders/MaterialLoader) in three.js

PR to add the export target to Material Maker: [here]() (WIP!)

## Running

```text
npm install
npx vite
```
This runs a local development server at localhost:XXXX

## Building

```text
```

## Limitation
Currently the following are exported:
- Albedo
- Roughness Map
- Metalic Map
- Normal
- Ambient Occulusion
- Depth (Displacement/Height Map)

## Credits / Links
[Seigaiha Cobblestone]() Material by [Pavel Oliva](pavel_Oliva) (CC0)

[Epping Forest](https://polyhaven.com/a/epping_forest_01) via [Polyhaven](https://dev.polyhaven.com/) (CC0)

[Material Maker](https://github.com/RodZill4/material-maker/) Project by [RodzLabs](https://github.com/RodZill4)

[MeshStandardMaterial](https://threejs.org/docs/#api/en/materials/MeshStandardMaterial) Reference