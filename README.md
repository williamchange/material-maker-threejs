# material-maker-threejs


Basic three.js viewer for Material Maker (Standard PBR Material)

[Live Demo](https://williamchange.github.io/projects/mmthreejs/)

## Screenshot


## Export Target
Custom export target is used in Material Maker (download [here](https://raw.githubusercontent.com/williamchange/material-maker-threejs/refs/heads/master/mm_target/meshstandardmat.mme)) which creates a ([MeshStandardMaterial](https://threejs.org/docs/#api/en/materials/MeshStandardMaterial)) .json file with associated textures, and can be imported using [MaterialLoader](https://threejs.org/docs/#api/en/loaders/MaterialLoader) (not directly, textures are still loaded seperately) in three.js

## Running the project

The following should give you a local development server which runs on http://localhost:XXXX, which you can then run in your browser

```text
npm install
npx vite
```

## Limitation

Currently the following are exported (more to be added):
- Albedo
- Roughness Map
- Metalic Map
- Normal
- Ambient Occulusion
- Depth (Displacement/Height Map)

## Links

Materials (CC0) by [Pavel Oliva](https://x.com/pavel_Oliva)
- [Celestial Floor](https://materialmaker.org/material?id=751)
- [Seigaiha Cobblestone](https://materialmaker.org/material?id=982)
- [Mossy Rooftiles](https://materialmaker.org/material?id=1088)

[Epping Forest 1K](https://polyhaven.com/a/epping_forest_01) via [Polyhaven](https://dev.polyhaven.com/) (CC0)

[Material Maker](https://github.com/RodZill4/material-maker/) Project by [RodzLabs](https://github.com/RodZill4)

[MeshStandardMaterial](https://threejs.org/docs/#api/en/materials/MeshStandardMaterial)