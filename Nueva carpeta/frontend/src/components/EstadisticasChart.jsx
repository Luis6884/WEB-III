import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336'];

function EstadisticasChart({ estadisticas, totalProductos, totalStock }) {
    const [tipoGrafico, setTipoGrafico] = useState('barras');

    if (!estadisticas || estadisticas.length === 0) {
        return <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>📊 No hay datos para mostrar</div>;
    }

    const datos = estadisticas.map(item => ({
        name: item.categoria,
        cantidad: item.cantidad,
        stock: item.total_stock
    }));

    return (
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginTop: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ margin: 0 }}>📊 Productos por Categoría</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => setTipoGrafico('barras')}
                        style={{
                            padding: '6px 12px',
                            background: tipoGrafico === 'barras' ? '#4CAF50' : '#e0e0e0',
                            color: tipoGrafico === 'barras' ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        📊 Barras
                    </button>
                    <button
                        onClick={() => setTipoGrafico('torta')}
                        style={{
                            padding: '6px 12px',
                            background: tipoGrafico === 'torta' ? '#4CAF50' : '#e0e0e0',
                            color: tipoGrafico === 'torta' ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        🥧 Torta
                    </button>
                    <button
                        onClick={() => setTipoGrafico('resumen')}
                        style={{
                            padding: '6px 12px',
                            background: tipoGrafico === 'resumen' ? '#4CAF50' : '#e0e0e0',
                            color: tipoGrafico === 'resumen' ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        📋 Resumen
                    </button>
                </div>
            </div>

            {tipoGrafico === 'barras' && (
                <div style={{ height: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={datos}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="cantidad" name="Cantidad de Productos" fill="#4CAF50" />
                            <Bar dataKey="stock" name="Unidades en Stock" fill="#2196F3" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {tipoGrafico === 'torta' && (
                <div style={{ height: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={datos}
                                dataKey="cantidad"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={120}
                                label
                            >
                                {datos.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}

            {tipoGrafico === 'resumen' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '40px' }}>💻</div>
                        <h3>Total Productos</h3>
                        <p style={{ fontSize: '28px', fontWeight: 'bold' }}>{totalProductos || 0}</p>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '40px' }}>📦</div>
                        <h3>Stock Total</h3>
                        <p style={{ fontSize: '28px', fontWeight: 'bold' }}>{totalStock || 0} uds</p>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '40px' }}>🏷️</div>
                        <h3>Categorías</h3>
                        <p style={{ fontSize: '28px', fontWeight: 'bold' }}>{estadisticas.length}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EstadisticasChart;