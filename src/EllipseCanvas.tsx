import React, { useEffect, useState } from 'react';
import { Stage, Layer, Text } from 'react-konva';
import { EllipseComponent, EllipsePos } from './EllipseComponent';
import SpeechRecognition, {
    useSpeechRecognition,
} from "react-speech-recognition";
import { useVolumeLevel } from "react-volume-indicator"

type KeyMode = 'move' | 'scale' | 'rotate';

const EllipseCanvas: React.FC = () => {
    const [volumeMin, setVolumeMin] = useState<number>(2);
    const [volumeThreshold, setVolumeThreshold] = useState<number>(10);
    const [ellipses, setEllipses] = useState<EllipsePos[]>([]);
    const [showGuides, setShowGuides] = useState<number | null>(null);
    const [ellipseNumber, setEllipseNumber] = useState<number>(0);
    const [removedEllipses, setRemovedEllipses] = useState<EllipsePos[]>([]);
    const [showNumbers, setShowNumbers] = useState<boolean>(true);
    const [keyMode, setKeyMode] = useState<KeyMode>('move');
    const [startRecording, stopRecording, volume] = useVolumeLevel();
    const [volumes, setVolumes] = useState<number[]>([]);
    const [xyForVoice, setXYForVoice] = useState<'X' | 'Y'>('X');

    const handleStageClick = (e: any) => {
        const clientX = e.target.getStage().getPointerPosition().x;
        const clientY = e.target.getStage().getPointerPosition().y;
        setShowGuides(ellipseNumber);
        setEllipses([...ellipses, { x: clientX, y: clientY, radiusX: 100, radiusY: 50, rotation: 0, idx: ellipseNumber }]);
        setEllipseNumber(prev => prev + 1);
    };

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition,
    } = useSpeechRecognition();

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
                setEllipses([...ellipses, { x: baseEllapse.x + 15, y: baseEllapse.y + 15, radiusX: baseEllapse.radiusX, radiusY: baseEllapse.radiusY, rotation: baseEllapse.rotation, idx: ellipseNumber }]);
            } else {
                setEllipses([...ellipses, { x: 100, y: 100, radiusX: 100, radiusY: 50, rotation: 0, idx: ellipseNumber }]);
            }
            setEllipseNumber(prev => prev + 1);
        }
    }

    useEffect(() => {
        if (transcript.match(/[0-9]/) != null) {
            setShowGuides(parseInt(transcript.match(/[0-9]/)![0]));
            resetTranscript();
        } else if (transcript.includes('M') || transcript.includes('S') || transcript.includes('R')) {
            switch (transcript) {
                case 'M': setKeyMode('move'); break;
                case 'S': setKeyMode('scale'); break;
                case 'R': setKeyMode('rotate'); break;
            }
            resetTranscript();
        } else if (transcript.includes('A')) {
            const baseEllapse = showGuides != null ? ellipses.find(ellipse => ellipse.idx === showGuides) : ellipses[ellipses.length - 1];
            setShowGuides(ellipseNumber);
            if (baseEllapse != null) {
                setEllipses([...ellipses, { x: baseEllapse.x + 15, y: baseEllapse.y + 15, radiusX: baseEllapse.radiusX, radiusY: baseEllapse.radiusY, rotation: baseEllapse.rotation, idx: ellipseNumber }]);
            } else {
                setEllipses([...ellipses, { x: 100, y: 100, radiusX: 100, radiusY: 50, rotation: 0, idx: ellipseNumber }]);
            }
            setEllipseNumber(prev => prev + 1);
            resetTranscript();
        } else if (transcript.includes('X')) {
            setXYForVoice('X');
            resetTranscript();
        } else if (transcript.includes('Y')) {
            setXYForVoice('Y');
            resetTranscript();
        }
    }, [transcript]);

    useEffect(() => {
        if (volumes.length > 5) {
            // const lastAvarege = volumes.slice(-5).reduce((prev, current) => prev + current) / 10;
            // const beforeAvarege = volumes.slice(-10, -5).reduce((prev, current) => prev + current) / 10;
            // console.log("hello", lastAvarege, beforeAvarege);
            switch (keyMode) {
                case 'move':
                    setEllipses((prev) => prev.map(ellipse => {
                        if (ellipse.idx === showGuides) {
                            if (volumes[volumes.length - 5] < volumeThreshold) {
                                if (xyForVoice === 'X') {
                                    return { ...ellipse, x: ellipse.x - 5 };
                                } else if (xyForVoice === 'Y') {
                                    return { ...ellipse, y: ellipse.y - 5 };
                                }
                            } else {
                                if (xyForVoice === 'X') {
                                    return { ...ellipse, x: ellipse.x + 5 };
                                } else if (xyForVoice === 'Y') {
                                    return { ...ellipse, y: ellipse.y + 5 };
                                }
                            }
                        }
                        return ellipse;
                    }));
                    break;
                case 'rotate':
                    setEllipses((prev) => prev.map(ellipse => {
                        if (ellipse.idx === showGuides) {
                            if (volumes[volumes.length - 5] < volumeThreshold) {
                                return { ...ellipse, rotation: ellipse.rotation - 5 };
                            } else {
                                return { ...ellipse, rotation: ellipse.rotation + 5 };
                            }
                        }
                        return ellipse;
                    }));
                    break;
                case 'scale':
                    setEllipses((prev) => prev.map(ellipse => {
                        if (ellipse.idx === showGuides) {
                            if (volumes[volumes.length - 5] < volumeThreshold) {
                                if (xyForVoice === 'X') {
                                    return { ...ellipse, radiusX: ellipse.radiusX - 5 };
                                } else if (xyForVoice === 'Y') {
                                    return { ...ellipse, radiusY: ellipse.radiusY - 5 };
                                }
                            } else {
                                if (xyForVoice === 'X') {
                                    return { ...ellipse, radiusX: ellipse.radiusX + 5 };
                                } else if (xyForVoice === 'Y') {
                                    return { ...ellipse, radiusY: ellipse.radiusY + 5 };
                                }
                            }
                        }
                        return ellipse;
                    }));
                    break;
            }
        }
        if (volume > volumeMin) {
            setVolumes(prev => [...prev, volume]);
        } else {
            setVolumes(prev => []);
        }
    }, [volume]);

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'row' }}>
            <div onKeyDown={handleOnKeyDown} tabIndex={0}>
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
            <div>
                <p>1. 楕円を追加: <small>ダブルクリック, +キー, Aと発音</small></p>
                <p>2. 選択: <small>クリック, 0-9キー, 0-9と発音 </small></p>
                {
                    ellipses.map((ellipse, _) => (
                        removedEllipses.find(removedEllipse => removedEllipse.idx === ellipse.idx) == null &&
                            showGuides === ellipse.idx ?
                            <small><b>{ellipse.idx}, </b></small> : <small>{ellipse.idx}, </small>
                    ))
                }
                <p>3. 移動: <small>マウスドラッグ, msrと矢印キー, msrxyと音量 </small></p>
                {
                    ['move', 'scale', 'rotate'].map((mode, _) => (
                        keyMode === mode ?
                            <small><b>{mode} : {mode[0]}, </b></small> : <small>{mode} : {mode[0]}, </small>
                    ))
                }
                <small> XY (声操作用): {xyForVoice} </small>
                <p>4. Voice情報</p>
                <div>
                    <button onClick={() => { SpeechRecognition.startListening({ continuous: true }); startRecording(); }}>Use Voice</button>
                    <button onClick={() => { SpeechRecognition.stopListening(); stopRecording(); }}>Stop Voice</button>
                    <label><small>検知音量:</small></label>
                    <input type="number" value={volumeMin} onChange={(e) => setVolumeMin(parseInt(e.target.value))} />
                    <label><small>+-閾値:</small> </label>
                    <input type="number" value={volumeThreshold} onChange={(e) => setVolumeThreshold(parseInt(e.target.value))} />
                    <div><small>長さ5, 大きさ{volumeMin}以上の音声を使用. 大きさ{volumeThreshold}以上で+, {volumeThreshold}未満で-</small></div>
                    <div><small>Your Message: {transcript}</small></div>
                    <div><small>Your Volume: {volume > volumeMin ? volume : "None"} Your Voice Length: {volumes.length}</small></div>
                </div>
            </div>
        </div >
    );
};

export default EllipseCanvas;
