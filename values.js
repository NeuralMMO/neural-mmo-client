export {Values};

//var worldWidth = 256, worldDepth = 256,
//worldHalfWidth = worldWidth / 2, worldHalfDepth = worldDepth / 2;
var width  = 80;
var height = 80;
var resolution = 3;

class Values{
   constructor(map, values, engine) {
       /*
        * Adds terrain which shades water, grass, dirt, and mountains
        * based on a heightmap given by the server.
        */
      this.nTiles = map.length;
      this.mapSz = this.nTiles*tileSz;

      this.loader = new THREE.TextureLoader();
      //this.axes(engine)
      this.water(map, engine)
      this.terr(map, values, engine)
  }

   valueTex(map){
      var tileMap = this.generateVals(map);
      var tileTexture = this.dataTexture(tileMap, width, height);
      return tileTexture
   }

   terr(map, values, engine) {
      var bumpMap = this.generateHeight(map);
      var bumpTexture = this.dataTexture(bumpMap, width, height);

      var tileMap = this.generateFlat(map);
      var tileTexture = this.dataTexture(tileMap, width, height);

      var valueTex    = this.valueTex(values);

      var sandyTexture  = this.texture('resources/images/sand-512.jpg');
      var scrubTexture  = this.texture('resources/tiles/scrub.png' );
      var forestTexture = this.texture('resources/tiles/forest.png' );
      var lavaTexture   = this.texture('resources/tiles/lava.png' );
      var stoneTexture  = this.texture('resources/tiles/stone.png' );
      var grassTexture  = this.texture('resources/tiles/grass.png' );

      // use "this." to create global object
      var custUniforms = {
         bumpTexture:   { type: "t", value: bumpTexture },
         tileTexture:   { type: "t", value: tileTexture },
         valueTex:      { type: "t", value: valueTex},
         tileScale:     { type: "f", value: tileSz},
         sandyTexture:  { type: "t", value: sandyTexture },
         grassTexture:  { type: "t", value: grassTexture },
         forestTexture: { type: "t", value: forestTexture},
         lavaTexture:   { type: "t", value: lavaTexture},
         scrubTexture:  { type: "t", value: scrubTexture},
         stoneTexture:  { type: "t", value: stoneTexture},
      };
      var customUniforms = Object.assign( 
            custUniforms, THREE.ShaderLib.phong.uniforms);

      var vertShader = document.getElementById(
            'phongValueVertexShader').textContent;
      var fragShader = document.getElementById(
            'phongValueFragmentShader').textContent;
 
      var customMaterial = new THREE.ShaderMaterial(
      {
         uniforms: customUniforms,
         vertexShader: vertShader,   
         fragmentShader: fragShader,
         name: 'custom-material',
         lights: true,
      });
      this.customMaterial = customMaterial;
      //customMaterial.needsUpdate = true;

      var planeGeo = new THREE.PlaneGeometry(
            this.mapSz, this.mapSz, width*resolution, height*resolution);
      planeGeo.applyMatrix(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), -Math.PI/2, 0, 0));
      planeGeo.applyMatrix(new THREE.Matrix4().makeTranslation(this.mapSz/2, 0, this.mapSz/2));
      var plane = new THREE.Mesh(planeGeo, customMaterial);
      plane.castShadow = true;
      plane.receiveShadow = true;
      engine.scene.add( plane );
      engine.mesh = plane;
   }


   water(map, engine) {
      var waterTiles = this.nTiles-2
      var waterSz = waterTiles*tileSz; 
      var waterTex = this.loader.load( 'three.js/examples/textures/waternormals.jpg' );
      waterTex.wrapS = waterTex.wrapT = THREE.RepeatWrapping;
 
      var waterGeo = new THREE.PlaneBufferGeometry(
            waterSz, waterSz);
      //      waterSz, waterSz, waterTiles*resolution, waterTiles*resolution);
      var water = new THREE.Water(waterGeo, {
         textureWidth: 512,
         textureHeight: 512,
         waterNormals: waterTex,
         alpha: 1.0,
         sunDirection: THREE.Vector3(0, 1, 0),
         sunColor: 0xffffff,
         waterColor: 0x001e0f,
         distortionScale: 3.7,
         fog: engine.scene.fog !== undefined
      });

      /*
      var waterTex = this.loader.load( 'resources/tiles/water.png' );
      waterTex.wrapS = waterTex.wrapT = THREE.RepeatWrapping;
      waterTex.repeat.set(50,50);
      var waterMat = new THREE.MeshPhongMaterial( {
           map: waterTex, transparent:true, opacity:0.75} );
      var water = new THREE.Mesh(   waterGeo, waterMat );
      */
      water.rotation.x = -Math.PI / 2;
      water.position.y = 3*tileSz/4;
      water.position.x = this.mapSz / 2;
      water.position.z = this.mapSz / 2;
      this.water = water;
      engine.scene.add( water);
   }
   texture(fname) {
      var texture = this.loader.load(fname);
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      return texture
   }

   dataTexture(map, width, height) {
      var texture = new THREE.DataTexture(
               map, width, height, THREE.RGBFormat);
      texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.needsUpdate = true;
      return texture
   }

   axes(engine) {
      var length = 64*this.nTiles;
      var axisSz = tileSz;
      var xGeometry = new THREE.CubeGeometry( length, 2*axisSz, axisSz);
      var xMaterial = new THREE.MeshBasicMaterial( {
           color: 0xff0000} );
      var xMesh = new THREE.Mesh( xGeometry, xMaterial );
      xMesh.position.x = length / 2;
      xMesh.position.y = tileSz;
      xMesh.position.z = -tileSz/2;
      engine.scene.add(xMesh);

      var zGeometry = new THREE.CubeGeometry( axisSz, 2*axisSz, length);
      var zMaterial = new THREE.MeshBasicMaterial( {
           color: 0x00ff00} );
      var zMesh = new THREE.Mesh( zGeometry, zMaterial );
      zMesh.position.z = length / 2;
      zMesh.position.x = -tileSz/2;
      zMesh.position.y = tileSz;
      engine.scene.add(zMesh);

      var yGeometry = new THREE.CubeGeometry( axisSz, length, axisSz);
      var yMaterial = new THREE.MeshBasicMaterial( {
           color: 0x0000ff } );
      var yMesh = new THREE.Mesh( yGeometry, yMaterial );
      engine.scene.add(yMesh);
      yMesh.position.y = length / 2;
      yMesh.position.x = -tileSz/2;
      yMesh.position.z = -tileSz/2;

      var aGeometry = new THREE.CubeGeometry( 5+2*axisSz, 5+2*axisSz, 5+2*axisSz);
      var aMaterial = new THREE.MeshBasicMaterial( {
           color: 0x000000 } );
      var aMesh = new THREE.Mesh( aGeometry, aMaterial );
      engine.scene.add(aMesh);
      aMesh.position.y = tileSz;
   }

   generateHeight(map) {
      var mapSz = map.length;
      var data = new Uint8Array( 3*resolution*mapSz*mapSz );
      var k = 0;
      var val;
      for ( var r = 0; r <  mapSz; r ++ ) {
         for ( var c = 0; c < mapSz; c ++ ) {
            val = tileHeights[map[r][c]];
            data[k] = val;
            data[k+1] = val;
            data[k+2] = val;
            k += 3;
         }
      }
      return data
   }

   generateVals(map) {
      var mapSz = map.length;
      var data = new Uint8Array( 3*mapSz*mapSz );
      var k = 0;
      for ( var r = 0; r < mapSz; r ++ ) {
         for ( var c = 0; c < mapSz; c ++ ) {
            data[k] = map[r][c][0];
            data[k+1] = map[r][c][1];
            data[k+2] = map[r][c][2];
            k += 3;
         }
      }
      return data;
   }

   generateFlat(map) {
      var mapSz = map.length;
      var data = new Uint8Array( 3*mapSz*mapSz );
      var k = 0;
      for ( var r = 0; r < mapSz; r ++ ) {
         for ( var c = 0; c < mapSz; c ++ ) {
            data[k] = map[r][c];
            data[k+1] = map[r][c];
            data[k+2] = map[r][c];
            k += 3;
         }
      }
      return data;
   }

  update(map, counts) {
      var tileMap = this.generateFlat(map);
      var tileTexture = new THREE.DataTexture(
               tileMap, width, height, THREE.RGBFormat);
      tileTexture.wrapS = tileTexture.wrapT = THREE.ClampToEdgeWrapping;
      tileTexture.needsUpdate = true;
      this.customMaterial.uniforms.tileTexture.value = tileTexture;

      var countMap = this.generateFlat(counts);
      var countTexture = new THREE.DataTexture(
               countMap, width, height, THREE.RGBFormat);
      countTexture.wrapS = countTexture.wrapT = THREE.ClampToEdgeWrapping;
      countTexture.needsUpdate = true;
  }

   updateFast(){
      this.water.material.uniforms.time.value += 1.0 / 60.0;
      this.water.needsUpdate = true;
   }

}