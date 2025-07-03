import React, { useEffect, useRef } from 'react';

export default function RadarSVG({ performance = 0 }) {
  const dotRef = useRef(null);

  useEffect(() => {
    // 3 níveis de distância: 200px, 100px, 0px
    let distance, colorVar;
    if (performance < 1) {
      distance = 200;
      colorVar = '--rosa-legiao';
    } else if (performance < 2) {
      distance = 100;
      colorVar = '--rosa-legiao';
    } else {
      distance = 0;
      colorVar = '--azul-legiao';
    }

    // Normaliza em % dentro de um raio de 250 do viewBox
    const radius = 250;
    const fraction = distance / radius;       // 0.8, 0.4 ou 0
    const xPerc   = 50 + fraction * 50;        // 90%, 70% ou 50%
    const yPerc   = 50;                        // sempre na horizontal do meio

    if (dotRef.current) {
      dotRef.current.style.left            = `${xPerc}%`;
      dotRef.current.style.top             = `${yPerc}%`;
      dotRef.current.style.backgroundColor = `var(${colorVar})`;
      dotRef.current.style.boxShadow       = `0 0 10px var(${colorVar})`;
    }
  }, [performance]);

  return (
    <div className="w-full max-w-[500px] mx-auto">
      {/* Força proporção 1:1 */}
      <div className="relative w-full" style={{ paddingBottom: '100%' }}>
        <div className="absolute inset-0 bg-[#050505] rounded-full overflow-hidden">
          {/* Grade base do sonar */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 500">
            <g opacity="0.5" stroke="#0f0" strokeWidth="1">
              {[200,150,100,50].map(r => (
                <circle key={r} cx="250" cy="250" r={r} fill="none"/>
              ))}
            </g>
            <line x1="50" y1="250" x2="450" y2="250" stroke="#0f0" strokeWidth="1" opacity="0.3"/>
            <line x1="250" y1="50" x2="250" y2="450" stroke="#0f0" strokeWidth="1" opacity="0.3"/>
            <text x="250" y="30"  fill="#0f0" opacity="0.4" textAnchor="middle">0°</text>
            <text x="470" y="255" fill="#0f0" opacity="0.4" textAnchor="middle">90°</text>
            <text x="250" y="490" fill="#0f0" opacity="0.4" textAnchor="middle">180°</text>
            <text x="30"  y="255" fill="#0f0" opacity="0.4" textAnchor="middle">270°</text>
          </svg>

          {/* Facho giratório */}
          <div
            className="absolute inset-0 animate-spin"
            style={{
              background:
                'conic-gradient(from 90deg at 50% 50%, transparent 0deg, rgba(0,255,0,0.3) 30deg, transparent 40deg)'
            }}
          />

          {/* Bolinha que desliza suavemente ao novo ponto */}
          <div
            ref={dotRef}
            className="
              absolute w-4 h-4
              rounded-full shadow-md
              transform -translate-x-1/2 -translate-y-1/2
              transition-all duration-1000 ease-out
            "
            style={{
              left: '50%',
              top:  '50%',
              backgroundColor: 'var(--rosa-legiao)'
            }}
          />

          {/* Centro pulsante */}
          <div className="
            absolute left-1/2 top-1/2
            w-6 h-6 bg-green-400 rounded-full animate-ping
            -translate-x-1/2 -translate-y-1/2 opacity-40
          " />
          <div className="
            absolute left-1/2 top-1/2
            w-2 h-2 bg-green-500 rounded-full
            -translate-x-1/2 -translate-y-1/2
          " />

        </div>
      </div>
    </div>
  );
}
