namespace Mesh {
    /**
     * generate colors for triangles
     * @param triangles number of triangles
     * @returns array of vertex colors
     */
    export function randomColors(triangles: number): vec4[] {
        return [...Array(triangles)].flatMap(() => {
            const color: vec4 = [Math.random(), Math.random(), Math.random(), 1.0];
            return [color, color, color];
        });
    }

    /**
     * generate colors for quads
     * @param triangles number of triangles, must be divisible by 2
     * @returns array of vertex colors
     */
    export function randomQuadColors(triangles: number): vec4[] {
        if (triangles % 2) throw new Error("can't generate quad colors for array length not divisible by 2");

        return [...Array(triangles / 2)].flatMap(() => {
            const color: vec4 = [Math.random(), Math.random(), Math.random(), 1.0];
            return [color, color, color, color, color, color];
        });
    }

    export function cubeAxisColors(): vec4[] {
        const posX: vec4 = [1, 0, 0, 1];
        const posY: vec4 = [0, 1, 0, 1];
        const posZ: vec4 = [0, 0, 1, 1];
        const negX: vec4 = [0, 1, 1, 1];
        const negY: vec4 = [1, 0, 1, 1];
        const negZ: vec4 = [1, 1, 0, 1];

        return [
            posY, posY, posY, posY, posY, posY,
            negY, negY, negY, negY, negY, negY,
            negX, negX, negX, negX, negX, negX,
            posX, posX, posX, posX, posX, posX,
            posZ, posZ, posZ, posZ, posZ, posZ,
            negZ, negZ, negZ, negZ, negZ, negZ,
        ];
    }

    export function solidColor(triangles: number, color: vec4): vec4[] {
        return [...Array(triangles)].flatMap(() => [color, color, color]);
    }

    export function twoColorSphere(triangles: number, color1: vec4, color2: vec4): vec4[] {
        let res: vec4[] = [...Array(triangles / 4)].flatMap(() => [color1, color1, color1]);
        res = res.concat([...Array(triangles / 2)].flatMap(() => [color2, color2, color2]));
        return res.concat([...Array(triangles / 4)].flatMap(() => [color1, color1, color1]));
    }

    /**
     * generate quad, follows counterclockwise winding order
     * @returns array of vertices
     */
    export function quad(p1: vec4, p2: vec4, p3: vec4, p4: vec4): vec4[] {
        return [
            p1, p2, p3,
            p3, p4, p1,
        ];
    }

    /**
     * generate 1x1x1 cube, resize it if you want a different cube!
     * @returns array of vertices
     */
    export function cube(): vec4[] {
        return [
            // top face
            ...quad([0.5, 0.5, 0.5, 1.0], [0.5, 0.5, -0.5, 1.0], [-0.5, 0.5, -0.5, 1.0], [-0.5, 0.5, 0.5, 1.0]),
            // bottom face
            ...quad([-0.5, -0.5, -0.5, 1.0], [0.5, -0.5, -0.5, 1.0], [0.5, -0.5, 0.5, 1.0], [-0.5, -0.5, 0.5, 1.0]),
            // left face
            ...quad([-0.5, -0.5, -0.5, 1.0], [-0.5, -0.5, 0.5, 1.0], [-0.5, 0.5, 0.5, 1.0], [-0.5, 0.5, -0.5, 1.0]),
            // right face
            ...quad([0.5, 0.5, 0.5, 1.0], [0.5, -0.5, 0.5, 1.0], [0.5, -0.5, -0.5, 1.0], [0.5, 0.5, -0.5, 1.0]),
            // front face
            ...quad([0.5, 0.5, 0.5, 1.0], [-0.5, 0.5, 0.5, 1.0], [-0.5, -0.5, 0.5, 1.0], [0.5, -0.5, 0.5, 1.0]),
            // back face
            ...quad([-0.5, -0.5, -0.5, 1.0], [-0.5, 0.5, -0.5, 1.0], [0.5, 0.5, -0.5, 1.0], [0.5, -0.5, -0.5, 1.0]),
        ];
    }

    /**
     * generate cone with height and base diameter 1
     * @param segments number of slices to generate the cone in, the cone will be twice this many tris, must be >=3
     * @returns array of vertices
     */
    export function cone(segments: number): vec4[] {
        // that's not enough for a cone!
        if (segments < 3) {
            return [];
        }

        // 3 verts per tri, two tris per segment
        const res: vec4[] = [];

        const tip: vec4 = [0.0, 0.5, 0.0, 1.0];
        const base: vec4 = [0.0, -0.5, 0.0, 1.0];

        // set up first vertex
        let oldX = 0.5;
        let oldZ = 0;

        // iterate over each segment (counterclockwise when looking at the bottom)
        for (let i = 0; i < segments; i++) {
            // calculate current angle, i + 1 since the calculated vertex is shared with next segment
            const angle = ((i + 1) / segments) * (2 * Math.PI);

            // calculate position of next vertex around the cone's base
            const newX = 0.5 * Math.cos(angle);
            const newZ = 0.5 * Math.sin(angle);

            // triangle that goes to the tip of the cone
            res.push(
                tip,
                [newX, base[1], newZ, 1.0],
                [oldX, base[1], oldZ, 1.0],
            );

            // triangle on the base
            res.push(
                base,
                [oldX, base[1], oldZ, 1.0],
                [newX, base[1], newZ, 1.0],
            );

            // prepare for next iteration
            oldX = newX;
            oldZ = newZ;

        }

        return res;
    }

    export function cylinder(segments: number): vec4[] {
        // that's not enough for a cylinder!
        if (segments < 3) {
            return [];
        }

        // 3 verts per tri, 4 tris per segment
        const res: vec4[] = [];

        // centers of the top and bottom
        const top: vec4 = [0.0, 0.5, 0.0, 1.0];
        const bot: vec4 = [0.0, -0.5, 0.0, 1.0];

        // set up first vertex
        let oldZ = 0;
        let oldX = 0.5;

        for (let i = 0; i < segments; i++) {
            // calculate current angle, i + 1 since the calculated vertex is shared with next segment
            const angle = ((i + 1) / segments) * (2 * Math.PI);

            // calculate position of next vertex around the cone's base
            const newX = 0.5 * Math.cos(angle);
            const newZ = 0.5 * Math.sin(angle);

            // top triangle
            res.push(
                top,
                [newX, top[1], newZ, 1.0],
                [oldX, top[1], oldZ, 1.0],
            );

            // the quad
            res.push(...quad(
                [newX, top[1], newZ, 1.0],
                [newX, bot[1], newZ, 1.0],
                [oldX, bot[1], oldZ, 1.0],
                [oldX, top[1], oldZ, 1.0],
            ));

            // bottom triangle
            res.push(
                bot,
                [oldX, bot[1], oldZ, 1.0],
                [newX, bot[1], newZ, 1.0],
            );

            // prepare for next iteration
            oldX = newX;
            oldZ = newZ;
        }

        return res;
    }

    /**
     * generate a sphere of diameter 1
     * @param segments number of vertical segments
     * @param bands number of horizontal bands
     * @returns array of vertices
     */
    export function sphere(segments: number, bands: number): vec4[] {
        if (segments < 3 || bands < 3) {
            return [];
        }

        // top and bottom of the sphere
        const top: vec4 = [0.0, 0.5, 0.0, 1.0];
        const bot: vec4 = [0.0, -0.5, 0.0, 1.0];

        // band uses 180 because it's only accross half the sphere
        const segmentAngle = (1 / segments) * 360;
        const bandAngle = (1 / bands) * 180;

        // build first segment
        const segment = [];
        const segmentRot = rotateY(segmentAngle);
        const bandRot = rotateX(bandAngle);

        // rotate into position for first triangle
        let old1 = matVecMul(bandRot, top);
        let old2 = matVecMul(segmentRot, old1);

        // top triangle
        segment.push(top, old1, old2);

        // 2 less because the triangles on each part of it aren't counted
        for (let i = 0; i < (bands - 2); i++) {
            // calculate new points
            const new1 = matVecMul(bandRot, old1);
            const new2 = matVecMul(segmentRot, new1);

            // 1 quad on the segment
            segment.push(...quad(old1, new1, new2, old2));

            old1 = new1;
            old2 = new2;
        }

        // bottom triangle
        segment.push(old2, old1, bot);

        // build full sphere
        const res = [...segment];

        for (let i = 1; i < segments; i++) {
            // rotate a copy of the segment to the right place and add it
            const rot = rotateY(segmentAngle * i);
            res.push(...segment.map(v => matVecMul(rot, v)));
        }


        return res;
    }

    /**
     * generate a torus with major diameter 1
     * @param segments number of vertical segments
     * @param bands number of horizontal bands
     * @param minorDiam [optional] minor diameter of torus, since you can't change it with a linear transformation
     * @returns
     */
    export function torus(segments: number, bands: number, minorDiam?: number): vec4[] {
        // make sure it can actually be constructed with the provided numbers
        if (segments < 3 || bands < 3) {
            return [];
        }

        // default minor diameter if not provided
        minorDiam ??= 0.2;

        // calculate angles
        const segmentAngle = (1 / segments) * 360;
        console.log(`segments: ${segments} segment angle: ${segmentAngle}`);
        const bandAngle = (1 / bands) * 360;
        console.log(`bands: ${bands} band angle: ${bandAngle}`);

        // build first segment
        const segment = [];
        const segmentRot = rotateY(segmentAngle);
        const bandRot = rotateZ(bandAngle);
        const diamTrans = translate(0.5, 0.0, 0.0);

        // starting position on the circle
        let currPoint: vec4 = [minorDiam, 0.0, 0.0, 1.0];

        for (let i = 0; i < bands; i++) {
            // next point on the circle
            const newPoint = matVecMul(bandRot, currPoint);

            // translate/rotate each point to it's correct position and make a quad
            segment.push(...quad(
                matVecMul(diamTrans, currPoint),
                matVecMul(segmentRot, matVecMul(diamTrans, currPoint)),
                matVecMul(segmentRot, matVecMul(diamTrans, newPoint)),
                matVecMul(diamTrans, newPoint),
            ));

            currPoint = newPoint;
        }

        // build full torus
        const res = [...segment];

        for (let i = 1; i < segments; i++) {
            // rotate a copy of the segment to the right place and add it
            const rot = rotateY(segmentAngle * i);
            res.push(...segment.map(v => matVecMul(rot, v)));
        }

        return res;
    }
}
