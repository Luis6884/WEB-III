import { useState } from 'react';
import { FaShoppingCart, FaTrash, FaCreditCard, FaQrcode } from 'react-icons/fa';

function Carrito({ carrito, setCarrito, productos, setProductos, token }) {
    const [mostrarCarrito, setMostrarCarrito] = useState(false);
    const [metodoPago, setMetodoPago] = useState('');
    const [mostrarPago, setMostrarPago] = useState(false);
    const [numeroTarjeta, setNumeroTarjeta] = useState('');
    const [fechaExpiracion, setFechaExpiracion] = useState('');
    const [cvv, setCvv] = useState('');
    const [pagoConfirmado, setPagoConfirmado] = useState(false);
    const [cargando, setCargando] = useState(false);

    const eliminarDelCarrito = (id) => {
        setCarrito(carrito.filter(item => item.id !== id));
    };

    const actualizarCantidad = (id, cantidad) => {
        if (cantidad < 1) {
            eliminarDelCarrito(id);
            return;
        }
        setCarrito(carrito.map(item => 
            item.id === id ? { ...item, cantidad: parseInt(cantidad) } : item
        ));
    };

    const calcularTotal = () => {
        return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0).toFixed(2);
    };

    const guardarCompra = async (metodoPago) => {
        const productosComprados = carrito.map(item => ({
            id: item.id,
            nombre: item.nombre,
            precio: item.precio,
            cantidad: item.cantidad,
            subtotal: item.precio * item.cantidad
        }));

        try {
            const response = await fetch('http://localhost:3000/api/compras', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({
                    total: parseFloat(calcularTotal()),
                    metodoPago: metodoPago,
                    productos: productosComprados
                })
            });

            if (!response.ok) {
                throw new Error('Error al guardar la compra');
            }

            return true;
        } catch (error) {
            console.error('Error al guardar compra:', error);
            return false;
        }
    };

    const actualizarStock = async () => {
        try {
            for (const item of carrito) {
                const productoOriginal = productos.find(p => p.id === item.id);
                const nuevoStock = productoOriginal.stock - item.cantidad;
                
                console.log(`🔄 Actualizando ${item.nombre}: stock ${productoOriginal.stock} -> ${nuevoStock}`);
                
                const response = await fetch(`http://localhost:3000/api/productos/${item.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    },
                    body: JSON.stringify({
                        nombre: productoOriginal.nombre,
                        categoria: productoOriginal.categoria,
                        precio: productoOriginal.precio,
                        stock: nuevoStock,
                        icono: productoOriginal.icono
                    })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('❌ Error respuesta:', errorData);
                    throw new Error(`Error al actualizar stock de ${item.nombre}: ${errorData.error || response.statusText}`);
                }
                
                console.log(`✅ Stock actualizado para ${item.nombre}`);
            }
            
            const productosActualizados = productos.map(p => {
                const itemComprado = carrito.find(item => item.id === p.id);
                if (itemComprado) {
                    return { ...p, stock: p.stock - itemComprado.cantidad };
                }
                return p;
            });
            setProductos(productosActualizados);
            
            return true;
        } catch (error) {
            console.error('❌ Error al actualizar stock:', error);
            alert(`Error: ${error.message}`);
            return false;
        }
    };

    const procesarPagoConTarjeta = async () => {
        if (!numeroTarjeta || numeroTarjeta.replace(/\s/g, '').length < 16) {
            alert('❌ Ingresa un número de tarjeta válido (16 dígitos)');
            return;
        }
        if (!fechaExpiracion) {
            alert('❌ Ingresa la fecha de expiración');
            return;
        }
        if (!cvv || cvv.length < 3) {
            alert('❌ Ingresa un CVV válido (3 dígitos)');
            return;
        }
        
        setCargando(true);
        
        const stockActualizado = await actualizarStock();
        if (!stockActualizado) {
            setCargando(false);
            alert('❌ Error al procesar la compra. Intenta nuevamente.');
            return;
        }
        
        const compraGuardada = await guardarCompra('Tarjeta de Crédito');
        if (!compraGuardada) {
            alert('⚠️ La compra se realizó pero no se pudo guardar el registro.');
        }
        
        alert(`✅ ¡Compra realizada con éxito!\n\n📦 Método de pago: Tarjeta de Crédito\n💰 Total: Bs. ${calcularTotal()}\n\n¡Gracias por tu compra!`);
        
        setCargando(false);
        finalizarCompra();
    };

    const confirmarPagoQR = async () => {
        setCargando(true);
        
        const stockActualizado = await actualizarStock();
        if (!stockActualizado) {
            setCargando(false);
            alert('❌ Error al procesar la compra. Intenta nuevamente.');
            return;
        }
        
        const compraGuardada = await guardarCompra('Pago Móvil / QR');
        if (!compraGuardada) {
            alert('⚠️ La compra se realizó pero no se pudo guardar el registro.');
        }
        
        alert(`✅ ¡Compra realizada con éxito!\n\n📦 Método de pago: Pago Móvil / QR\n💰 Total: Bs. ${calcularTotal()}\n\n¡Gracias por tu compra!`);
        
        setCargando(false);
        finalizarCompra();
    };

    const finalizarCompra = () => {
        setCarrito([]);
        setMostrarCarrito(false);
        setMostrarPago(false);
        setMetodoPago('');
        setNumeroTarjeta('');
        setFechaExpiracion('');
        setCvv('');
        setPagoConfirmado(false);
        setCargando(false);
    };

    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

    return (
        <>
            <button 
                onClick={() => setMostrarCarrito(!mostrarCarrito)}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50px',
                    padding: '12px 18px',
                    cursor: 'pointer',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}
            >
                <FaShoppingCart size={18} /> Carrito ({totalItems})
            </button>

            {mostrarCarrito && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '480px',
                    maxWidth: '90%',
                    maxHeight: '85%',
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    zIndex: 1001,
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
                        color: 'white',
                        padding: '15px 20px',
                        borderRadius: '16px 16px 0 0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h3 style={{ margin: 0, fontSize: '18px' }}>🛒 Mi Carrito</h3>
                        <button 
                            onClick={() => {
                                setMostrarCarrito(false);
                                setMostrarPago(false);
                                setMetodoPago('');
                                setPagoConfirmado(false);
                            }}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                color: 'white',
                                fontSize: '18px',
                                cursor: 'pointer',
                                borderRadius: '50%',
                                width: '28px',
                                height: '28px'
                            }}
                        >✕</button>
                    </div>

                    <div style={{ padding: '20px', flex: 1 }}>
                        {carrito.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#000000' }}>
                                <FaShoppingCart size={40} style={{ opacity: 0.5 }} />
                                <p style={{ color: '#000000' }}>Tu carrito está vacío</p>
                            </div>
                        ) : (
                            <>
                                {!mostrarPago ? (
                                    <>
                                        {carrito.map(item => {
                                            const productoOriginal = productos.find(p => p.id === item.id);
                                            return (
                                                <div key={item.id} style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    borderBottom: '1px solid #eee',
                                                    padding: '10px 0'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <span style={{ fontSize: '24px' }}>{productoOriginal?.icono || '📦'}</span>
                                                        <div>
                                                            <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#000000' }}>{item.nombre}</div>
                                                            <div style={{ fontSize: '11px', color: '#000000' }}>Bs. {item.precio} c/u</div>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max={productoOriginal?.stock || 999}
                                                            value={item.cantidad}
                                                            onChange={(e) => actualizarCantidad(item.id, e.target.value)}
                                                            style={{
                                                                width: '45px',
                                                                padding: '4px',
                                                                textAlign: 'center',
                                                                border: '1px solid #ddd',
                                                                borderRadius: '6px',
                                                                fontSize: '12px',
                                                                color: '#000000'
                                                            }}
                                                        />
                                                        <button
                                                            onClick={() => eliminarDelCarrito(item.id)}
                                                            style={{
                                                                background: '#f44336',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                padding: '4px 8px',
                                                                cursor: 'pointer',
                                                                fontSize: '12px'
                                                            }}
                                                        >
                                                            <FaTrash size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        
                                        <div style={{
                                            marginTop: '20px',
                                            paddingTop: '15px',
                                            borderTop: '2px solid #ddd',
                                            textAlign: 'right'
                                        }}>
                                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#000000' }}>
                                                Total: Bs. {calcularTotal()}
                                            </div>
                                            <button
                                                onClick={() => setMostrarPago(true)}
                                                style={{
                                                    marginTop: '15px',
                                                    background: '#4CAF50',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '10px 20px',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                Proceder a Pagar
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h4 style={{ marginBottom: '15px', fontSize: '16px', color: '#000000' }}>Selecciona método de pago:</h4>
                                        
                                        <button
                                            onClick={() => { setMetodoPago('Tarjeta de Crédito'); setPagoConfirmado(false); }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '12px',
                                                border: metodoPago === 'Tarjeta de Crédito' && !pagoConfirmado ? '2px solid #4CAF50' : '1px solid #ddd',
                                                borderRadius: '8px',
                                                background: metodoPago === 'Tarjeta de Crédito' && !pagoConfirmado ? '#e8f5e9' : 'white',
                                                cursor: 'pointer',
                                                width: '100%',
                                                marginBottom: '10px'
                                            }}
                                        >
                                            <FaCreditCard size={20} color="#2196F3" />
                                            <span style={{ fontSize: '14px', color: '#000000' }}>Tarjeta de Crédito/Débito</span>
                                        </button>
                                        
                                        {metodoPago === 'Tarjeta de Crédito' && !pagoConfirmado && (
                                            <div style={{ marginTop: '10px', marginBottom: '15px', padding: '10px', background: '#f5f5f5', borderRadius: '8px' }}>
                                                <div style={{ marginBottom: '8px' }}>
                                                    <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px', color: '#000000' }}>Número de Tarjeta</label>
                                                    <input
                                                        type="text"
                                                        placeholder="1234 5678 9012 3456"
                                                        maxLength="19"
                                                        value={numeroTarjeta}
                                                        onChange={(e) => setNumeroTarjeta(e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim())}
                                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '12px', color: '#000000' }}
                                                    />
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px', color: '#000000' }}>Fecha Expiración</label>
                                                        <input
                                                            type="text"
                                                            placeholder="MM/AA"
                                                            maxLength="5"
                                                            value={fechaExpiracion}
                                                            onChange={(e) => setFechaExpiracion(e.target.value)}
                                                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '12px', color: '#000000' }}
                                                        />
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px', color: '#000000' }}>CVV</label>
                                                        <input
                                                            type="password"
                                                            placeholder="123"
                                                            maxLength="3"
                                                            value={cvv}
                                                            onChange={(e) => setCvv(e.target.value)}
                                                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '12px', color: '#000000' }}
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={procesarPagoConTarjeta}
                                                    disabled={cargando}
                                                    style={{
                                                        marginTop: '10px',
                                                        width: '100%',
                                                        background: '#4CAF50',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '10px',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    {cargando ? "Procesando..." : "Pagar con Tarjeta"}
                                                </button>
                                            </div>
                                        )}
                                        
                                        <button
                                            onClick={() => { setMetodoPago('QR'); setPagoConfirmado(false); }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '12px',
                                                border: metodoPago === 'QR' && !pagoConfirmado ? '2px solid #4CAF50' : '1px solid #ddd',
                                                borderRadius: '8px',
                                                background: metodoPago === 'QR' && !pagoConfirmado ? '#e8f5e9' : 'white',
                                                cursor: 'pointer',
                                                width: '100%',
                                                marginBottom: '10px'
                                            }}
                                        >
                                            <FaQrcode size={20} color="#4CAF50" />
                                            <span style={{ fontSize: '14px', color: '#000000' }}>Pago Móvil / QR</span>
                                        </button>
                                        
                                        {metodoPago === 'QR' && !pagoConfirmado && (
                                            <div style={{ 
                                                marginTop: '10px', 
                                                marginBottom: '15px', 
                                                padding: '15px', 
                                                background: '#f5f5f5', 
                                                borderRadius: '8px',
                                                textAlign: 'center'
                                            }}>
                                                <p style={{ fontSize: '12px', color: '#000000', marginBottom: '10px' }}>
                                                    Escanea este código QR con tu aplicación de pagos:
                                                </p>
                                                <div style={{ 
                                                    background: 'white', 
                                                    padding: '10px', 
                                                    borderRadius: '8px', 
                                                    display: 'inline-block',
                                                    marginBottom: '10px'
                                                }}>
                                                    <img 
                                                        src="/img/qr_pago.png" 
                                                        alt="Código QR para pago"
                                                        style={{ width: '150px', height: '150px', objectFit: 'contain' }}
                                                        onError={(e) => {
                                                            e.target.src = 'https://via.placeholder.com/150?text=QR+Code';
                                                            e.target.alt = 'QR no disponible';
                                                        }}
                                                    />
                                                </div>
                                                <p style={{ fontSize: '11px', color: '#000000' }}>
                                                    Total a pagar: <strong style={{ color: '#000000' }}>Bs. {calcularTotal()}</strong>
                                                </p>
                                                <button
                                                    onClick={() => setPagoConfirmado(true)}
                                                    style={{
                                                        marginTop: '10px',
                                                        width: '100%',
                                                        background: '#2196F3',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '10px',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    Ya realicé el pago
                                                </button>
                                            </div>
                                        )}
                                        
                                        {metodoPago === 'QR' && pagoConfirmado && (
                                            <div style={{ 
                                                marginTop: '10px', 
                                                marginBottom: '15px', 
                                                padding: '15px', 
                                                background: '#e8f5e9', 
                                                borderRadius: '8px',
                                                textAlign: 'center'
                                            }}>
                                                <p style={{ fontSize: '14px', color: '#000000', marginBottom: '10px' }}>
                                                    ✅ Pago registrado correctamente
                                                </p>
                                                <p style={{ fontSize: '12px', color: '#000000' }}>
                                                    Total: Bs. {calcularTotal()}
                                                </p>
                                                <button
                                                    onClick={confirmarPagoQR}
                                                    disabled={cargando}
                                                    style={{
                                                        marginTop: '10px',
                                                        width: '100%',
                                                        background: '#4CAF50',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '10px',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    {cargando ? "Procesando..." : "Confirmar y Finalizar Compra"}
                                                </button>
                                            </div>
                                        )}
                                        
                                        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                            <button
                                                onClick={() => {
                                                    setMostrarPago(false);
                                                    setMetodoPago('');
                                                    setPagoConfirmado(false);
                                                    setNumeroTarjeta('');
                                                    setFechaExpiracion('');
                                                    setCvv('');
                                                }}
                                                style={{
                                                    flex: 1,
                                                    background: '#666',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '10px',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                Volver
                                            </button>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {mostrarCarrito && (
                <div
                    onClick={() => {
                        setMostrarCarrito(false);
                        setMostrarPago(false);
                        setMetodoPago('');
                        setPagoConfirmado(false);
                    }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 1000
                    }}
                />
            )}
        </>
    );
}

export default Carrito;