import React from 'react';

export default function Termometro({
  label,
  value = 0,
  thresholds = { bad: 0, good: 100 },
  unit = '%'
}) {
  const { bad, good } = thresholds;
  let status, nextValue;

  if (value >= good) {
    status = 'excellent';
    nextValue = null;
  } else if (value >= bad) {
    status = 'good';
    nextValue = (good - value).toFixed(2);
  } else {
    status = 'bad';
    nextValue = (bad - value).toFixed(2);
  }

  const fillPerc =
    status === 'excellent'
      ? 100
      : Math.min(100, (value / good) * 100);

  return (
    <div className="metric-thermometer">
      {/* Cabeçalho da métrica */}
      <div className="metric-header">
        <span className="metric-name-therm">{label}</span>
        <span className="metric-value-therm">
          {value.toFixed(2)}
          {unit}
        </span>
      </div>

      {/* Barra do termômetro */}
      <div className="thermometer-bar">
        <div
          className="thermometer-level"
          style={{ width: `${fillPerc}%` }}
        />
      </div>

      {/* Legenda Ruim | Bom | Ótimo */}
      <div className="thermometer-label">
        <span className="ruim">Ruim</span>
        <span className="bom">Bom</span>
        <span className="otimo">Ótimo</span>
      </div>

      {/* Recomendação */}
      <div className="next-step">
        {status === 'excellent'
          ? '🎉 Parabéns! Sua métrica está ótima. Continue mantendo essa performance.'
          : `▶ Próximo nível: Aumente ${nextValue}${unit} para atingir o nível ${
              status === 'bad' ? 'bom' : 'ótimo'
            }.`}
      </div>
    </div>
  );
}
