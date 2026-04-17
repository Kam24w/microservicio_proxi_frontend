import React, { useState, useCallback } from 'react';
import ServiceCard from './components/ServiceCard';
import ResponseChart from './components/ResponseChart';
import LogsTable from './components/LogsTable';
import { getSummary, simulateLoad } from './services/api';
import { usePolling } from './hooks/usePolling';

/**
 * App principal — Dashboard de Observabilidad de Microservicios
 * Patrón Proxy aplicado en el backend, visualizado aquí en tiempo real.
 */
function App() {
  const [simulating, setSimulating]   = useState(false);
  const [simResult, setSimResult]     = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Polling del summary cada 3 segundos
  const fetchSummary = useCallback(() => getSummary(), []);
  const { data: summaryData, loading, error } = usePolling(fetchSummary, 3000);

  const services     = summaryData?.services    || [];
  const totalLogs    = summaryData?.totalLogs   || 0;
  const alertServices = services.filter(s => s.hasProblems);

  // ── Simular carga ──────────────────────────────────────────────────────────
  const handleSimulateLoad = async () => {
    setSimulating(true);
    setSimResult(null);
    try {
      const res = await simulateLoad();
      setSimResult(res.data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e) {
      setSimResult({ error: e.message });
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

      {/* ── CSS animations ─────────────────────────────────────────────────── */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.7; transform: scale(1.1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
        body { margin: 0; }
        button:hover { filter: brightness(0.93); }
      `}</style>

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <header style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        color: '#fff', padding: '0 32px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{
          maxWidth: 1400, margin: '0 auto',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', height: 64,
        }}>
          {/* Logo + título */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>🔍</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: -0.5 }}>
                Proxy Monitor
              </h1>
              <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', letterSpacing: 0.5 }}>
                SISTEMA DE OBSERVABILIDAD · PATRÓN PROXY
              </p>
            </div>
          </div>

          {/* Stats rápidos */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <HeaderStat label="Total Logs"   value={totalLogs} color="#94a3b8" />
            <HeaderStat label="Servicios"    value={services.length} color="#94a3b8" />
            <HeaderStat
              label="Alertas"
              value={alertServices.length}
              color={alertServices.length > 0 ? '#f87171' : '#34d399'}
            />

            {/* Indicador live */}
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

      {/* ── MAIN ────────────────────────────────────────────────────────────── */}
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 32px' }}>

        {/* ── Alerta global de servicios con problemas ────────────────────── */}
        {alertServices.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
            border: '1.5px solid #fca5a5', borderRadius: 12,
            padding: '14px 20px', marginBottom: 24,
            display: 'flex', alignItems: 'center', gap: 12,
            animation: 'fadeIn 0.3s ease',
          }}>
            <span style={{ fontSize: 22 }}>🚨</span>
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

        {/* ── BOTÓN SIMULAR CARGA ─────────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 24,
        }}>
          <div>
            <h2 style={{ margin: 0, color: '#1e293b', fontSize: 22, fontWeight: 700 }}>
              Dashboard de Observabilidad
            </h2>
            <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: 13 }}>
              Monitoreo en tiempo real de los microservicios vía LoggingProxy
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <button
              onClick={handleSimulateLoad}
              disabled={simulating}
              style={{
                padding: '12px 24px', borderRadius: 10, border: 'none',
                cursor: simulating ? 'not-allowed' : 'pointer',
                fontWeight: 700, fontSize: 14, letterSpacing: 0.3,
                background: simulating
                  ? '#94a3b8'
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                boxShadow: simulating ? 'none' : '0 4px 16px rgba(99,102,241,0.4)',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              {simulating ? (
                <><SpinIcon /> Generando 50 llamadas...</>
              ) : (
                <>⚡ Simular Carga (50 llamadas)</>
              )}
            </button>

            {simResult && !simResult.error && (
              <div style={{
                fontSize: 12, color: '#16a34a', fontWeight: 600,
                animation: 'fadeIn 0.3s ease',
              }}>
                ✓ {simResult.successCount} exitosas · {simResult.errorCount} errores · {lastUpdated}
              </div>
            )}
            {simResult?.error && (
              <div style={{ fontSize: 12, color: '#dc2626' }}>
                ✗ Error: {simResult.error}
              </div>
            )}
          </div>
        </div>

        {/* ── Error de conexión ───────────────────────────────────────────── */}
        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fca5a5',
            borderRadius: 10, padding: '12px 16px', marginBottom: 20,
            color: '#dc2626', fontSize: 13,
          }}>
            ⚠ No se puede conectar con el backend: {error}.{' '}
            <span style={{ color: '#64748b' }}>
              Asegúrate de que Spring Boot esté corriendo en localhost:8080
            </span>
          </div>
        )}

        {/* ── TARJETAS DE SERVICIO ────────────────────────────────────────── */}
        {loading && services.length === 0 ? (
          <SkeletonCards />
        ) : services.length === 0 ? (
          <EmptyState onSimulate={handleSimulateLoad} />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 20, marginBottom: 28,
            animation: 'fadeIn 0.4s ease',
          }}>
            {services.map(svc => (
              <ServiceCard key={svc.serviceId} service={svc} />
            ))}
          </div>
        )}

        {/* ── GRÁFICA DE LÍNEAS ───────────────────────────────────────────── */}
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
          <ResponseChart services={services} />
        </div>

        {/* ── TABLA DE LOGS ───────────────────────────────────────────────── */}
        <div style={{ animation: 'fadeIn 0.6s ease' }}>
          <LogsTable />
        </div>

        {/* ── FOOTER INFO ────────────────────────────────────────────────── */}
        <div style={{
          marginTop: 32, padding: '16px 0',
          borderTop: '1px solid #e2e8f0',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>
            <strong style={{ color: '#64748b' }}>Patrón Proxy</strong> · Universidad Cooperativa de Colombia ·
            Patrones de Software — Semestre Cuarto
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>
            Docente: Jhonatan Andres Mideros Narvaez
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Sub-componentes de UI ───────────────────────────────────────────────────

const HeaderStat = ({ label, value, color }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
    <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {label}
    </div>
  </div>
);

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
      Sin datos de servicios
    </h3>
    <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 20px' }}>
      Genera tu primera carga para poblar el dashboard
    </p>
    <button
      onClick={onSimulate}
      style={{
        padding: '12px 28px', borderRadius: 10, border: 'none',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14,
        boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
      }}
    >
      ⚡ Generar carga inicial
    </button>
  </div>
);

export default App;
