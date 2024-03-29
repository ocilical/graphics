namespace Project3 {
    export function initScene(): [vec4[], vec4[], vec4[], { [key: string]: Object; }] {
        let positions: vec4[] = [];
        let colors: vec4[] = [];
        let normals: vec4[] = [];
        let objects: { [key: string]: Object; } = {};

        let tempPos: vec4[];

        tempPos = Mesh.cube().map(v => matVecMul(matMul(translate(2.5, -0.1, 2.5), scale(4, 0.2, 4)), v));
        objects.frontRightCube = {
            offset: positions.length,
            verts: tempPos.length,
            ctm: identity,
        };
        positions.push(...tempPos);
        colors.push(...Mesh.cubeAxisColors());
        normals.push(...Mesh.calcNormals(tempPos));

        tempPos = Mesh.cube().map(v => matVecMul(matMul(translate(-2.5, -0.1, 2.5), scale(4, 0.2, 4)), v));
        objects.frontLeftCube = {
            offset: positions.length,
            verts: tempPos.length,
            ctm: identity,
        };
        positions.push(...tempPos);
        colors.push(...Mesh.cubeAxisColors());
        normals.push(...Mesh.calcNormals(tempPos));

        tempPos = Mesh.cube().map(v => matVecMul(matMul(translate(2.5, -0.1, -2.5), scale(4, 0.2, 4)), v));
        objects.backRightCube = {
            offset: positions.length,
            verts: tempPos.length,
            ctm: identity,
        };
        positions.push(...tempPos);
        colors.push(...Mesh.cubeAxisColors());
        normals.push(...Mesh.calcNormals(tempPos));

        tempPos = Mesh.cube().map(v => matVecMul(matMul(translate(-2.5, -0.1, -2.5), scale(4, 0.2, 4)), v));
        objects.backLeftCube = {
            offset: positions.length,
            verts: tempPos.length,
            ctm: identity,
        };
        positions.push(...tempPos);
        colors.push(...Mesh.cubeAxisColors());
        normals.push(...Mesh.calcNormals(tempPos));

        tempPos = Mesh.cube().map(v => matVecMul(matMul(translate(0.0, -0.1, 1.0), scale(1, 0.2, 1)), v));
        objects.innerFrontCube = {
            offset: positions.length,
            verts: tempPos.length,
            ctm: identity,
        };
        positions.push(...tempPos);
        colors.push(...Mesh.cubeAxisColors());
        normals.push(...Mesh.calcNormals(tempPos));

        tempPos = Mesh.cube().map(v => matVecMul(matMul(translate(0.0, -0.1, -1.0), scale(1, 0.2, 1)), v));
        objects.innerBackCube = {
            offset: positions.length,
            verts: tempPos.length,
            ctm: identity,
        };
        positions.push(...tempPos);
        colors.push(...Mesh.cubeAxisColors());
        normals.push(...Mesh.calcNormals(tempPos));

        tempPos = Mesh.cube().map(v => matVecMul(matMul(translate(-1.0, -0.1, 0.0), scale(1, 0.2, 1)), v));
        objects.innerLeftCube = {
            offset: positions.length,
            verts: tempPos.length,
            ctm: identity,
        };
        positions.push(...tempPos);
        colors.push(...Mesh.cubeAxisColors());
        normals.push(...Mesh.calcNormals(tempPos));

        tempPos = Mesh.cube().map(v => matVecMul(matMul(translate(1.0, -0.1, 0.0), scale(1, 0.2, 1)), v));
        objects.innerRightCube = {
            offset: positions.length,
            verts: tempPos.length,
            ctm: identity,
        };
        positions.push(...tempPos);
        colors.push(...Mesh.cubeAxisColors());
        normals.push(...Mesh.calcNormals(tempPos));

        tempPos = Mesh.cube().map(v => matVecMul(matMul(translate(0.0, -0.1, 2.0), scale(1, 0.2, 1)), v));
        objects.midInnerFrontCube = {
            offset: positions.length,
            verts: tempPos.length,
            ctm: identity,
        };
        positions.push(...tempPos);
        colors.push(...Mesh.cubeAxisColors());
        normals.push(...Mesh.calcNormals(tempPos));

        tempPos = Mesh.cube().map(v => matVecMul(matMul(translate(0.0, -0.1, -2.0), scale(1, 0.2, 1)), v));
        objects.midInnerBackCube = {
            offset: positions.length,
            verts: tempPos.length,
            ctm: identity,
        };
        positions.push(...tempPos);
        colors.push(...Mesh.cubeAxisColors());
        normals.push(...Mesh.calcNormals(tempPos));

        tempPos = Mesh.cube().map(v => matVecMul(matMul(translate(-2.0, -0.1, 0.0), scale(1, 0.2, 1)), v));
        objects.midInnerLeftCube = {
            offset: positions.length,
            verts: tempPos.length,
            ctm: identity,
        };
        positions.push(...tempPos);
        colors.push(...Mesh.cubeAxisColors());
        normals.push(...Mesh.calcNormals(tempPos));

        tempPos = Mesh.cube().map(v => matVecMul(matMul(translate(2.0, -0.1, 0.0), scale(1, 0.2, 1)), v));
        objects.midInnerRightCube = {
            offset: positions.length,
            verts: tempPos.length,
            ctm: identity,
        };
        positions.push(...tempPos);
        colors.push(...Mesh.cubeAxisColors());
        normals.push(...Mesh.calcNormals(tempPos));

        tempPos = Mesh.cube().map(v => matVecMul(matMul(translate(0.0, -0.1, 3.0), scale(1, 0.2, 1)), v));
        objects.midOuterFrontCube = {
            offset: positions.length,
            verts: tempPos.length,
            ctm: identity,
        };
        positions.push(...tempPos);
        colors.push(...Mesh.cubeAxisColors());
        normals.push(...Mesh.calcNormals(tempPos));

        tempPos = Mesh.cube().map(v => matVecMul(matMul(translate(0.0, -0.1, -3.0), scale(1, 0.2, 1)), v));
        objects.midOuterBackCube = {
            offset: positions.length,
            verts: tempPos.length,
            ctm: identity,
        };
        positions.push(...tempPos);
        colors.push(...Mesh.cubeAxisColors());
        normals.push(...Mesh.calcNormals(tempPos));

        tempPos = Mesh.cube().map(v => matVecMul(matMul(translate(-3.0, -0.1, 0.0), scale(1, 0.2, 1)), v));
        objects.midOuterLeftCube = {
            offset: positions.length,
            verts: tempPos.length,
            ctm: identity,
        };
        positions.push(...tempPos);
        colors.push(...Mesh.cubeAxisColors());
        normals.push(...Mesh.calcNormals(tempPos));

        tempPos = Mesh.cube().map(v => matVecMul(matMul(translate(3.0, -0.1, 0.0), scale(1, 0.2, 1)), v));
        objects.midOuterRightCube = {
            offset: positions.length,
            verts: tempPos.length,
            ctm: identity,
        };
        positions.push(...tempPos);
        colors.push(...Mesh.cubeAxisColors());
        normals.push(...Mesh.calcNormals(tempPos));

        tempPos = Mesh.cube().map(v => matVecMul(matMul(translate(0.0, -0.1, 4.0), scale(1, 0.2, 1)), v));
        objects.outerFrontCube = {
            offset: positions.length,
            verts: tempPos.length,
            ctm: identity,
        };
        positions.push(...tempPos);
        colors.push(...Mesh.cubeAxisColors());
        normals.push(...Mesh.calcNormals(tempPos));

        tempPos = Mesh.cube().map(v => matVecMul(matMul(translate(0.0, -0.1, -4.0), scale(1, 0.2, 1)), v));
        objects.outerBackCube = {
            offset: positions.length,
            verts: tempPos.length,
            ctm: identity,
        };
        positions.push(...tempPos);
        colors.push(...Mesh.cubeAxisColors());
        normals.push(...Mesh.calcNormals(tempPos));

        tempPos = Mesh.cube().map(v => matVecMul(matMul(translate(-4.0, -0.1, 0.0), scale(1, 0.2, 1)), v));
        objects.outerLeftCube = {
            offset: positions.length,
            verts: tempPos.length,
            ctm: identity,
        };
        positions.push(...tempPos);
        colors.push(...Mesh.cubeAxisColors());
        normals.push(...Mesh.calcNormals(tempPos));

        tempPos = Mesh.cube().map(v => matVecMul(matMul(translate(4.0, -0.1, 0.0), scale(1, 0.2, 1)), v));
        objects.outerRightCube = {
            offset: positions.length,
            verts: tempPos.length,
            ctm: identity,
        };
        positions.push(...tempPos);
        colors.push(...Mesh.cubeAxisColors());
        normals.push(...Mesh.calcNormals(tempPos));

        tempPos = Mesh.sphere(sphereSegments, sphereBands);
        objects.innerSphere = {
            offset: positions.length,
            verts: tempPos.length,
            ctm: translate(1.0, 0.5, 0.0),
        };
        positions.push(...tempPos);
        colors.push(...Mesh.twoColorSphere(tempPos.length / 3, [0.451, 0.941, 0.925, 1.0], [0.847, 0.506, 0.89, 1.0]));
        normals.push(...Mesh.calcSphereNormals(tempPos));

        tempPos = Mesh.sphere(sphereSegments, sphereBands);
        objects.midInnerSphere = {
            offset: positions.length,
            verts: tempPos.length,
            ctm: translate(2.0, 0.5, 0.0),
        };
        positions.push(...tempPos);
        colors.push(...Mesh.twoColorSphere(tempPos.length / 3, [0.451, 0.941, 0.925, 1.0], [0.847, 0.506, 0.89, 1.0]));
        normals.push(...Mesh.calcSphereNormals(tempPos));

        tempPos = Mesh.sphere(sphereSegments, sphereBands);
        objects.midOuterSphere = {
            offset: positions.length,
            verts: tempPos.length,
            ctm: translate(3.0, 0.5, 0.0),
        };
        positions.push(...tempPos);
        colors.push(...Mesh.twoColorSphere(tempPos.length / 3, [0.451, 0.941, 0.925, 1.0], [0.847, 0.506, 0.89, 1.0]));
        normals.push(...Mesh.calcSphereNormals(tempPos));

        tempPos = Mesh.sphere(sphereSegments, sphereBands);
        objects.outerSphere = {
            offset: positions.length,
            verts: tempPos.length,
            ctm: translate(4.0, 0.5, 0.0),
        };
        positions.push(...tempPos);
        colors.push(...Mesh.twoColorSphere(tempPos.length / 3, [0.451, 0.941, 0.925, 1.0], [0.847, 0.506, 0.89, 1.0]));
        normals.push(...Mesh.calcSphereNormals(tempPos));

        tempPos = Mesh.sphere(sphereSegments, sphereBands).map(v => matVecMul(scale(0.2, 0.2, 0.2), v));
        objects.lightbulb = {
            offset: positions.length,
            verts: tempPos.length,
            ctm: translate(0.0, 5.0, 0.0),
        };
        positions.push(...tempPos);
        colors.push(...Mesh.solidColor(tempPos.length / 3, [1.0, 1.0, 1.0, 1.0]));
        normals.push(...Mesh.calcSphereNormals(tempPos).map(v => vecScale(-1, v))); // flip normals

        return [positions, colors, normals, objects];
    }
}
