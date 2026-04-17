import React, { useState, useCallback, useEffect } from 'react';
import ServiceCard from './components/ServiceCard';
import ResponseChart from './components/ResponseChart';
import LogsTable from './components/LogsTable';
import { getSummary, getHealth, simulateLoad } from './services/api';
import { usePolling } from './hooks/usePolling';

/**
 * Operational observability console for distributed services.
 */
function App() {
  const [trafficRunning, setTrafficRunning] = useState(false);
  const [trafficRun, setTrafficRun] = useState(null);
  const [lastRunAt, setLastRunAt] = useState(null);

  useEffect(() => {
    document.title = 'NexaPulse | Consola operativa';
  }, []);

  // Periodic refresh of the main telemetry.
  const fetchSummary = useCallback(() => getSummary(), []);
  const fetchHealth = useCallback(() => getHealth(), []);
  const { data: summaryData, loading, error } = usePolling(fetchSummary, 3000);
  const { data: healthData } = usePolling(fetchHealth, 3000);

  const serviceSnapshots = summaryData?.services || [];
  const totalLogs = summaryData?.totalLogs || 0;
  const alertServices = serviceSnapshots.filter(s => s.hasProblems);
  const healthStatus = healthData?.status || 'OK';

  // Trigger synthetic traffic.
  const handleSimulateLoad = async () => {
    setTrafficRunning(true);
    setTrafficRun(null);
    try {
      const res = await simulateLoad();
      setTrafficRun(res.data);
      setLastRunAt(new Date().toLocaleTimeString());
    } catch (e) {
      setTrafficRun({ error: e.message });
    } finally {
      setTrafficRunning(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* CSS animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.7; transform: scale(1.1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        * { box-sizing: border-box; }
        body { margin: 0; }
        button:hover { filter: brightness(0.93); }
      `}</style>

      {/* Header */}
      <header style={{
        background: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(14px)',
        color: '#fff', padding: '0 32px',
        boxShadow: '0 10px 30px rgba(15,23,42,0.22)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{
          maxWidth: 1400, margin: '0 auto',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', height: 64,
        }}>
          {/* Logo and title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg, #14b8a6, #2563eb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>NP</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: -0.5 }}>
                NexaPulse
              </h1>
              <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', letterSpacing: 0.5 }}>
                CONSOLA OPERATIVA · TELEMETRÍA EN TIEMPO REAL
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <HeaderStat label="Total Logs"   value={totalLogs} color="#94a3b8" />
            <HeaderStat label="Servicios"    value={serviceSnapshots.length} color="#94a3b8" />
            <HeaderStat
              label="Alertas"
              value={alertServices.length}
              color={alertServices.length > 0 ? '#f87171' : '#34d399'}
            />
            <HeaderStat
              label="Salud API"
              value={healthStatus}
              color={healthStatus === 'OK' ? '#34d399' : '#f59e0b'}
            />

            {/* Live indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#34d399', animation: 'pulse 1.5s infinite',
              }} />
              <span style={{ fontSize: 12, color: '#34d399', fontWeight: 600 }}>LIVE</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 32px' }}>

        {/* Global alert for problematic services */}
        {alertServices.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
            border: '1.5px solid #fca5a5', borderRadius: 12,
            padding: '14px 20px', marginBottom: 24,
            display: 'flex', alignItems: 'center', gap: 12,
            animation: 'fadeIn 0.3s ease',
          }}>
            <span style={{ fontSize: 22 }}>!</span>
            <div>
              <strong style={{ color: '#b91c1c', fontSize: 14 }}>
                {alertServices.length} servicio{alertServices.length > 1 ? 's' : ''} con tasa de error superior al 15%:
              </strong>
              <span style={{ marginLeft: 8, color: '#dc2626', fontSize: 13 }}>
                {alertServices.map(s => s.serviceId).join(', ')}
              </span>
            </div>
          </div>
        )}

        {/* Traffic simulation action */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 24,
        }}>
          <div>
            <h2 style={{ margin: 0, color: '#1e293b', fontSize: 22, fontWeight: 700 }}>
              Consola operativa
            </h2>
            <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: 13 }}>
              Supervisión continua de tráfico, latencia y estado de servicios
            </p>
            <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <InfoBadge label="Estado" value={healthStatus} tone={healthStatus === 'OK' ? 'success' : 'warning'} />
              <InfoBadge label="Logs" value={summaryData?.totalLogs ?? 0} tone="neutral" />
              <InfoBadge label="Última ejecución" value={lastRunAt || 'Pendiente'} tone="neutral" />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <button
              onClick={handleSimulateLoad}
              disabled={trafficRunning}
              style={{
                padding: '12px 24px', borderRadius: 10, border: 'none',
                cursor: trafficRunning ? 'not-allowed' : 'pointer',
                fontWeight: 700, fontSize: 14, letterSpacing: 0.3,
                background: trafficRunning
                  ? '#94a3b8'
                  : 'linear-gradient(135deg, #2563eb, #0f766e)',
                color: '#fff',
                boxShadow: trafficRunning ? 'none' : '0 4px 16px rgba(37,99,235,0.35)',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              {trafficRunning ? (
                <><SpinIcon /> Generando tráfico controlado...</>
              ) : (
                <>Ejecutar tráfico sintético</>
              )}
            </button>

            {trafficRun && !trafficRun.error && (
              <div style={{
                fontSize: 12, color: '#16a34a', fontWeight: 600,
                animation: 'fadeIn 0.3s ease',
              }}>
                {trafficRun.successCount} eventos correctos · {trafficRun.errorCount} incidentes · {lastRunAt}
              </div>
            )}
            {trafficRun?.error && (
              <div style={{ fontSize: 12, color: '#dc2626' }}>
                Error: {trafficRun.error}
              </div>
            )}
          </div>
        </div>

        {/* Connection error */}
        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fca5a5',
            borderRadius: 10, padding: '12px 16px', marginBottom: 20,
            color: '#dc2626', fontSize: 13,
          }}>
            No se puede conectar con la API: {error}.{' '}
            <span style={{ color: '#64748b' }}>
              Verifica que el servicio esté activo en localhost:8080
            </span>
          </div>
        )}

        {/* Service cards */}
        {loading && serviceSnapshots.length === 0 ? (
          <SkeletonCards />
        ) : serviceSnapshots.length === 0 ? (
          <EmptyState onSimulate={handleSimulateLoad} />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 20, marginBottom: 28,
            animation: 'fadeIn 0.4s ease',
          }}>
            {serviceSnapshots.map(svc => (
              <ServiceCard key={svc.serviceId} service={svc} />
            ))}
          </div>
        )}

        {/* Line chart */}
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
          <ResponseChart services={serviceSnapshots} />
        </div>

        {/* Event table */}
        <div style={{ animation: 'fadeIn 0.6s ease' }}>
          <LogsTable />
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 32, padding: '16px 0',
          borderTop: '1px solid #e2e8f0',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>
            <strong style={{ color: '#64748b' }}>NexaPulse</strong> · Plataforma de observabilidad y control operativo
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>
            Gestión de servicios distribuidos
          </div>
        </div>
      </main>
    </div>
  );
}

// UI subcomponents

const HeaderStat = ({ label, value, color }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
    <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {label}
    </div>
  </div>
);

const InfoBadge = ({ label, value, tone }) => {
  const palette = {
    success: { background: '#ecfdf5', border: '#a7f3d0', color: '#047857' },
    warning: { background: '#fffbeb', border: '#fde68a', color: '#b45309' },
    neutral: { background: '#f8fafc', border: '#e2e8f0', color: '#334155' },
  };

  const style = palette[tone] || palette.neutral;

  return (
    <div style={{
      background: style.background,
      border: `1px solid ${style.border}`,
      color: style.color,
      padding: '6px 10px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 600,
    }}>
      {label}: {value}
    </div>
  );
};

const SpinIcon = () => (
  <span style={{
    display: 'inline-block', width: 14, height: 14,
    border: '2px solid rgba(255,255,255,0.4)',
    borderTopColor: '#fff', borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  }} />
);

const SkeletonCards = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 28 }}>
    {[1, 2, 3].map(i => (
      <div key={i} style={{
        height: 220, borderRadius: 16, background: '#e2e8f0',
        animation: 'pulse 1.5s infinite',
      }} />
    ))}
  </div>
);

const EmptyState = ({ onSimulate }) => (
  <div style={{
    textAlign: 'center', padding: '48px 24px', marginBottom: 28,
    background: '#fff', borderRadius: 16,
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    animation: 'fadeIn 0.4s ease',
  }}>
    <div style={{ fontSize: 56, marginBottom: 16 }}>📭</div>
    <h3 style={{ margin: '0 0 8px', color: '#1e293b', fontSize: 18 }}>
      Sin telemetría disponible
    </h3>
    <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 20px' }}>
      Ejecuta un tráfico controlado para inicializar la consola
    </p>
    <button
      onClick={onSimulate}
      style={{
        padding: '12px 28px', borderRadius: 10, border: 'none',
        background: 'linear-gradient(135deg, #2563eb, #0f766e)',
        color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14,
        boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
      }}
    >
      Iniciar tráfico controlado
    </button>
  </div>
);

export default App;
