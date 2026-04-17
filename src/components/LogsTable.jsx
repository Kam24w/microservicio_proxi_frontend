import React, { useState, useCallback } from 'react';
import { getLogs } from '../services/api';
import { usePolling } from '../hooks/usePolling';

const STATUS_STYLE = {
  SUCCESS: { background: '#dcfce7', color: '#15803d', border: '1px solid #86efac' },
  ERROR:   { background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' },
};

/**
 * Real-time event table with:
 * - Polling cada 3 segundos
 * - Filtros por servicio, estado y rango de fechas
 * - Paginación
 * - Expansión de detalles al hacer clic
 */
const LogsTable = () => {
  const [filters, setFilters]         = useState({ service: '', status: '', from: '', to: '' });
  const [page, setPage]               = useState(0);
  const [expandedId, setExpandedId]   = useState(null);
  const pageSize = 15;

  const fetchLogs = useCallback(() =>
    getLogs({ ...filters, page, size: pageSize }), [filters, page]);

  const { data, loading, error } = usePolling(fetchLogs, 3000);

  const logs       = data?.content       || [];
  const totalPages = data?.totalPages    || 0;
  const total      = data?.totalElements || 0;

  const handleFilterChange = (key, value) => {
    setFilters(f => ({ ...f, [key]: value }));
    setPage(0);
  };

  const toggleExpand = (id) =>
    setExpandedId(prev => prev === id ? null : id);

  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, color: '#1e293b' }}>
          Eventos en tiempo real
          <span style={{ marginLeft: 8, fontSize: 13, color: '#94a3b8', fontWeight: 400 }}>
            ({total} registros) · actualización cada 3s
          </span>
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse 1.5s infinite' }} />
          <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>EN VIVO</span>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <select
          value={filters.service}
          onChange={e => handleFilterChange('service', e.target.value)}
          style={selectStyle}
        >
          <option value="">Todos los servicios</option>
          <option value="INVENTORY">Inventario</option>
          <option value="ORDERS">Pedidos</option>
          <option value="PAYMENTS">Pagos</option>
        </select>

        <select
          value={filters.status}
          onChange={e => handleFilterChange('status', e.target.value)}
          style={selectStyle}
        >
          <option value="">Todos los estados</option>
          <option value="SUCCESS">SUCCESS</option>
          <option value="ERROR">ERROR</option>
        </select>

        <input
          type="datetime-local"
          value={filters.from}
          onChange={e => handleFilterChange('from', e.target.value)}
          style={{ ...selectStyle, color: filters.from ? '#1e293b' : '#94a3b8' }}
          placeholder="Desde"
        />
        <input
          type="datetime-local"
          value={filters.to}
          onChange={e => handleFilterChange('to', e.target.value)}
          style={{ ...selectStyle, color: filters.to ? '#1e293b' : '#94a3b8' }}
          placeholder="Hasta"
        />

        <button
          onClick={() => { setFilters({ service: '', status: '', from: '', to: '' }); setPage(0); }}
          style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', color: '#64748b', fontSize: 13 }}
        >
          Reiniciar
        </button>
      </div>

      {/* Error / Loading */}
      {error && <div style={{ color: '#dc2626', marginBottom: 12, fontSize: 13 }}>⚠ {error}</div>}

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              {['Trace ID', 'Servicio', 'Operación', 'Duración', 'Estado', 'Fecha'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && logs.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Cargando eventos...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Sin eventos. Ejecuta tráfico controlado para poblar la vista.</td></tr>
            ) : (
              logs.map(log => (
                <React.Fragment key={log.requestId}>
                  <tr
                    onClick={() => toggleExpand(log.requestId)}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      background: expandedId === log.requestId ? '#f0f9ff' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = expandedId === log.requestId ? '#f0f9ff' : 'transparent'}
                  >
                    <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 11, color: '#64748b' }}>
                      {log.requestId?.substring(0, 8)}…
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1e293b' }}>
                      {log.serviceId}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#475569' }}>
                      {log.operation}
                    </td>
                    <td style={{ padding: '10px 12px', color: log.durationMs > 200 ? '#d97706' : '#16a34a', fontWeight: 600 }}>
                      {log.durationMs}ms
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, ...STATUS_STYLE[log.status] }}>
                        {log.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#94a3b8', fontSize: 11 }}>
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
                    </td>
                  </tr>

                  {/* Expandable details */}
                  {expandedId === log.requestId && (
                    <tr>
                      <td colSpan={6} style={{ padding: 0 }}>
                        <div style={{ background: '#f8fafc', borderLeft: '4px solid #6366f1', padding: 16, fontSize: 12 }}>
                          <strong style={{ color: '#1e293b', display: 'block', marginBottom: 8 }}>
                            Detalles del evento - {log.requestId}
                          </strong>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                              <p style={{ margin: '0 0 4px', color: '#64748b', fontWeight: 600 }}>Entrada</p>
                              <pre style={preStyle}>
                                {JSON.stringify(log.inputParams || [], null, 2)}
                              </pre>
                            </div>
                            <div>
                              <p style={{ margin: '0 0 4px', color: '#64748b', fontWeight: 600 }}>
                                {log.status === 'ERROR' ? 'Incidencia' : 'Salida'}
                              </p>
                              <pre style={{ ...preStyle, color: log.status === 'ERROR' ? '#dc2626' : '#1e293b' }}>
                                {log.status === 'ERROR'
                                  ? log.errorMessage
                                  : JSON.stringify(log.result || {}, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={pageBtnStyle(page === 0)}>
            ← Anterior
          </button>
          <span style={{ padding: '6px 12px', fontSize: 13, color: '#64748b' }}>
            Página {page + 1} / {totalPages}
          </span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={pageBtnStyle(page >= totalPages - 1)}>
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
};

const selectStyle = {
  padding: '8px 12px', borderRadius: 8,
  border: '1px solid #e2e8f0', background: '#f8fafc',
  fontSize: 13, color: '#1e293b', cursor: 'pointer', outline: 'none',
};

const preStyle = {
  margin: 0, background: '#fff', border: '1px solid #e2e8f0',
  borderRadius: 6, padding: 8, fontSize: 11,
  maxHeight: 120, overflowY: 'auto', whiteSpace: 'pre-wrap',
};

const pageBtnStyle = (disabled) => ({
  padding: '6px 16px', borderRadius: 8, border: '1px solid #e2e8f0',
  background: disabled ? '#f1f5f9' : '#6366f1',
  color: disabled ? '#94a3b8' : '#fff',
  cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 13,
});

export default LogsTable;
