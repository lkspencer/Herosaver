import { Matrix4, Vector3, Vector4 } from "three";

let matrixRotation = new Matrix4().makeRotationX(90 * Math.PI / 180);
let matrixScale = new Matrix4().makeScale(10, 10, 10);
let vertex = new Vector3();

export function parse(mesh) {
  if (!mesh.isMesh) {
    console.warn('Mesh type unsupported', mesh);
    return;
  }

  let geometry = mesh.geometry;

  if (geometry.isBufferGeometry) {
    var newGeometry = geometry.clone(geometry);
    var vertices = geometry.getAttribute('position');

    // vertices
    if (vertices !== undefined) {
      let verticesCount = vertices.count;
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
          var finalVector = new Vector4();
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

          for (let j = 0; j < geometry.skinIndexNames.length; j++) {
            newFunction_1(geometry, i, j, mesh, morphVector, finalVector);
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

function newFunction_1(geometry, i, j, mesh, morphVector, finalVector) {
  var skinIndices = geometry.getAttribute([geometry.skinIndexNames[j]]);
  var weights = geometry.getAttribute([geometry.skinWeightNames[j]]);
  var skinIndex = [];
  skinIndex[0] = skinIndices.getX(i);
  skinIndex[1] = skinIndices.getY(i);
  skinIndex[2] = skinIndices.getZ(i);
  skinIndex[3] = skinIndices.getW(i);
  var skinWeight = [];
  skinWeight[0] = weights.getX(i);
  skinWeight[1] = weights.getY(i);
  skinWeight[2] = weights.getZ(i);
  skinWeight[3] = weights.getW(i);
  var inverses = [];
  inverses[0] = mesh.skeleton.boneInverses[skinIndex[0]];
  inverses[1] = mesh.skeleton.boneInverses[skinIndex[1]];
  inverses[2] = mesh.skeleton.boneInverses[skinIndex[2]];
  inverses[3] = mesh.skeleton.boneInverses[skinIndex[3]];
  var skinMatrices = [];
  skinMatrices[0] = mesh.skeleton.bones[skinIndex[0]].matrixWorld;
  skinMatrices[1] = mesh.skeleton.bones[skinIndex[1]].matrixWorld;
  skinMatrices[2] = mesh.skeleton.bones[skinIndex[2]].matrixWorld;
  skinMatrices[3] = mesh.skeleton.bones[skinIndex[3]].matrixWorld;
  for (var k = 0; k < 4; k++) {
    newFunction(geometry, morphVector, skinWeight, k, inverses, skinMatrices, finalVector);
  }
}

function newFunction(geometry, morphVector, skinWeight, k, inverses, skinMatrices, finalVector) {
  var vectorToCopy = geometry.morphTargetInfluences !== undefined
    ? morphVector
    : vertex;
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

