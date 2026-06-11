import { useState, useEffect } from 'react';
import { productosService, estadisticasService, logsService } from '../services/api';
import { generarReporteProductos } from '../services/pdfService';
import EstadisticasChart from '../components/EstadisticasChart';
import Carrito from '../components/Carrito';

function Dashboard({ user, onLogout }) {
  const [token] = useState(localStorage.getItem('token'));
  const [productos, setProductos] = useState([]);
  const [estadisticas, setEstadisticas] = useState([]);
  const [logs, setLogs] = useState([]);
  const [seccionActual, setSeccionActual] = useState('productos');
  const [mensaje, setMensaje] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [misCompras, setMisCompras] = useState([]);
  
  const [formProducto, setFormProducto] = useState({ nombre: '', categoria: '', precio: '', stock: '', icono: '📦', imagen_url: '' });
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    cargarProductos();
    if (user.rol === 'admin') {
      cargarEstadisticas();
      cargarLogs();
    }
  }, []);

  useEffect(() => {
    if (seccionActual === 'mis-compras' && user.rol === 'cliente') {
      cargarMisCompras();
    }
  }, [seccionActual]);

  const cargarProductos = async () => {
    try {
      const res = await productosService.getAll(token);
      setProductos(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const res = await estadisticasService.get(token);
      setEstadisticas(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const cargarLogs = async () => {
    try {
      const res = await logsService.getAll(token);
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const cargarMisCompras = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/compras/mis-compras', {
        headers: { 'Authorization': token }
      });
      const data = await response.json();
      setMisCompras(data);
    } catch (error) {
      console.error('Error al cargar compras:', error);
    }
  };

  const crearProducto = async () => {
    if (!formProducto.nombre || !formProducto.categoria || !formProducto.precio) {
      setMensaje('❌ Complete todos los campos');
      setTimeout(() => setMensaje(''), 2000);
      return;
    }
    try {
      if (editandoId) {
        await productosService.update(token, editandoId, formProducto);
        setMensaje('✅ Producto actualizado');
        setEditandoId(null);
      } else {
        await productosService.create(token, formProducto);
        setMensaje('✅ Producto agregado');
      }
      cargarProductos();
      cargarEstadisticas();
      setFormProducto({ nombre: '', categoria: '', precio: '', stock: '', icono: '📦', imagen_url: '' });
      setTimeout(() => setMensaje(''), 2000);
    } catch (err) {
      setMensaje('❌ Error al guardar');
    }
  };

  const eliminarProducto = async (id, nombre) => {
    if (confirm(`¿Eliminar "${nombre}"? (Eliminación lógica)`)) {
      try {
        await productosService.delete(token, id);
        cargarProductos();
        cargarEstadisticas();
        setMensaje(`🗑️ Producto "${nombre}" eliminado lógicamente`);
        setTimeout(() => setMensaje(''), 2000);
      } catch (err) {
        setMensaje('❌ Error al eliminar');
      }
    }
  };

  const editarProducto = (producto) => {
    setEditandoId(producto.id);
    setFormProducto({
      nombre: producto.nombre,
      categoria: producto.categoria,
      precio: producto.precio,
      stock: producto.stock,
      icono: producto.icono || '📦',
      imagen_url: producto.imagen_url || ''
    });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setFormProducto({ nombre: '', categoria: '', precio: '', stock: '', icono: '📦', imagen_url: '' });
  };

  const getIcono = (icono) => icono || '📦';

  const generarReportePDF = () => {
    if (productos.length === 0) {
      alert("No hay productos para generar el reporte");
      return;
    }
    generarReporteProductos(productos, "Reporte de Productos - ElectroShop");
  };

  const mostrarGrafico = () => {
    if (estadisticas.length === 0) {
      alert("No hay datos para mostrar");
      return;
    }
    let mensaje = "📊 ESTADÍSTICAS POR CATEGORÍA 📊\n\n";
    estadisticas.forEach(est => {
      mensaje += `${est.categoria}: ${est.cantidad} productos | Stock: ${est.total_stock} unidades\n`;
      mensaje += "─".repeat(30) + "\n";
    });
    alert(mensaje);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-area">
            <div className="logo-icon">🔌</div>
            <div>
              <h1>ElectroShop</h1>
              <p>Tu tienda de electrónica de confianza</p>
            </div>
          </div>
          <div className="user-area">
            <div>
              <div className="user-name">{user.nombre}</div>
              <div className="user-role">{user.rol === 'admin' ? 'Administrador' : 'Cliente'}</div>
            </div>
            <button className="logout-btn" onClick={onLogout}>Cerrar Sesión</button>
          </div>
        </div>
      </header>

      <nav className="main-nav">
        <ul>
          <li className={seccionActual === 'productos' ? 'active' : ''} onClick={() => setSeccionActual('productos')}>🏠 Productos</li>
          {user.rol === 'cliente' && (
            <li className={seccionActual === 'mis-compras' ? 'active' : ''} onClick={() => setSeccionActual('mis-compras')}>📋 Mis Compras</li>
          )}
          {user.rol === 'admin' && (
            <>
              <li className={seccionActual === 'categorias' ? 'active' : ''} onClick={() => setSeccionActual('categorias')}>📂 Categorías</li>
              <li className={seccionActual === 'stock' ? 'active' : ''} onClick={() => setSeccionActual('stock')}>📊 Stock</li>
              <li className={seccionActual === 'reportes' ? 'active' : ''} onClick={() => setSeccionActual('reportes')}>📄 Reportes</li>
              <li className={seccionActual === 'logs' ? 'active' : ''} onClick={() => { setSeccionActual('logs'); cargarLogs(); }}>📜 Logs</li>
            </>
          )}
        </ul>
      </nav>

      {mensaje && <div className="toast-mensaje">{mensaje}</div>}

      <div className="main-content">
        {seccionActual === 'productos' && (
          <div>
            <h2>🛍️ Nuestros Productos</h2>
            
            {user.rol === 'admin' && (
              <div className="admin-panel" style={{ background: '#011e4358', border: '1px solid #2196F3', borderRadius: '12px', padding: '20px', marginBottom: '30px' }}>
                <h3>{editandoId ? '✏️ Editar Producto' : '➕ Agregar Producto'}</h3>
                <div className="form-row">
                  <input type="text" placeholder="Nombre" value={formProducto.nombre} onChange={e => setFormProducto({...formProducto, nombre: e.target.value})} />
                  <select value={formProducto.categoria} onChange={e => setFormProducto({...formProducto, categoria: e.target.value})}>
                    <option value="">Categoría</option>
                    <option value="Electrónica">Electrónica</option>
                    <option value="Accesorios">Accesorios</option>
                    <option value="Audio">Audio</option>
                  </select>
                  <input type="number" placeholder="Precio" value={formProducto.precio} onChange={e => setFormProducto({...formProducto, precio: e.target.value})} />
                  <input type="number" placeholder="Stock" value={formProducto.stock} onChange={e => setFormProducto({...formProducto, stock: e.target.value})} />
                  <input type="text" placeholder="Icono (ej: 📦)" value={formProducto.icono} onChange={e => setFormProducto({...formProducto, icono: e.target.value})} maxLength="2" style={{ width: '80px' }} />
                  <input 
                    type="text" 
                    placeholder="URL de la imagen (https://ejemplo.com/imagen.jpg)" 
                    value={formProducto.imagen_url} 
                    onChange={e => setFormProducto({...formProducto, imagen_url: e.target.value})}
                    style={{ minWidth: '250px', padding: '8px', margin: '5px', flex: '1' }}
                  />
                  <button className="btn-guardar" onClick={crearProducto}>{editandoId ? '✏️ Actualizar' : '➕ Agregar'}</button>
                  {editandoId && <button className="btn-cancelar" onClick={cancelarEdicion}>Cancelar</button>}
                </div>
              </div>
            )}

            <div className="products-grid">
              {productos.map(producto => (
                <div className="product-card" key={producto.id}>
                  <div className="product-image">
                    {producto.imagen_url ? (
                      <img 
                        src={producto.imagen_url} 
                        alt={producto.nombre} 
                        style={{ 
                          width: '100%', 
                          height: '180px', 
                          objectFit: 'cover',
                          borderRadius: '10px 10px 0 0'
                        }} 
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `<span style="font-size: 48px; display: block; text-align: center; padding: 60px 0;">${getIcono(producto.icono)}</span>`;
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: '48px', display: 'block', textAlign: 'center', padding: '60px 0' }}>
                        {getIcono(producto.icono)}
                      </span>
                    )}
                  </div>
                  <div className="product-info">
                    <div className="product-title">{producto.nombre}</div>
                    <div className="product-category">
                      <span className={`category-badge category-${producto.categoria.toLowerCase()}`}>{producto.categoria}</span>
                    </div>
                    <div className="product-price">Bs{parseFloat(producto.precio).toFixed(2)}</div>
                    <div className="product-stock">📦 Stock: {producto.stock} unidades</div>
                    {user.rol === 'cliente' && (
                      <button 
                        className="btn-buy" 
                        onClick={() => {
                          const existe = carrito.find(item => item.id === producto.id);
                          if (existe) {
                            setCarrito(carrito.map(item =>
                              item.id === producto.id 
                                ? { ...item, cantidad: item.cantidad + 1 }
                                : item
                            ));
                          } else {
                            setCarrito([...carrito, { 
                              id: producto.id, 
                              nombre: producto.nombre, 
                              precio: producto.precio, 
                              cantidad: 1 
                            }]);
                          }
                          alert(`🛒 ${producto.nombre} agregado al carrito`);
                        }}
                      >
                        🛒 Agregar al carrito
                      </button>
                    )}
                    {user.rol === 'admin' && (
                      <div className="admin-buttons">
                        <button className="btn-edit" onClick={() => editarProducto(producto)}>✏️ Editar</button>
                        <button className="btn-delete" onClick={() => eliminarProducto(producto.id, producto.nombre)}>🗑️ Eliminar</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {seccionActual === 'mis-compras' && user.rol === 'cliente' && (
          <div>
            <h2>📋 Mis Compras</h2>
            {misCompras.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No has realizado compras aún</p>
            ) : (
              misCompras.map(compra => (
                <div key={compra.id} style={{
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  padding: '15px',
                  marginBottom: '15px',
                  border: '1px solid #e0e0e0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div>
                      <strong>Compra #{compra.id}</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>{new Date(compra.fecha).toLocaleString()}</div>
                    </div>
                    <div>
                      <span style={{ background: '#4CAF50', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>
                        ${parseFloat(compra.total).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                    <strong>Método de pago:</strong> {compra.metodo_pago}
                  </div>
                  <div style={{ fontSize: '13px' }}>
                    <strong>Productos:</strong>
                    <ul style={{ margin: '5px 0 0 20px' }}>
                      {JSON.parse(compra.productos).map((p, idx) => (
                        <li key={idx}>{p.nombre} x{p.cantidad} = ${p.subtotal}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {seccionActual === 'categorias' && user.rol === 'admin' && (
          <div>
            <h2>📂 Categorías</h2>
            <div className="stats-grid">
              {estadisticas.map(est => (
                <div className="stat-card" key={est.categoria}>
                  <div className="stat-icon">{est.categoria === 'Electrónica' ? '💻' : est.categoria === 'Accesorios' ? '🎮' : '🎵'}</div>
                  <div className="stat-number">{est.cantidad}</div>
                  <div className="stat-label">{est.categoria}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {seccionActual === 'stock' && user.rol === 'admin' && (
          <div>
            <h2>📊 Control de Stock</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{productos.reduce((sum, p) => sum + p.stock, 0)}</div>
                <div className="stat-label">Total Unidades</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{productos.length}</div>
                <div className="stat-label">Productos Activos</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{productos.filter(p => p.stock < 10).length}</div>
                <div className="stat-label">Stock Bajo (&lt;10)</div>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr><th>Producto</th><th>Categoría</th><th>Stock</th><th>Estado</th></tr>
              </thead>
              <tbody>
                {productos.map(p => (
                  <tr key={p.id}>
                    <td>{p.imagen_url ? '🖼️' : getIcono(p.icono)} {p.nombre}</td>
                    <td>{p.categoria}</td>
                    <td>{p.stock}</td>
                    <td>{p.stock < 10 ? '⚠️ Stock Bajo' : '✅ Normal'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {seccionActual === 'reportes' && user.rol === 'admin' && (
          <div>
            <h2>📄 Reportes</h2>
            <div className="reports-buttons">
              <button className="btn-reporte" onClick={generarReportePDF}>📄 Generar Reporte PDF</button>
              <button className="btn-grafico" onClick={mostrarGrafico}>📊 Ver Gráfico Estadístico</button>
            </div>
            <div className="report-preview">
              <h3>Vista previa de reportes:</h3>
              <ul>
                <li>📊 Reporte de productos más vendidos</li>
                <li>📈 Gráfico de ventas por categoría</li>
                <li>📑 Reporte de stock bajo</li>
              </ul>
            </div>
            
            {estadisticas.length > 0 && (
              <div style={{ marginTop: '30px' }}>
                <EstadisticasChart 
                  estadisticas={estadisticas}
                  totalProductos={productos.length}
                  totalStock={productos.reduce((sum, p) => sum + p.stock, 0)}
                />
              </div>
            )}
          </div>
        )}

        {seccionActual === 'logs' && user.rol === 'admin' && (
          <div>
            <h2>📜 Logs de Acceso</h2>
            <table className="data-table">
              <thead>
                <tr><th>Usuario</th><th>Email</th><th>Evento</th><th>IP</th><th>Fecha/Hora</th></tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td>{log.nombre}</td>
                    <td>{log.email}</td>
                    <td>{log.evento === 'login' ? '🔓 Ingreso' : '🚪 Salida'}</td>
                    <td>{log.ip}</td>
                    <td>{new Date(log.fecha_hora).toLocaleString()}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>No hay logs registrados</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Carrito de compras - Solo visible para clientes */}
      {user.rol === 'cliente' && (
        <Carrito 
          carrito={carrito} 
          setCarrito={setCarrito} 
          productos={productos} 
          setProductos={setProductos}
          token={token}
        />
      )}
    </div>
  );
}

export default Dashboard;