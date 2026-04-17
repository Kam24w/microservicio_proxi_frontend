import React from 'react';

const SERVICE_ICONS = {
  INVENTORY: '📦',
  ORDERS:    '🛒',
  PAYMENTS:  '💳',
};

const SERVICE_COLORS = {
  INVENTORY: '#6366f1',
  ORDERS:    '#0ea5e9',
  PAYMENTS:  '#10b981',
};

/**
 * Tarjeta de servicio con métricas clave.
 * Se resalta en rojo si la tasa de error supera el 15%.
 */
const ServiceCard = ({ service }) => {
  const { serviceId, totalCalls, successCount, errorCount,
          errorRate, avgDurationMs, hasProblems } = service;

  const icon  = SERVICE_ICONS[serviceId]  || '⚙️';
  const color = SERVICE_COLORS[serviceId] || '#6366f1';
  const successRate = totalCalls > 0
    ? ((successCount / totalCalls) * 100).toFixed(1)
    : '0.0';

  return (
    <div style={{
      background: hasProblems
        ? 'linear-gradient(135deg, #fee2e2, #fecaca)'
        : 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
      border: `2px solid ${hasProblems ? '#ef4444' : color}`,
      borderRadius: 16,
      padding: '24px',
      position: 'relative',
      transition: 'all 0.3s ease',
      boxShadow: hasProblems
        ? '0 4px 20px rgba(239,68,68,0.25)'
        : '0 4px 20px rgba(0,0,0,0.08)',
    }}>
      {/* Indicador de problema */}
      {hasProblems && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          background: '#ef4444', color: '#fff',
          padding: '2px 10px', borderRadius: 20,
          fontSize: 11, fontWeight: 700,
          animation: 'pulse 1.5s infinite',
        }}>
          ⚠ ALERTA
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <span style={{ fontSize: 36 }}>{icon}</span>
        <div>
          <h3 style={{ margin: 0, color: hasProblems ? '#b91c1c' : color, fontSize: 18, fontWeight: 700 }}>
            {serviceId}
          </h3>
          <span style={{
            fontSize: 11, fontWeight: 600, letterSpacing: 1,
            color: hasProblems ? '#dc2626' : '#64748b',
            textTransform: 'uppercase',
          }}>
            Microservicio
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Metric label="Total Llamadas" value={totalCalls}     color="#1e293b" />
        <Metric label="Tasa de Éxito"  value={`${successRate}%`} color="#16a34a" />
        <Metric label="Errores"        value={errorCount}     color={errorCount > 0 ? '#dc2626' : '#64748b'} />
        <Metric label="Tasa de Error"  value={`${errorRate}%`} color={hasProblems ? '#dc2626' : '#64748b'} />
        <Metric label="Avg Respuesta"  value={`${avgDurationMs}ms`} color="#7c3aed" />
        <Metric label="Exitosas"       value={successCount}   color="#16a34a" />
      </div>

      {/* Barra de progreso de éxito */}
      <div style={{ marginTop: 16 }}>
        <div style={{ background: '#e2e8f0', borderRadius: 8, height: 6, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${successRate}%`,
            background: hasProblems
              ? 'linear-gradient(90deg, #ef4444, #f97316)'
              : 'linear-gradient(90deg, #10b981, #06b6d4)',
            borderRadius: 8,
            transition: 'width 0.5s ease',
          }} />
        </div>
        <p style={{ margin: '4px 0 0', fontSize: 11, color: '#94a3b8', textAlign: 'right' }}>
          {successRate}% éxito
        </p>
      </div>
    </div>
  );
};

const Metric = ({ label, value, color }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
    <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {label}
    </div>
  </div>
);

export default ServiceCard;
