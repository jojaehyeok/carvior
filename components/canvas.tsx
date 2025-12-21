"use client";
import React, { useRef, useEffect, useState } from 'react';
import { Checkbox, Chip, Textarea } from '@nextui-org/react';
import html2canvas from 'html2canvas'; // Import html2canvas for full-page screenshot

type TextOption = 'X' | 'B' | 'W' | 'A' | 'T' | 'C' | 'U' | 'OL';
type UiColorOption = 'danger' | 'primary' | 'secondary'| 'warning';
type ColorOption = 'red' | 'blue' | 'purple' | 'orange';

const uicolorMap: Record<UiColorOption, ColorOption> = {
    danger: 'red',
    primary: 'blue',
    secondary: 'purple',
    warning : 'orange',
};

const colorMap: Record<TextOption, UiColorOption> = {
    X: 'danger',
    B: 'secondary',
    W: 'primary',
    A: 'primary',
    T: 'primary',
    C: 'primary',
    U: 'primary',
    OL: 'warning',
};

const textMap: Record<TextOption, string> = {
    X: 'X 교환',
    B: 'B 판금',
    W: 'W 용접',
    A: 'A 긁힘',
    T: 'T 깨짐',
    U: 'U 찌그러짐',
    C: 'C 부식',
    OL: 'OL 누유',
};

const CanvasWithText: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [points, setPoints] = useState<{ x: number; y: number; text: TextOption }[]>([]);
    const [selectedText, setSelectedText] = useState<TextOption>('X');
    const [disabledOptions, setDisabledOptions] = useState<Set<TextOption>>(new Set());
    const [selectedPanel, setSelectedPanel] = useState<'외판' | '내판' | '실내' | '엔진룸'>('내판');
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
    const radius = 50;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        if (selectedPanel === '외판') {
            img.src = '/jindan1.jpg';
        } else if (selectedPanel === '내판') {
            img.src = '/jindan2.jpg';
        } else if (selectedPanel === '실내') {
            img.src = '/jindan3.jpg';
        } else if (selectedPanel === '엔진룸'){
            img.src = '/jindan4.jpg';
        } else {
            img.src = 'default.jpg'
        }

        img.onload = () => {
            if (!ctx) return;

            canvas.width = img.width;
            canvas.height = img.height;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            points.forEach(point => {
                ctx.fillStyle = uicolorMap[colorMap[point.text]];
                ctx.beginPath();
                ctx.arc(point.x, point.y, 15, 0, 2 * Math.PI);
                ctx.fill();
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = '20px Arial';
                ctx.fillText(point.text, point.x, point.y);
            });
        };
    }, [points, selectedPanel]);

    const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        const x = (event.clientX - rect.left) * (canvas.width / rect.width);
        const y = (event.clientY - rect.top) * (canvas.height / rect.height);

        setPoints(prevPoints => {
            const newPoints = prevPoints.filter(point => {
                const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
                return distance > radius;
            });

            return [...newPoints, { x, y, text: selectedText }];
        });
    };

    const handleCheckboxChange = (value: TextOption) => {
        setSelectedText(value);
        setDisabledOptions(new Set([value]));
    };

    const downloadCanvasAsImage = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const imageUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = 'canvas-drawing.png';
        link.click();
    };

    const downloadFullScreenScreenshot = () => {
        html2canvas(document.body).then(canvas => {
            const imageUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = 'fullscreen-screenshot.png';
            link.click();
        });
    };

    const togglePan = (panel: '내판' | '외판' | '실내' | '엔진룸') => {
        setSelectedPanel(panel);
        setPoints([]);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const newImageUrls = Array.from(files).map(file => {
                const reader = new FileReader();
                return new Promise<string>((resolve, reject) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            });

            Promise.all(newImageUrls).then(imageUrls => {
                setUploadedImages(prevImages => [...prevImages, ...imageUrls]);
            });
        }
    };

    const handleImageClick = (src: string) => {
        setBackgroundImage(src);
    };

    const getDisplayValues = (): TextOption[] => {
        switch (selectedPanel) {
            case '내판':
                return ['X', 'B', 'W', 'A', 'T', 'C', 'U'];
            case '외판':
                return ['X', 'B', 'W'];
            case '실내':
                return ['A', 'T', 'C', 'U'];
            default:
                return ['OL'];
        }
    };

    const displayValues = getDisplayValues();

    // Remove the last point from the points array
    const removeLastPoint = () => {
        setPoints(prevPoints => prevPoints.slice(0, -1));
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-2">
            <div className="flex flex-col items-center mb-4">
                <div className="flex gap-2 mb-2">
                    <Chip
                        isDisabled={selectedPanel === '내판'}
                        onClick={() => togglePan('내판')}
                    >
                        외판
                    </Chip>
                    <Chip
                        isDisabled={selectedPanel === '외판'}
                        onClick={() => togglePan('외판')}
                    >
                        내판
                    </Chip>
                    <Chip
                        isDisabled={selectedPanel === '실내'}
                        onClick={() => togglePan('실내')}
                    >
                        실내
                    </Chip>
                    <Chip
                        isDisabled={selectedPanel === '엔진룸'}
                        onClick={() => togglePan('엔진룸')}
                    >
                        엔진룸
                    </Chip>
                </div>
                <div className="flex flex-wrap gap-2 mb-2 p-1 rounded-lg shadow-md">
                    {displayValues.map((value) => (
                        <label key={value} className="flex items-center gap-2">
                            <Checkbox
                                size="sm"
                                isSelected={selectedText === value}
                                color={colorMap[value]}
                                onChange={() => handleCheckboxChange(value)}
                                style={{
                                    borderColor: colorMap[value],
                                    pointerEvents: disabledOptions.has(value) ? 'none' : 'auto',
                                }}
                            />
                            <span className="text-lg" style={{ color: uicolorMap[colorMap[value]] }}>
                                {textMap[value]}
                            </span>
                        </label>
                    ))}
                </div>
            </div>
            <canvas
                ref={canvasRef}
                className="w-full max-h-full border border-black mb-2"
                onClick={handleClick}
            />
            <div className="flex items-center mb-4">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-input"
                    multiple
                />
                <label htmlFor="file-input" className="px-4 py-2 bg-green-300 text-white rounded cursor-pointer">
                    확인해야하는 사진
                </label>
            </div>
            <div className="grid grid-cols-3 gap-3">
                {uploadedImages.map((src, index) => (
                    <img
                        key={index}
                        src={src}
                        alt={`미리보기 ${index + 1}`}
                        className="w-32 h-32 object-cover border border-gray-300 rounded cursor-pointer"
                        onClick={() => handleImageClick(src)}
                    />
                ))}
            </div>
            <Textarea
                isRequired
                label="점검자 의견"
                labelPlacement="outside"
                placeholder="이미지 업로드, Description은 테스트 중입니다."
                className="max-w-xs"
            />
            <div className='flex flex-wrap justify-center'>

            <button onClick={downloadCanvasAsImage} className="mt-2 px-2 py-1 bg-green-300 text-white rounded">
                캔버스 다운로드
            </button>
            </div>
            
            {/* Floating Button for removing the last point */}
            <button
                onClick={removeLastPoint}
                className="fixed bottom-4 right-4 bg-green-200 text-white rounded-full p-4 shadow-lg"
                aria-label="Remove last point"
            >
                <span className="text-xl">🔙</span>
            </button>
        </div>
    );
};

export default CanvasWithText;
