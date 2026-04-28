import React, { useRef, useEffect } from 'react';

const DoubleRangeSlider = ({ min, max, value, onChange }: { min: number, max: number, value: [number, number], onChange: (val: [number, number]) => void }) => {
    const [minVal, maxVal] = value;
    const minValRef = useRef(minVal);
    const maxValRef = useRef(maxVal);
    const range = useRef<HTMLDivElement>(null);
  
    const getPercent = (val: number) => Math.round(((val - min) / (max - min)) * 100);
  
    useEffect(() => {
      minValRef.current = minVal;
      maxValRef.current = maxVal;
      
      if (range.current) {
        const minPercent = getPercent(minVal);
        const maxPercent = getPercent(maxVal);
        
        range.current.style.left = `${minPercent}%`;
        range.current.style.width = `${maxPercent - minPercent}%`;
      }
    }, [minVal, maxVal, min, max]);
  
    return (
      <div className="relative w-full h-12 flex items-center justify-center">
        <input
          type="range"
          min={min}
          max={max}
          value={minVal}
          onChange={(event) => {
            const val = Math.min(Number(event.target.value), maxVal - 1);
            onChange([val, maxVal]);
          }}
          className="thumb thumb--left pointer-events-none absolute h-0 w-full outline-none z-30"
          style={{ zIndex: minVal > max - 10 ? 50 : 30 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={maxVal}
          onChange={(event) => {
            const val = Math.max(Number(event.target.value), minVal + 1);
            onChange([minVal, val]);
          }}
          className="thumb thumb--right pointer-events-none absolute h-0 w-full outline-none z-40"
        />
  
        <div className="relative w-full">
          <div className="absolute w-full h-1.5 bg-gray-200 rounded-full z-10"></div>
          <div ref={range} className="absolute h-1.5 bg-pink-500 rounded-full z-20"></div>
          <div className="absolute left-0 mt-4 text-xs text-gray-400 font-bold">{minVal}</div>
          <div className="absolute right-0 mt-4 text-xs text-gray-400 font-bold">{maxVal}</div>
        </div>
        
        <style>{`
          .thumb::-webkit-slider-thumb {
            -webkit-appearance: none;
            -webkit-tap-highlight-color: transparent;
            pointer-events: auto;
            height: 24px;
            width: 24px;
            border-radius: 50%;
            background-color: white;
            border: 2px solid #ec4899;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            cursor: pointer;
            margin-top: -10px;
          }
          .thumb::-moz-range-thumb {
            pointer-events: auto;
            height: 24px;
            width: 24px;
            border-radius: 50%;
            background-color: white;
            border: 2px solid #ec4899;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            cursor: pointer;
            border: none;
          }
        `}</style>
      </div>
    );
};

export default DoubleRangeSlider;