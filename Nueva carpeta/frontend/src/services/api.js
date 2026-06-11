import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// ============ CAPTCHA ============
export const captchaService = {
    getCaptcha: async () => {
        return await api.get('/captcha');
    }
};

// ============ AUTENTICACIÓN ============
export const authService = {
    login: async (email, password, captchaId, captchaText) => {
        return await api.post('/login', { email, password, captchaId, captchaText });
    },
    registro: async (userData) => {
        return await api.post('/registro', userData);
    },
    logout: async (token) => {
        return await api.post('/logout', {}, {
            headers: { Authorization: token }
        });
    }
};

// ============ PRODUCTOS ============
export const productosService = {
    getAll: async (token) => {
        return await api.get('/productos', {
            headers: { Authorization: token }
        });
    },
    create: async (token, producto) => {
        return await api.post('/productos', producto, {
            headers: { Authorization: token }
        });
    },
    update: async (token, id, producto) => {
        return await api.put(`/productos/${id}`, producto, {
            headers: { Authorization: token }
        });
    },
    delete: async (token, id) => {
        return await api.delete(`/productos/${id}`, {
            headers: { Authorization: token }
        });
    }
};

// ============ ESTADÍSTICAS ============
export const estadisticasService = {
    get: async (token) => {
        return await api.get('/estadisticas', {
            headers: { Authorization: token }
        });
    }
};

// ============ LOGS ============
export const logsService = {
    getAll: async (token) => {
        return await api.get('/logs', {
            headers: { Authorization: token }
        });
    }
};

// ============ COMPRAS ============
export const comprasService = {
    crear: async (token, compraData) => {
        return await api.post('/compras', compraData, {
            headers: { Authorization: token }
        });
    },
    misCompras: async (token) => {
        return await api.get('/compras/mis-compras', {
            headers: { Authorization: token }
        });
    }
};

export default api;