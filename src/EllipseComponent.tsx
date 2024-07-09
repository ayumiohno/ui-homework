import React, { ComponentProps, useEffect, useRef, useState } from 'react';
import { Text, Ellipse, Rect, Group, Line, Circle } from 'react-konva';

export type EllipsePos = {
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    rotation: number,
    idx: number,
}

type EllipseComponentProps = {
    ellipse: EllipsePos,
    setEllipse: (Ellipse: EllipsePos) => void,
    showGuides: number | null,
    setShowGuides: (number: number | null) => void,
    showNumbers: boolean,
    setKeyMode: (keyMode: 'move' | 'scale' | 'rotate') => void,
}

export const EllipseComponent: React.FC<EllipseComponentProps> = ({ showGuides, setShowGuides, showNumbers, ellipse, setEllipse, setKeyMode }) => {
    const groupRef: ComponentProps<typeof Group>["ref"] = useRef(null);
    const guideSize = 15;
    const rotateGuideLength = 15;
    const [rotating, setRotating] = useState<boolean>(false);
    const [dragPos, setDragPos] = useState<{ x: number, y: number }>({ x: ellipse.x + rotatePoint({ x: 0, y: -ellipse.radiusY - rotateGuideLength }, { x: 0, y: 0 }, ellipse.rotation).x, y: ellipse.y + rotatePoint({ x: 0, y: -ellipse.radiusY - rotateGuideLength }, { x: 0, y: 0 }, ellipse.rotation).y });

    function handleMove(e: any) {
        setKeyMode('move');
        setShowGuides(ellipse.idx);
        setEllipse({
            ...ellipse,
            x: e.target.x(),
            y: e.target.y(),
        });
    }

    function setDefaulteDragPos() {
        setDragPos({ x: ellipse.x + rotatePoint({ x: 0, y: -ellipse.radiusY - rotateGuideLength }, { x: 0, y: 0 }, ellipse.rotation).x, y: ellipse.y + rotatePoint({ x: 0, y: -ellipse.radiusY - rotateGuideLength }, { x: 0, y: 0 }, ellipse.rotation).y });

    }

    useEffect(() => { if (showGuides === ellipse.idx) { setKeyMode('move'); groupRef?.current?.moveToTop(); } }, [showGuides]);
    useEffect(() => { if (!rotating) setDefaulteDragPos() }, [ellipse]);

    function handleScale(e: any, pos: string) {
        setKeyMode('scale');
        var target_x = e.target.x() + rotatePoint({ x: guideSize / 2, y: guideSize / 2 }, { x: 0, y: 0 }, ellipse.rotation).x;
        var target_y = e.target.y() + rotatePoint({ x: guideSize / 2, y: guideSize / 2 }, { x: 0, y: 0 }, ellipse.rotation).y;
        var opposite_x = 0;
        var opposite_y = 0;
        switch (pos) {
            case "bottom-left":
                opposite_x = getExactPositionOfControlPoint("top-right").x + ellipse.x;
                opposite_y = getExactPositionOfControlPoint("top-right").y + ellipse.y;
                break;
            case "bottom-right":
                opposite_x = getExactPositionOfControlPoint("top-left").x + ellipse.x;
                opposite_y = getExactPositionOfControlPoint("top-left").y + ellipse.y;
                break;
            case "top-left":
                opposite_x = getExactPositionOfControlPoint("bottom-right").x + ellipse.x;
                opposite_y = getExactPositionOfControlPoint("bottom-right").y + ellipse.y;
                break;
            case "top-right":
                opposite_x = getExactPositionOfControlPoint("bottom-left").x + ellipse.x;
                opposite_y = getExactPositionOfControlPoint("bottom-left").y + ellipse.y;
                break;
        }
        var new_x = (target_x + opposite_x) / 2;
        var new_y = (target_y + opposite_y) / 2;
        var theta = Math.atan2(target_y - opposite_y, target_x - opposite_x) * 180 / Math.PI - ellipse.rotation;
        var new_radius = Math.sqrt((target_x - opposite_x) ** 2 + (target_y - opposite_y) ** 2) / 2;
        var new_radiusX = Math.abs(new_radius * Math.cos(theta * Math.PI / 180));
        var new_radiusY = Math.abs(new_radius * Math.sin(theta * Math.PI / 180));
        setEllipse({
            ...ellipse,
            radiusX: new_radiusX,
            radiusY: new_radiusY,
            x: new_x,
            y: new_y,
        });
    }

    function handleRotation(e: any) {
        setKeyMode('rotate')
        // var target_x = e.target.getStage().getPointerPosition().x;
        // var target_y = e.target.getStage().getPointerPosition().y;
        var target_x = e.target.x() + rotatePoint({ x: guideSize / 2, y: guideSize / 2 }, { x: 0, y: 0 }, ellipse.rotation).x;
        var target_y = e.target.y() + rotatePoint({ x: guideSize / 2, y: guideSize / 2 }, { x: 0, y: 0 }, ellipse.rotation).y;
        const distFromCenter = Math.sqrt((target_x - ellipse.x) ** 2 + (target_y - ellipse.y) ** 2);
        if (distFromCenter < ellipse.radiusY) {
            target_x = ellipse.x + (getExactPositionOfControlPoint("top-right").x + getExactPositionOfControlPoint("top-left").x) / 2;
            target_y = ellipse.y + (getExactPositionOfControlPoint("top-right").y + getExactPositionOfControlPoint("top-left").y) / 2;
            e.target.x(ellipse.x + (getPositionOfControlPoint("top-right").x + getPositionOfControlPoint("top-left").x) / 2);
            e.target.y(ellipse.y + (getPositionOfControlPoint("top-right").y + getPositionOfControlPoint("top-left").y) / 2);
        }
        var new_rotation = Math.atan2(target_x - ellipse.x, ellipse.y - target_y) * 180 / Math.PI;
        e.target.preventDefault();
        setEllipse({
            ...ellipse,
            rotation: new_rotation,
        });
        setDragPos({ x: target_x, y: target_y });
    }

    function rotatePoint(point: any, center: any, angle: number) {
        var angleInRadians = angle * Math.PI / 180;
        var cosTheta = Math.cos(angleInRadians);
        var sinTheta = Math.sin(angleInRadians);
        return {
            x: cosTheta * (point.x - center.x) - sinTheta * (point.y - center.y) + center.x,
            y: sinTheta * (point.x - center.x) + cosTheta * (point.y - center.y) + center.y,
        };
    }

    function getPositionOfControlPoint(pos: string) {
        switch (pos) {
            case "top-left":
                return rotatePoint({ x: -ellipse.radiusX - guideSize / 2, y: -ellipse.radiusY - guideSize / 2 }, { x: 0, y: 0 }, ellipse.rotation);
            case "top-right":
                return rotatePoint({ x: ellipse.radiusX - guideSize / 2, y: -ellipse.radiusY - guideSize / 2 }, { x: 0, y: 0 }, ellipse.rotation);
            case "bottom-left":
                return rotatePoint({ x: -ellipse.radiusX - guideSize / 2, y: ellipse.radiusY - guideSize / 2 }, { x: 0, y: 0 }, ellipse.rotation);
            default:
                return rotatePoint({ x: ellipse.radiusX - guideSize / 2, y: ellipse.radiusY - guideSize / 2 }, { x: 0, y: 0 }, ellipse.rotation);
        }
    }

    function getExactPositionOfControlPoint(pos: string) {
        switch (pos) {
            case "top-left":
                return rotatePoint({ x: -ellipse.radiusX, y: -ellipse.radiusY }, { x: 0, y: 0 }, ellipse.rotation);
            case "top-right":
                return rotatePoint({ x: ellipse.radiusX, y: -ellipse.radiusY }, { x: 0, y: 0 }, ellipse.rotation);
            case "bottom-left":
                return rotatePoint({ x: -ellipse.radiusX, y: ellipse.radiusY }, { x: 0, y: 0 }, ellipse.rotation);
            default:
                return rotatePoint({ x: ellipse.radiusX, y: ellipse.radiusY }, { x: 0, y: 0 }, ellipse.rotation);
        }
    }

    return (
        <Group ref={groupRef}>
            {showGuides === ellipse.idx &&
                <Rect
                    x={ellipse.x + rotatePoint({ x: -ellipse.radiusX, y: -ellipse.radiusY }, { x: 0, y: 0 }, ellipse.rotation).x}
                    y={ellipse.y + rotatePoint({ x: -ellipse.radiusX, y: -ellipse.radiusY }, { x: 0, y: 0 }, ellipse.rotation).y}
                    width={ellipse.radiusX * 2}
                    height={ellipse.radiusY * 2}
                    stroke="red"
                    rotation={ellipse.rotation}
                    strokeWidth={2}
                />
            }
            <Ellipse
                x={ellipse.x}
                y={ellipse.y}
                radiusX={ellipse.radiusX}
                radiusY={ellipse.radiusY}
                rotation={ellipse.rotation}
                fill="blue"
                draggable
                onDragMove={handleMove}
                onClick={(e) => { setShowGuides(showGuides === ellipse.idx ? null : ellipse.idx) }}
            />
            {showGuides === ellipse.idx && ['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos, i) => (
                <Rect
                    key={pos}
                    x={getPositionOfControlPoint(pos).x + ellipse.x}
                    y={getPositionOfControlPoint(pos).y + ellipse.y}
                    width={guideSize}
                    height={guideSize}
                    fill="red"
                    draggable
                    onDragMove={(e) => handleScale(e, pos)}
                    rotation={ellipse.rotation}
                />
            ))}
            {showGuides === ellipse.idx &&
                <Rect
                    x={dragPos.x + rotatePoint({ x: -guideSize / 2, y: -guideSize / 2 }, { x: 0, y: 0 }, ellipse.rotation).x}
                    y={dragPos.y + rotatePoint({ x: -guideSize / 2, y: -guideSize / 2 }, { x: 0, y: 0 }, ellipse.rotation).y}
                    width={guideSize}
                    height={guideSize}
                    fill="green"
                    draggable
                    onDragMove={handleRotation}
                    onDragStart={() => setRotating(true)}
                    onDragEnd={() => { setDefaulteDragPos(); setRotating(false); }}
                    rotation={ellipse.rotation}
                />
            }
            {
                showGuides === ellipse.idx &&
                <Line
                    points={[
                        (getExactPositionOfControlPoint("top-left").x + getExactPositionOfControlPoint("top-right").x) / 2 + ellipse.x,
                        (getExactPositionOfControlPoint("top-left").y + getExactPositionOfControlPoint("top-right").y) / 2 + ellipse.y,
                        dragPos.x,
                        dragPos.y,
                    ]}
                    stroke="green" strokeWidth={2} />
            }
            {
                showNumbers &&
                <Text text={ellipse.idx.toString()} x={ellipse.x - 10} y={ellipse.y - 10} fontSize={20} />
            }
        </Group>
    );
};
