import React, { useEffect, useState } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import { EllipseComponent, EllipsePos } from './EllipseComponent';
import SpeechRecognition, {
    useSpeechRecognition,
} from "react-speech-recognition";
import { useVolumeLevel } from "react-volume-indicator"
import click from './click.png'

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
    const [xyForVoice, setXYForVoice] = useState<'x' | 'y'>('x');
    const [image, setImage] = useState<CanvasImageSource>();

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
        const scale = e.ctrlKey ? 5 : 1;
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
        } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'h', 'j', 'k', 'l'].includes(e.key)) {
            if (showGuides != null) {
                switch (keyMode) {
                    case 'move':
                        setEllipses((prev) => prev.map(ellipse => {
                            if (ellipse.idx === showGuides) {
                                if (['ArrowUp', 'k'].includes(e.key)) {
                                    return { ...ellipse, y: ellipse.y - 5 * scale };
                                } else if (['ArrowDown', 'j'].includes(e.key)) {
                                    return { ...ellipse, y: ellipse.y + 5 * scale };
                                } else if (['ArrowLeft', 'h'].includes(e.key)) {
                                    return { ...ellipse, x: ellipse.x - 5 * scale };
                                } else if (['ArrowRight', 'l'].includes(e.key)) {
                                    return { ...ellipse, x: ellipse.x + 5 * scale };
                                }
                            }
                            return ellipse;
                        }));
                        break;
                    case 'rotate':
                        setEllipses((prev) => prev.map(ellipse => {
                            if (ellipse.idx === showGuides) {
                                if (['ArrowDown', 'j', 'ArrowLeft', 'h'].includes(e.key)) {
                                    return { ...ellipse, rotation: ellipse.rotation - 2 * scale };
                                } else if (['ArrowUp', 'k', 'ArrowRight', 'l'].includes(e.key)) {
                                    return { ...ellipse, rotation: ellipse.rotation + 2 * scale };
                                }
                            }
                            return ellipse;
                        }));
                        break;
                    case 'scale':
                        setEllipses((prev) => prev.map(ellipse => {
                            if (ellipse.idx === showGuides) {
                                if (['ArrowUp', 'k'].includes(e.key)) {
                                    return { ...ellipse, radiusY: ellipse.radiusY + 5 * scale };
                                } else if (['ArrowDown', 'j'].includes(e.key)) {
                                    return { ...ellipse, radiusY: ellipse.radiusY - 5 * scale };
                                } else if (['ArrowLeft', 'h'].includes(e.key)) {
                                    return { ...ellipse, radiusX: ellipse.radiusX - 5 * scale };
                                } else if (['ArrowRight', 'l'].includes(e.key)) {
                                    return { ...ellipse, radiusX: ellipse.radiusX + 5 * scale };
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
        } else if (e.key == '+' || e.key == 'p') {
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
        } else if (transcript.includes('M') || transcript.includes('S') || transcript.includes('R') || transcript.includes('あーる') || transcript.includes('ある')) {
            switch (transcript) {
                case 'M': setKeyMode('move'); break;
                case 'S': setKeyMode('scale'); break;
                default: setKeyMode('rotate'); break;
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
            setXYForVoice('x');
            resetTranscript();
        } else if (transcript.includes('Y')) {
            setXYForVoice('y');
            resetTranscript();
        }
    }, [transcript]);

    useEffect(() => {
        if (volumes.length > 5) {
            switch (keyMode) {
                case 'move':
                    setEllipses((prev) => prev.map(ellipse => {
                        if (ellipse.idx === showGuides) {
                            if (volumes[volumes.length - 5] < volumeThreshold) {
                                if (xyForVoice === 'x') {
                                    return { ...ellipse, x: ellipse.x - 5 };
                                } else if (xyForVoice === 'y') {
                                    return { ...ellipse, y: ellipse.y - 5 };
                                }
                            } else {
                                if (xyForVoice === 'x') {
                                    return { ...ellipse, x: ellipse.x + 5 };
                                } else if (xyForVoice === 'y') {
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
                                return { ...ellipse, rotation: ellipse.rotation - 2 };
                            } else {
                                return { ...ellipse, rotation: ellipse.rotation + 2 };
                            }
                        }
                        return ellipse;
                    }));
                    break;
                case 'scale':
                    setEllipses((prev) => prev.map(ellipse => {
                        if (ellipse.idx === showGuides) {
                            if (volumes[volumes.length - 5] < volumeThreshold) {
                                if (xyForVoice === 'x') {
                                    return { ...ellipse, radiusX: ellipse.radiusX - 5 };
                                } else if (xyForVoice === 'y') {
                                    return { ...ellipse, radiusY: ellipse.radiusY - 5 };
                                }
                            } else {
                                if (xyForVoice === 'x') {
                                    return { ...ellipse, radiusX: ellipse.radiusX + 5 };
                                } else if (xyForVoice === 'y') {
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

    useEffect(() => {
        const image = new window.Image();
        image.src = click;
        image.onload = () => {
            setImage(image);
        };
    }, []);

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>
            <div onKeyDown={handleOnKeyDown} tabIndex={0} style={{ flex: '1', border: '1px splid #fff', borderRadius: '8px', padding: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'row', gap: '30px', alignSelf: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignSelf: 'center' }}>
                        <small><b>選択中のモード </b></small>
                        {
                            ['move', 'scale', 'rotate'].map((mode, _) => (
                                keyMode === mode ?
                                    <small><b>{mode} : {mode[0]}</b></small> : <small>{mode} : {mode[0]}</small>
                            ))
                        }
                        {listening && <small> xy: <b>{xyForVoice}</b></small>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignSelf: 'center' }}>
                        <small><b>選択中の楕円 </b></small>
                        {
                            ellipses.map((ellipse, _) => (
                                removedEllipses.find(removedEllipse => removedEllipse.idx === ellipse.idx) == null &&
                                (showGuides === ellipse.idx ?
                                    <small><b>{ellipse.idx}</b></small> : <small>{ellipse.idx}</small>)
                            ))
                        }
                    </div>
                </div>
                <Stage width={window.innerWidth * 0.6} height={window.innerHeight * 0.9} onDblClick={handleStageClick} style={{ border: '1px splid #fff', borderRadius: '8px' }}>
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
                        {ellipses.length <= removedEllipses.length &&
                            <KonvaImage
                                src={click}
                                x={window.innerWidth * 0.3 - 100}
                                y={window.innerHeight * 0.45 - 70}
                                width={200}
                                height={140}
                                image={image}
                            />
                        }
                    </Layer>
                </Stage>
            </div>
            <div className='control' style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ alignSelf: 'flex-start' }}>操作方法</p>
                <table style={{ fontSize: "medium", border: "1" }}>
                    <tr>
                        <th>方法</th>
                        <th>1.楕円を追加</th>
                        <th>2.楕円を選択</th>
                        <th>3.移動・変形モード</th>
                        <th>4.移動</th>
                    </tr>
                    <tr>
                        <td>マウス</td>
                        <td>ダブルクリック</td>
                        <td>楕円をクリック</td>
                        <td>コーナークリック</td>
                        <td>ドラッグ</td>
                    </tr>
                    <tr>
                        <td>キーボード</td>
                        <td>+キー</td>
                        <td>0-9キー</td>
                        <td>m, s, rキー</td>
                        <td>矢印キー</td>
                    </tr>
                    <tr>
                        <td>音声</td>
                        <td>Aと発音</td>
                        <td>0-9と発音</td>
                        <td>M, S, R, X, Yと発音</td>
                        <td>音量(大きさ{volumeThreshold}以上で+, {volumeThreshold}未満で-)</td>
                    </tr>
                </table>
                <p style={{ alignSelf: 'flex-start' }}>Voice情報・設定</p>
                <div>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', alignSelf: 'center' }}>
                        <button
                            onClick={() => { SpeechRecognition.startListening({ continuous: true }); startRecording(); }}
                            style={{ borderRadius: '50%', textAlign: 'center' }}>
                            Start
                        </button>
                        <button
                            onClick={() => { SpeechRecognition.stopListening(); stopRecording(); }}
                            style={{ borderRadius: '50%', textAlign: 'center' }}>
                            Stop
                        </button>
                        <label><small>検知音量:</small></label>
                        <input
                            type="number"
                            value={volumeMin}
                            onChange={(e) => setVolumeMin(parseInt(e.target.value))}
                            style={{ width: '50px' }} />
                        <label><small>+-閾値:</small> </label>
                        <input
                            type="number"
                            value={volumeThreshold}
                            onChange={(e) => setVolumeThreshold(parseInt(e.target.value))}
                            style={{ width: '50px' }} />
                    </div>
                    <div>
                        <small>長さ5, 大きさ{volumeMin}以上の音声を使用. 大きさ{volumeThreshold}以上で+, {volumeThreshold}未満で-
                            <ul style={{ textAlign: "left" }}>
                                <li>Your Message: {transcript}</li>
                                <li>Your Volume: {volume}</li>
                                <li>Your Voice Length: {volumes.length}</li>
                            </ul>
                        </small>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default EllipseCanvas;
