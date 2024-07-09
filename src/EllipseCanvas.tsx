import React, { useState } from 'react';
import { Stage, Layer, Text } from 'react-konva';
import { EllipseComponent, EllipsePos } from './EllipseComponent';

type KeyMode = 'move' | 'scale' | 'rotate';

const EllipseCanvas: React.FC = () => {
    const [ellipses, setEllipses] = useState<EllipsePos[]>([]);
    const [showGuides, setShowGuides] = useState<number | null>(null);
    const [ellipseNumber, setEllipseNumber] = useState<number>(0);
    const [removedEllipses, setRemovedEllipses] = useState<EllipsePos[]>([]);
    const [showNumbers, setShowNumbers] = useState<boolean>(true);
    const [keyMode, setKeyMode] = useState<KeyMode>('move');

    const handleStageClick = (e: any) => {
        const clientX = e.target.getStage().getPointerPosition().x;
        const clientY = e.target.getStage().getPointerPosition().y;
        setShowGuides(ellipseNumber);
        setEllipses([...ellipses, { x: clientX, y: clientY, radiusX: 100, radiusY: 50, rotation: 0, idx: ellipseNumber }]);
        setEllipseNumber(prev => prev + 1);
    };

    const handleOnKeyDown = (e: any) => {
        console.log(e.key);
        if (e.key === 'Escape') {
            setShowGuides(null);
            setShowNumbers(true);
        } else if (e.keyCode === 8 && showGuides !== null) {
            const removedEllipse = ellipses.find(ellipse => ellipse.idx === showGuides);
            if (removedEllipse != null) {
                setRemovedEllipses([...removedEllipses, removedEllipse]);
            }
        } else if (/^[0-9]$/.test(e.key)) {
            setShowGuides(parseInt(e.key));
        } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            if (showGuides != null) {
                switch (keyMode) {
                    case 'move':
                        setEllipses((prev) => prev.map(ellipse => {
                            if (ellipse.idx === showGuides) {
                                switch (e.key) {
                                    case 'ArrowUp':
                                        return { ...ellipse, y: ellipse.y - 5 };
                                    case 'ArrowDown':
                                        return { ...ellipse, y: ellipse.y + 5 };
                                    case 'ArrowLeft':
                                        return { ...ellipse, x: ellipse.x - 5 };
                                    case 'ArrowRight':
                                        return { ...ellipse, x: ellipse.x + 5 };
                                }
                            }
                            return ellipse;
                        }));
                        break;
                    case 'rotate':
                        setEllipses((prev) => prev.map(ellipse => {
                            if (ellipse.idx === showGuides) {
                                switch (e.key) {
                                    case 'ArrowUp':
                                        return { ...ellipse, rotation: ellipse.rotation + 5 };
                                    case 'ArrowDown':
                                        return { ...ellipse, rotation: ellipse.rotation - 5 };
                                    case 'ArrowLeft':
                                        return { ...ellipse, rotation: ellipse.rotation - 5 };
                                    case 'ArrowRight':
                                        return { ...ellipse, rotation: ellipse.rotation + 5 };
                                }
                            }
                            return ellipse;
                        }));
                        break;
                    case 'scale':
                        setEllipses((prev) => prev.map(ellipse => {
                            if (ellipse.idx === showGuides) {
                                switch (e.key) {
                                    case 'ArrowUp':
                                        return { ...ellipse, radiusY: ellipse.radiusY + 5 };
                                    case 'ArrowDown':
                                        return { ...ellipse, radiusY: ellipse.radiusY - 5 };
                                    case 'ArrowLeft':
                                        return { ...ellipse, radiusX: ellipse.radiusX - 5 };
                                    case 'ArrowRight':
                                        return { ...ellipse, radiusX: ellipse.radiusX + 5 };
                                }
                            }
                            return ellipse;
                        }));
                        break;
                }
            }
        } else if (['m', 's', 'r'].includes(e.key)) {
            switch (e.key) {
                case 'm': setKeyMode('move'); break;
                case 's': setKeyMode('scale'); break;
                case 'r': setKeyMode('rotate'); break;
            }
        } else if (e.key == '+') {
            const baseEllapse = showGuides != null ? ellipses.find(ellipse => ellipse.idx === showGuides) : ellipses[ellipses.length - 1];
            setShowGuides(ellipseNumber);
            if (baseEllapse != null) {
                setEllipses([...ellipses, { x: baseEllapse.x + 20, y: baseEllapse.y + 20, radiusX: baseEllapse.radiusX, radiusY: baseEllapse.radiusY, rotation: baseEllapse.rotation, idx: ellipseNumber }]);
            } else {
                setEllipses([...ellipses, { x: 100, y: 100, radiusX: 100, radiusY: 50, rotation: 0, idx: ellipseNumber }]);
            }
            setEllipseNumber(prev => prev + 1);
        }
    }

    return (
        <div onKeyDown={handleOnKeyDown} tabIndex={0}>
            <h2>KeyMode</h2>
            {
                ['move', 'scale', 'rotate'].map((mode, _) => (
                    keyMode === mode ?
                        <b>{mode} : {mode[0]}, </b> : <small>{mode} : {mode[0]}, </small>
                ))
            }
            <Stage width={window.innerWidth * 0.6} height={window.innerHeight * 0.6} onDblClick={handleStageClick}>
                <Layer>
                    {ellipses.map((ellipse, _) => (
                        removedEllipses.find(removedEllipse => removedEllipse.idx === ellipse.idx) == null &&
                        <EllipseComponent
                            ellipse={ellipse}
                            showGuides={showGuides}
                            setShowGuides={setShowGuides}
                            showNumbers={showNumbers}
                            setKeyMode={setKeyMode}
                            setEllipse={(ellipse: EllipsePos) => { setEllipses(prev => prev.map(e => e.idx === ellipse.idx ? ellipse : e)) }}
                        />
                    ))}
                </Layer>
            </Stage>
        </div>
    );
};

export default EllipseCanvas;
