import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const SERVICE_COLORS = {
  INVENTORY: '#6366f1',
  ORDERS:    '#0ea5e9',
  PAYMENTS:  '#10b981',
};

/**
 * Line chart showing latency
 * for the last 20 requests per service.
 */
const ResponseChart = ({ services = [] }) => {
  const [activeService, setActiveService] = useState('ALL');

  // Build a combined dataset (1-20 as the X axis).
  const buildChartData = () => {
    const maxLen = Math.max(...services.map(s => (s.last20Calls || []).length), 0);
    return Array.from({ length: maxLen }, (_, i) => {
      const point = { index: i + 1 };
      services.forEach(svc => {
        const calls = (svc.last20Calls || []).slice().reverse();
        if (calls[i]) point[svc.serviceId] = calls[i].durationMs;
      });
      return point;
    });
  };

  const chartData     = buildChartData();
  const visibleServices = activeService === 'ALL'
    ? services
    : services.filter(s => s.serviceId === activeService);

  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: 24,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: 24,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, color: '#1e293b', fontSize: 16 }}>
          Latencia operativa - últimas 20 solicitudes
        </h3>
        <div style={{ display: 'flex', gap: 8 }}>
          {['ALL', ...services.map(s => s.serviceId)].map(svcId => (
            <button
              key={svcId}
              onClick={() => setActiveService(svcId)}
              style={{
                padding: '4px 12px', borderRadius: 20, border: 'none',
                cursor: 'pointer', fontSize: 12, fontWeight: 600,
                background: activeService === svcId ? '#6366f1' : '#f1f5f9',
                color:      activeService === svcId ? '#fff' : '#64748b',
                transition: 'all 0.2s',
              }}
            >
              {svcId}
            </button>
          ))}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
          Sin datos aún. Ejecuta tráfico controlado para generar telemetría.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="index" label={{ value: 'Secuencia', position: 'insideBottom', offset: -2 }} />
            <YAxis label={{ value: 'ms', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
              formatter={(value) => [`${value} ms`, '']}
            />
            <Legend />
            {visibleServices.map(svc => (
              <Line
                key={svc.serviceId}
                type="monotone"
                dataKey={svc.serviceId}
                stroke={SERVICE_COLORS[svc.serviceId] || '#888'}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ResponseChart;
