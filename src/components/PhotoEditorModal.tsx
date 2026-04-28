import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import { TRANSLATIONS } from '../constants';
import type { Language } from '../types';

const PhotoEditorModal = ({ 
    onSave, 
    onCancel, 
    lang 
}: { 
    onSave: (imgUrl: string) => void, 
    onCancel: () => void, 
    lang: Language 
}) => {
    const [step, setStep] = useState<'IMPORT' | 'EDIT'>('IMPORT');
    const [imgUrl, setImgUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Editor State
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [baseScale, setBaseScale] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    
    const dragStartRef = useRef({ x: 0, y: 0 });
    const imgRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- 1. Import ---
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                setImgUrl(e.target.result as string);
                setStep('EDIT');
                setZoom(1);
                setOffset({ x: 0, y: 0 });
            }
        };
        reader.readAsDataURL(file);
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    // --- 2. Logic (Calcul Ratio) ---
    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        const container = containerRef.current;
        if (!container) return;

        // Calcul pour que l'image couvre le conteneur
        const scaleX = container.clientWidth / img.naturalWidth;
        const scaleY = container.clientHeight / img.naturalHeight;
        const scale = Math.max(scaleX, scaleY);

        setBaseScale(scale);
        setIsLoading(false);
    };

    // --- 3. Drag & Drop ---
    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDragging(true);
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        dragStartRef.current = { x: clientX - offset.x, y: clientY - offset.y };
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging) return;
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        
        setOffset({
            x: clientX - dragStartRef.current.x,
            y: clientY - dragStartRef.current.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // --- 4. Validation (Canvas) ---
    const handleValidate = () => {
        if (!imgRef.current || !canvasRef.current || !containerRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const img = imgRef.current;
        const container = containerRef.current;

        const targetWidth = 600;
        const targetHeight = 800;
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Ratio pixel écran vs pixel canvas
        const pixelRatio = targetWidth / container.clientWidth;

        ctx.clearRect(0, 0, targetWidth, targetHeight);
        ctx.save();

        ctx.translate(targetWidth / 2, targetHeight / 2);
        ctx.translate(offset.x * pixelRatio, offset.y * pixelRatio);
        
        // On applique le scale
        const finalScale = baseScale * zoom * pixelRatio;
        ctx.scale(finalScale, finalScale);

        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

        ctx.restore();
        
        setIsLoading(true);
        setTimeout(() => {
             try {
                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                onSave(dataUrl);
            } catch (e) {
                console.error("Export Error", e);
                if (imgUrl) onSave(imgUrl);
            }
            setIsLoading(false);
        }, 100);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-fade-in">
             <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-fade-in-up flex flex-col max-h-[95vh] overflow-hidden">
                 <div className="p-4 border-b flex justify-between items-center shrink-0">
                     <h3 className="font-bold text-lg text-gray-800">{TRANSLATIONS[lang].editor_title}</h3>
                     <button onClick={onCancel} className="text-gray-500 hover:text-gray-800 p-1">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" /></svg>
                     </button>
                 </div>

                 <div className="p-4 overflow-y-auto">
                     <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

                     {step === 'IMPORT' ? (
                         <div className="h-64 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                             {isLoading ? (
                                 <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
                             ) : (
                                 <Button onClick={triggerFileInput} className="flex items-center gap-2 px-6 py-3">
                                     <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M14,13V17H10V13H7L12,8L17,13H14M19.35,10.03C18.67,6.59 15.64,4 12,4C9.11,4 6.6,5.64 5.35,8.03C2.34,8.36 0,10.9 0,14A6,6 0 0,0 6,20H19A5,5 0 0,0 24,15C24,12.36 21.95,10.22 19.35,10.03Z" /></svg>
                                     {TRANSLATIONS[lang].import_photo}
                                 </Button>
                             )}
                         </div>
                     ) : (
                         <div className="flex flex-col gap-4">
                             {/* --- MODIFICATION ICI : h-80 fixe pour réduire la taille --- */}
                             <div 
                                  ref={containerRef}
                                  className="relative h-80 aspect-[3/4] mx-auto bg-gray-900 overflow-hidden rounded-lg cursor-move touch-none shadow-inner"
                                  onMouseDown={handleMouseDown}
                                  onMouseMove={handleMouseMove}
                                  onMouseUp={handleMouseUp}
                                  onMouseLeave={handleMouseUp}
                                  onTouchStart={handleMouseDown}
                                  onTouchMove={handleMouseMove}
                                  onTouchEnd={handleMouseUp}
                             >
                                 {imgUrl && (
                                     <img 
                                        ref={imgRef}
                                        src={imgUrl}
                                        onLoad={handleImageLoad}
                                        className="absolute max-w-none origin-center pointer-events-none select-none transition-transform duration-75"
                                        style={{
                                            transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${baseScale * zoom})`,
                                            left: '50%',
                                            top: '50%',
                                        }}
                                        alt="Crop target"
                                     />
                                 )}
                                 
                                 {/* Grille */}
                                 <div className="absolute inset-0 pointer-events-none border border-white/30">
                                     <div className="absolute top-1/3 w-full h-px bg-white/30"></div>
                                     <div className="absolute top-2/3 w-full h-px bg-white/30"></div>
                                     <div className="absolute left-1/3 h-full w-px bg-white/30"></div>
                                     <div className="absolute left-2/3 h-full w-px bg-white/30"></div>
                                 </div>
                             </div>
                             
                             <div className="bg-gray-50 p-3 rounded-xl">
                                 <label className="text-xs font-bold text-gray-500 uppercase flex justify-between mb-2">
                                     <span>{TRANSLATIONS[lang].zoom}</span>
                                     <span>{Math.round(zoom * 100)}%</span>
                                 </label>
                                 <input 
                                    type="range" 
                                    min="1" 
                                    max="3" 
                                    step="0.1"
                                    value={zoom}
                                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                                    className="w-full accent-pink-500 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                 />
                                 <p className="text-center text-xs text-gray-400 mt-2">{TRANSLATIONS[lang].drag_hint}</p>
                             </div>
                         </div>
                     )}
                 </div>

                 {step === 'EDIT' && (
                    <div className="p-4 border-t bg-white shrink-0 flex gap-3">
                        <Button onClick={() => { setStep('IMPORT'); setImgUrl(null); }} variant="ghost" className="flex-1">
                            {TRANSLATIONS[lang].cancel}
                        </Button>
                        <Button onClick={handleValidate} className="flex-1">
                            {isLoading ? 'Processing...' : TRANSLATIONS[lang].validate}
                        </Button>
                    </div>
                 )}
                 
                 <canvas ref={canvasRef} className="hidden"></canvas>
             </div>
        </div>
    );
};

export default PhotoEditorModal;