import { Matrix4, Vector3, Vector4 } from "three";

let matrixRotation = new Matrix4().makeRotationX(90 * Math.PI / 180);
let matrixScale = new Matrix4().makeScale(10, 10, 10);
let vertex = new Vector3();
let geometry;

export function parse(mesh) {
  if (!mesh.isMesh) {
    console.warn('Mesh type unsupported', mesh);
    return;
  }

  debugger;
  geometry = mesh.geometry;

  if (geometry.isBufferGeometry) {
    var newGeometry = geometry.clone(geometry);
    var vertices = geometry.getAttribute('position');

    // vertices
    if (vertices !== undefined) {
      let verticesCount = vertices.count;
      if (geometry.morphTargetInfluences !== undefined && geometry.morphTargetInfluences.reduce((p, c) => p + c) > 0) {
        console.log(`morphed: ${geometry.name}`);
      } else {
        console.log(`not morphed: ${geometry.name}`);
      }
      for (let i = 0; i < verticesCount; i++) {
        vertex.x = vertices.getX(i);
        vertex.y = vertices.getY(i);
        vertex.z = vertices.getZ(i);

        if (geometry.skinIndexNames == undefined || geometry.skinIndexNames == 0) {
          vertex
            .applyMatrix4(mesh.matrixWorld)
            .applyMatrix4(matrixRotation)
            .applyMatrix4(matrixScale);
          newGeometry.attributes.position.setXYZ(i, vertex.x, vertex.y, vertex.z);
        } else {
          if (geometry.morphTargetInfluences !== undefined) {
            var morphVector = new Vector4(vertex.x, vertex.y, vertex.z);
            var tempMorph = new Vector4();

            for (var mt = 0; mt < geometry.morphAttributes.position.length; mt++) {
              if (geometry.morphTargetInfluences[mt] == 0) continue;
              if (geometry.morphTargetDictionary.hide == mt) continue;

              var morph = new Vector4(
                geometry.morphAttributes.position[mt].getX(i),
                geometry.morphAttributes.position[mt].getY(i),
                geometry.morphAttributes.position[mt].getZ(i));

              tempMorph.addScaledVector(morph.sub(morphVector), geometry.morphTargetInfluences[mt]);
            }
            morphVector.add(tempMorph);
          }

          let finalVector = new Vector4();
          for (let j = 0; j < geometry.skinIndexNames.length; j++) {
            //console.log(geometry.skinIndexNames)
            newFunction_1(i, j, mesh, morphVector, finalVector);
          }
          newGeometry.attributes.position.setXYZ(i, finalVector.x, finalVector.y, finalVector.z);
        }
      }
    }
  } else {
    console.warn('Geometry type unsupported', geometry);
  }

  return newGeometry;
}

function newFunction_1(i, j, mesh, morphVector, finalVector) {
  var skinIndices = geometry.getAttribute([geometry.skinIndexNames[j]]);
  var weights = geometry.getAttribute([geometry.skinWeightNames[j]]);

  var skinIndex = [
    skinIndices.getX(i),
    skinIndices.getY(i),
    skinIndices.getZ(i),
    skinIndices.getW(i)
  ];

  var skinWeight = [
    weights.getX(i),
    weights.getY(i),
    weights.getZ(i),
    weights.getW(i)
  ];

  var inverses = [
    mesh.skeleton.boneInverses[skinIndex[0]],
    mesh.skeleton.boneInverses[skinIndex[1]],
    mesh.skeleton.boneInverses[skinIndex[2]],
    mesh.skeleton.boneInverses[skinIndex[3]]
  ];

  var skinMatrices = [
    mesh.skeleton.bones[skinIndex[0]].matrixWorld,
    mesh.skeleton.bones[skinIndex[1]].matrixWorld,
    mesh.skeleton.bones[skinIndex[2]].matrixWorld,
    mesh.skeleton.bones[skinIndex[3]].matrixWorld
  ];

  for (var k = 0; k < 4; k++) {
    newFunction(morphVector, finalVector, skinWeight, inverses, skinMatrices, k);
  }
}

function newFunction(morphVector, finalVector, skinWeight, inverses, skinMatrices, k) {
  //var vectorToCopy = geometry.morphTargetInfluences !== undefined && geometry.morphTargetInfluences.reduce((p, c) => p + c) > 0
  //  ? morphVector
  //  : vertex;
  var vectorToCopy = vertex;
  var tempVector = new Vector4(vectorToCopy.x, vectorToCopy.y, vectorToCopy.z)
  tempVector.multiplyScalar(skinWeight[k]);
  //the inverse takes the vector into local bone space
  //which is then transformed to the appropriate world space
  tempVector
    .applyMatrix4(inverses[k])
    .applyMatrix4(skinMatrices[k])
    .applyMatrix4(matrixRotation)
    .applyMatrix4(matrixScale);
  finalVector.add(tempVector);
}

