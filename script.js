document.addEventListener('DOMContentLoaded', () => {
    const welcomeScreen = document.getElementById('welcomeScreen');
    const loginScreen = document.getElementById('loginScreen');
    const appScreen = document.getElementById('appScreen');
    const loginTabBtn = document.getElementById('loginTabBtn');
    const registerTabBtn = document.getElementById('registerTabBtn');
    const loginFormBlock = document.getElementById('loginFormBlock');
    const registerFormBlock = document.getElementById('registerFormBlock');
    const usernameLogin = document.getElementById('usernameLogin');
    const passwordLogin = document.getElementById('passwordLogin');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const registerUsername = document.getElementById('registerUsername');
    const registerPassword = document.getElementById('registerPassword');
    const registerConfirmPassword = document.getElementById('registerConfirmPassword');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const nameBurst = document.getElementById('nameBurst');
    const userNameLabel = document.getElementById('userNameLabel');
    const saldoActualEl = document.getElementById('saldoActual');
    const dineroGastadoEl = document.getElementById('dineroGastado');
    const dineroEsperadoEl = document.getElementById('dineroEsperado');
    const baseConfirmSelect = document.getElementById('baseConfirmSelect');
    const baseMoneyStatus = document.getElementById('baseMoneyStatus');
    const bodegaResumen = document.getElementById('bodegaResumen');
    const fiadosList = document.getElementById('fiadosList');
    const dangerModal = document.getElementById('dangerModal');
    const fiadoWarningList = document.getElementById('fiadoWarningList');
    const bodegaActionModal = document.getElementById('bodegaActionModal');
    const inventoryModalTitle = document.getElementById('inventoryModalTitle');
    const inventoryModalSubtitle = document.getElementById('inventoryModalSubtitle');
    const inventoryProductSelect = document.getElementById('inventoryProductSelect');
    const inventoryQuantityInput = document.getElementById('inventoryQuantityInput');
    const inventoryPriceInput = document.getElementById('inventoryPriceInput');
    const inventoryCancelBtn = document.getElementById('inventoryCancelBtn');
    const inventoryNoBtn = document.getElementById('inventoryNoBtn');
    const inventoryYesBtn = document.getElementById('inventoryYesBtn');
    const authNotification = document.getElementById('authNotification');
    const authNotificationText = document.getElementById('authNotificationText');
    const pedidoToast = document.getElementById('pedidoToast');
    const pedidoToastText = document.getElementById('pedidoToastText');
    const pedidoForm = document.getElementById('pedidoForm');
    const pedidoClienteInput = document.getElementById('pedidoClienteInput');
    const pedidoHoraInput = document.getElementById('pedidoHoraInput');
    const pedidoDetalleInput = document.getElementById('pedidoDetalleInput');
    const pedidosList = document.getElementById('pedidosList');
    const pedidoFilterSelect = document.getElementById('pedidoFilterSelect');
    const pedidoPermissionBtn = document.getElementById('pedidoPermissionBtn');
    const promoForm = document.getElementById('promoForm');
    const promoProductSelect = document.getElementById('promoProductSelect');
    const promoQuantityInput = document.getElementById('promoQuantityInput');
    const promotionsList = document.getElementById('promotionsList');
    const adminPanelBtn = document.getElementById('adminPanelBtn');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenuBackdrop = document.getElementById('mobileMenuBackdrop');
    const adminUsersList = document.getElementById('adminUsersList');
    const adminDeleteList = document.getElementById('adminDeleteList');
    const adminActivityList = document.getElementById('adminActivityList');
    const adminNewUsername = document.getElementById('adminNewUsername');
    const adminNewPassword = document.getElementById('adminNewPassword');
    const adminCreateUserForm = document.getElementById('adminCreateUserForm');
    const adminEditUserForm = document.getElementById('adminEditUserForm');
    const adminEditUserSelect = document.getElementById('adminEditUserSelect');
    const adminEditUsername = document.getElementById('adminEditUsername');
    const adminEditPassword = document.getElementById('adminEditPassword');
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutBtnRegular = document.getElementById('logoutBtnRegular');
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');

    const STORAGE_PREFIX = 'waterAppState_';
    const USERS_KEY = 'waterUsersAccounts';
    const DEFAULT_USERS = [
        { username: 'admin', password: 'admin123', role: 'admin' },
        { username: 'alejandro', password: '1234', role: 'user' },
        { username: 'felipe', password: '1234', role: 'user' }
    ];
    const productOptions = [
        'Botellón',
        '7 litros',
        'Paquete de cuarto',
        'Paquete de media',
        'Paquete de litro',
        'Preparada',
        '5 litros',
        'Loncherin',
        'Paquete junior'
    ];

    const facturaProductPrices = {
        'Botellón': 2500,
        '7 litros': 1300,
        'Paquete de cuarto': 2600,
        'Paquete de media': 2600,
        'Paquete de litro': 1900,
        'Loncherin': 7500
    };

    const ventaProductPrices = {
        'Botellón': 5500,
        '7 litros': 1900,
        'Paquete de cuarto': 5500,
        'Paquete de media': 5500,
        'Preparada': 6500,
        'Paquete de litro': 3500,
        'Loncherin': 9500,
        'Paquete junior': 5500
    };

    const formatCurrency = (value) => new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(Number(value || 0));

    const createEmptyRow = () => ({
        product: productOptions[0],
        quantity: 1,
        unitPrice: ''
    });

    const pedidoAlarmSound = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=');

    const defaultState = {
        username: 'alejandro',
        role: 'user',
        saldoActual: 0,
        dineroGastado: 0,
        dineroEsperadoBase: 100000,
        baseConfirmada: false,
        fiados: [],
        inventario: {},
        promociones: [],
        pedidos: [],
        pedidoHistorial: [],
        ventaRows: [createEmptyRow()],
        facturaRows: [createEmptyRow()]
    };

    const state = { ...defaultState };
    const isAdminUser = (username) => String(username || '').trim().toLowerCase() === 'admin';
    const getUserStorageKey = (username = state.username) => `${STORAGE_PREFIX}${String(username || 'usuario').trim().toLowerCase()}`;

    const getUsers = () => {
        try {
            const stored = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
            const merged = stored.length ? stored : [...DEFAULT_USERS];
            const hasAdmin = merged.some((user) => String(user.username || '').trim().toLowerCase() === 'admin');
            if (!hasAdmin) {
                merged.push({ username: 'admin', password: 'admin123', role: 'admin' });
            }
            return merged;
        } catch (error) {
            return [...DEFAULT_USERS];
        }
    };

    const saveUsers = (users) => {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    };

    const ensureDefaultUsers = () => {
        const users = getUsers();
        if (!users.length) {
            saveUsers(DEFAULT_USERS);
        }
        return getUsers();
    };

    const buildProductOptions = () => productOptions.map((product) => `<option value="${product}">${product}</option>`).join('');

    const getProductPrice = (product, mode = 'factura') => {
        const normalized = String(product || '').trim();
        const source = mode === 'venta' ? ventaProductPrices : facturaProductPrices;
        return Object.prototype.hasOwnProperty.call(source, normalized) ? Number(source[normalized]) : null;
    };

    const applyTheme = (theme) => {
        const nextTheme = theme === 'dark' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', nextTheme);
        if (themeToggleBtn) {
            themeToggleBtn.textContent = nextTheme === 'dark' ? '☀️' : '🌙';
            themeToggleBtn.title = nextTheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
            themeToggleBtn.setAttribute('aria-label', nextTheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
        }
        localStorage.setItem('appThemeMode', nextTheme);
    };

    const showAuthNotification = (message, type = 'error') => {
        if (!authNotification || !authNotificationText) return;

        authNotificationText.textContent = message;
        authNotification.classList.remove('hidden');
        authNotification.classList.toggle('success', type === 'success');
        authNotification.style.display = 'flex';
        authNotification.setAttribute('data-type', type);

        clearTimeout(showAuthNotification.timeoutId);
        showAuthNotification.timeoutId = setTimeout(() => {
            authNotification.classList.add('hidden');
        }, 2800);
    };

    const showInventoryNotice = (message, type = 'success') => {
        if (!authNotification || !authNotificationText) return;

        authNotificationText.textContent = message;
        authNotification.classList.remove('hidden');
        authNotification.classList.toggle('success', type === 'success');
        authNotification.style.display = 'flex';
        authNotification.setAttribute('data-type', type);

        clearTimeout(showInventoryNotice.timeoutId);
        showInventoryNotice.timeoutId = setTimeout(() => {
            authNotification.classList.add('hidden');
        }, 3200);
    };

    const populateInventoryModalOptions = () => {
        if (!inventoryProductSelect) return;

        inventoryProductSelect.innerHTML = productOptions
            .map((product) => `<option value="${product}">${product}</option>`)
            .join('');
    };

    const openInventoryModal = (mode = 'add') => {
        if (!bodegaActionModal || !inventoryProductSelect || !inventoryQuantityInput || !inventoryPriceInput) return;

        populateInventoryModalOptions();
        const product = inventoryProductSelect.value || productOptions[0];
        const defaultPrice = getProductPrice(product, 'venta') ?? getProductPrice(product, 'factura') ?? 0;
        inventoryProductSelect.value = product;
        inventoryQuantityInput.value = '1';
        inventoryPriceInput.value = String(defaultPrice);

        if (mode === 'add') {
            inventoryModalTitle.textContent = 'Agregar producto a la bóveda';
            inventoryModalSubtitle.textContent = 'Elige la cantidad y decide si deseas registrar este movimiento como gasto.';
            inventoryYesBtn.textContent = 'Sí, sumarlo a gastos';
            inventoryNoBtn.textContent = 'No, solo agregar';
            inventoryYesBtn.classList.remove('btn-clear');
            inventoryYesBtn.classList.add('btn-primary');
            inventoryNoBtn.classList.remove('btn-primary');
            inventoryNoBtn.classList.add('btn-clear');
        } else {
            inventoryModalTitle.textContent = 'Quitar producto de la bóveda';
            inventoryModalSubtitle.textContent = 'Elige la cantidad y decide si deseas descontarlo del gasto total.';
            inventoryYesBtn.textContent = 'Sí, quitarlo de gastos';
            inventoryNoBtn.textContent = 'No, solo quitarlo';
            inventoryYesBtn.classList.remove('btn-clear');
            inventoryYesBtn.classList.add('btn-primary');
            inventoryNoBtn.classList.remove('btn-primary');
            inventoryNoBtn.classList.add('btn-clear');
        }

        bodegaActionModal.dataset.mode = mode;
        bodegaActionModal.classList.remove('hidden');
    };

    const closeInventoryModal = () => {
        if (bodegaActionModal) {
            bodegaActionModal.classList.add('hidden');
        }
    };

    const saveInventoryAction = (shouldAffectExpenses) => {
        const mode = bodegaActionModal?.dataset.mode || 'add';
        const nombreProducto = inventoryProductSelect.value;
        const cantidad = Number(inventoryQuantityInput.value || 0);
        const unitPrice = Number(inventoryPriceInput.value || 0);

        if (!nombreProducto) {
            showInventoryNotice('Selecciona un producto válido.', 'error');
            return;
        }

        if (!Number.isFinite(cantidad) || cantidad <= 0) {
            showInventoryNotice('La cantidad debe ser mayor a 0.', 'error');
            return;
        }

        if (mode === 'add') {
            state.inventario[nombreProducto] = Number(state.inventario[nombreProducto] || 0) + cantidad;
            if (shouldAffectExpenses) {
                state.dineroGastado += unitPrice * cantidad;
            }
            saveState();
            renderInventario();
            renderStats();
            showInventoryNotice(`${cantidad} ${nombreProducto} agregado${cantidad > 1 ? 's' : ''}${shouldAffectExpenses ? ' y sumado a gastos' : ''}.`, shouldAffectExpenses ? 'success' : 'error');
        } else {
            const actualStock = Number(state.inventario[nombreProducto] || 0);
            if (actualStock < cantidad) {
                showInventoryNotice(`No hay suficiente stock de ${nombreProducto}.`, 'error');
                return;
            }

            state.inventario[nombreProducto] = actualStock - cantidad;
            if (state.inventario[nombreProducto] <= 0) {
                delete state.inventario[nombreProducto];
            }

            if (shouldAffectExpenses) {
                state.dineroGastado -= unitPrice * cantidad;
            }

            saveState();
            renderInventario();
            renderStats();
            showInventoryNotice(`${cantidad} ${nombreProducto} quitado${cantidad > 1 ? 's' : ''}${shouldAffectExpenses ? ' y descontado de gastos' : ''}.`, shouldAffectExpenses ? 'success' : 'error');
        }

        closeInventoryModal();
    };

    const playPedidoAlert = () => {
        try {
            pedidoAlarmSound.currentTime = 0;
            pedidoAlarmSound.play().catch(() => {});
        } catch (error) {
            console.warn('No se pudo reproducir el sonido del pedido.', error);
        }
    };

    const showPedidoToast = (message) => {
        if (!pedidoToast || !pedidoToastText) return;
        pedidoToastText.textContent = message;
        pedidoToast.classList.remove('hidden');
        clearTimeout(showPedidoToast.timeoutId);
        showPedidoToast.timeoutId = setTimeout(() => {
            pedidoToast.classList.add('hidden');
        }, 5000);
    };

    const requestPedidoNotifications = async () => {
        if (!('Notification' in window)) {
            showPedidoToast('Tu navegador no soporta notificaciones del sistema.');
            return;
        }

        if (Notification.permission === 'granted') {
            showPedidoToast('Notificaciones activadas correctamente.');
            return;
        }

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            showPedidoToast('Permisos de notificación activados.');
        } else {
            showPedidoToast('No se habilitaron las notificaciones.');
        }
    };

    const notifyPedidoDelivery = (pedido) => {
        playPedidoAlert();
        showPedidoToast(`Pedido listo: ${pedido.cliente} para las ${pedido.hora}.`);

        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Pedido listo para entregar', {
                body: `${pedido.cliente} debe recogerlo a las ${pedido.hora}.`,
                tag: `pedido-${pedido.id}`
            });
        }
    };

    const getPedidoStatusText = (estado) => estado === 'entregado' ? 'Entregado' : 'Pendiente';

    const renderPedidos = () => {
        if (!pedidosList) return;

        const filter = pedidoFilterSelect ? pedidoFilterSelect.value : 'pendientes';
        const pedidos = [...(state.pedidos || [])].sort((a, b) => new Date(a.fechaCreacion) - new Date(b.fechaCreacion));
        const filtered = filter === 'todas'
            ? pedidos
            : pedidos.filter((pedido) => pedido.estado === (filter === 'pendientes' ? 'pendiente' : 'entregado'));

        if (!filtered.length) {
            pedidosList.innerHTML = `
                <div class="pedido-card empty-card">
                    <strong>No hay pedidos ${filter === 'pendientes' ? 'pendientes' : filter === 'entregadas' ? 'entregados' : 'registrados'}</strong>
                </div>
            `;
            return;
        }

        const cards = filtered.map((pedido) => `
            <article class="pedido-card ${pedido.estado === 'entregado' ? 'is-done' : ''}">
                <div class="pedido-card-top">
                    <div>
                        <span class="pedido-badge ${pedido.estado === 'entregado' ? 'done' : 'pending'}">${getPedidoStatusText(pedido.estado)}</span>
                        <h4>${pedido.cliente}</h4>
                    </div>
                    <strong>${pedido.hora}</strong>
                </div>
                <p>${pedido.detalle || 'Sin detalles'}</p>
                <div class="pedido-meta-row">
                    <span>Creado: ${new Date(pedido.fechaCreacion).toLocaleString('es-CO')}</span>
                    <span>${pedido.estado === 'entregado' ? 'Entregado' : 'Pendiente'}</span>
                </div>
                <div class="pedido-actions">
                    <button type="button" class="btn-secondary small pedido-mark-done" data-id="${pedido.id}">Marcar como entregado</button>
                    <button type="button" class="btn-clear small pedido-delete" data-id="${pedido.id}">Eliminar</button>
                </div>
            </article>
        `).join('');

        pedidosList.innerHTML = cards;

        pedidosList.querySelectorAll('.pedido-mark-done').forEach((btn) => {
            btn.addEventListener('click', () => {
                const pedidoId = btn.dataset.id;
                const pedido = state.pedidos.find((item) => String(item.id) === String(pedidoId));
                if (!pedido) return;
                pedido.estado = 'entregado';
                state.pedidoHistorial = state.pedidoHistorial || [];
                state.pedidoHistorial.push({
                    ...pedido,
                    entregadoEn: new Date().toISOString()
                });
                saveState();
                renderPedidos();
                showPedidoToast(`Pedido de ${pedido.cliente} marcado como entregado.`);
            });
        });

        pedidosList.querySelectorAll('.pedido-delete').forEach((btn) => {
            btn.addEventListener('click', () => {
                const pedidoId = btn.dataset.id;
                state.pedidos = (state.pedidos || []).filter((item) => String(item.id) !== String(pedidoId));
                saveState();
                renderPedidos();
                showPedidoToast('Pedido eliminado.');
            });
        });
    };

    const checkPedidoReminders = () => {
        if (!state.pedidos || !state.pedidos.length) return;

        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        state.pedidos.forEach((pedido) => {
            if (pedido.estado === 'entregado') return;
            const [hour, minute] = String(pedido.hora || '00:00').split(':').map(Number);
            const targetMinutes = (Number(hour) || 0) * 60 + (Number(minute) || 0);
            const diff = targetMinutes - currentMinutes;
            if (diff >= 0 && diff <= 2) {
                notifyPedidoDelivery(pedido);
                pedido.estado = 'pendiente';
            }
        });

        saveState();
        renderPedidos();
    };

    const saveState = () => {
        const payload = JSON.stringify({
            ...state,
            role: state.role || 'user',
            baseConfirmada: Boolean(state.baseConfirmada),
            username: state.username
        });
        localStorage.setItem(getUserStorageKey(state.username), payload);
    };

    const normalizeBaseState = (value) => value === true || value === 'si';

    const resetUserState = (username = state.username, role = state.role || 'user') => {
        Object.assign(state, defaultState, {
            username,
            role,
            saldoActual: 0,
            dineroGastado: 0,
            dineroEsperadoBase: 100000,
            baseConfirmada: false,
            fiados: [],
            inventario: {},
            promociones: [],
            ventaRows: [createEmptyRow()],
            facturaRows: [createEmptyRow()]
        });
    };

    const loadState = (username = state.username) => {
        const key = getUserStorageKey(username);
        const stored = localStorage.getItem(key);

        if (!stored) {
            resetUserState(username, isAdminUser(username) ? 'admin' : 'user');
            return;
        }

        try {
            const parsed = JSON.parse(stored);
            Object.assign(state, defaultState, parsed, {
                username,
                role: parsed.role || (isAdminUser(username) ? 'admin' : 'user'),
                baseConfirmada: normalizeBaseState(parsed.baseConfirmada)
            });
        } catch (error) {
            console.warn('No se pudo cargar la información guardada.', error);
            resetUserState(username, isAdminUser(username) ? 'admin' : 'user');
        }
    };

    const syncBaseBalance = (optionValue) => {
        const baseAmount = Number(state.dineroEsperadoBase || 0);

        if (optionValue === 'si') {
            if (!state.baseConfirmada) {
                state.saldoActual += baseAmount;
                state.baseConfirmada = true;
            }
        } else {
            if (state.baseConfirmada) {
                state.saldoActual -= baseAmount;
                state.baseConfirmada = false;
            }
        }
    };

    const renderStats = () => {
        userNameLabel.textContent = state.username.charAt(0).toUpperCase() + state.username.slice(1);
        saldoActualEl.textContent = formatCurrency(state.saldoActual);
        dineroGastadoEl.textContent = formatCurrency(state.dineroGastado);
        dineroEsperadoEl.textContent = formatCurrency(state.dineroEsperadoBase);

        if (normalizeBaseState(state.baseConfirmada) || baseConfirmSelect.value === 'si') {
            baseMoneyStatus.textContent = 'Sí contamos con esos $100.000 y se consideran en la base.';
            baseMoneyStatus.style.color = '#1f9d69';
        } else if (!normalizeBaseState(state.baseConfirmada) || baseConfirmSelect.value === 'no') {
            baseMoneyStatus.textContent = 'No contamos con esos $100.000, por lo tanto no se suman al saldo.';
            baseMoneyStatus.style.color = '#d14343';
        } else {
            baseMoneyStatus.textContent = 'Aún no se confirmó.';
            baseMoneyStatus.style.color = '#4b5563';
        }
    };

    const renderInventario = () => {
        const entries = Object.entries(state.inventario);

        if (!entries.length) {
            bodegaResumen.innerHTML = '<div class="bodega-item"><span>Sin productos en bodega</span><strong>0</strong></div>';
            return;
        }

        const items = entries.map(([producto, cantidad]) => {
            return `<div class="bodega-item"><span>${producto}</span><strong>${cantidad} und.</strong></div>`;
        }).join('');

        bodegaResumen.innerHTML = items;
    };

    const formatDate = (dateValue) => {
        const date = new Date(dateValue);
        return Number.isNaN(date.getTime()) ? 'Sin fecha' : date.toLocaleDateString('es-CO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const renderFiados = () => {
        if (!state.fiados.length) {
            fiadosList.innerHTML = '<li class="fiado-item"><span>No hay productos fiados</span></li>';
            return;
        }

        fiadosList.innerHTML = state.fiados.map((item) => `
            <li class="fiado-item fiado-summary-item">
                <div class="fiado-copy">
                    <strong>${item.producto}</strong>
                    <span>${formatDate(item.fecha)} · ${item.fiador}</span>
                    <span>${item.cantidad} und. · ${formatCurrency(item.total)}</span>
                </div>
            </li>
        `).join('');
    };

    const renderPromociones = () => {
        if (!state.promociones.length) {
            promotionsList.innerHTML = '<li class="promo-item"><span>No hay promociones activas</span></li>';
            return;
        }

        promotionsList.innerHTML = state.promociones.map((promo) => {
            const tipoLabel = promo.tipo === 'perdido' ? 'Producto perdido' : 'Promoción';
            return `
                <li class="promo-item">
                    <span>${promo.producto} - ${promo.cantidad} und. · ${tipoLabel}</span>
                    <strong>${promo.activa ? 'Activa' : 'Inactiva'}</strong>
                </li>
            `;
        }).join('');
    };

    const renderFiadoWarningList = () => {
        if (!state.fiados.length) {
            fiadoWarningList.innerHTML = '<div class="fiado-warning-item empty"><span>No hay fiados registrados.</span></div>';
            return;
        }

        fiadoWarningList.innerHTML = state.fiados.map((item) => `
            <div class="fiado-warning-item">
                <strong>${item.producto}</strong>
                <span>Persona: ${item.fiador || 'Sin nombre'}</span>
                <span>Cantidad: ${item.cantidad} und.</span>
                <span>Total: ${formatCurrency(item.total)}</span>
            </div>
        `).join('');
    };

    const populatePromoSelect = () => {
        promoProductSelect.innerHTML = '<option value="">Selecciona producto</option>' + buildProductOptions();
    };

    const saveAndLogout = () => {
        saveState();
        loginScreen.classList.remove('hidden');
        appScreen.classList.add('hidden');
        usernameLogin.value = '';
        passwordLogin.value = '';
        registerUsername.value = '';
        registerPassword.value = '';
        registerConfirmPassword.value = '';
        adminNewUsername.value = '';
        adminNewPassword.value = '';
        adminEditUsername.value = '';
        adminEditPassword.value = '';
        state.username = 'alejandro';
        state.role = 'user';
        setAuthMode('login');
        document.querySelectorAll('.nav-btn').forEach((button) => button.classList.remove('active'));
        const defaultNav = document.querySelector('.regular-nav .nav-btn[data-panel="resumen"]');
        if (defaultNav) defaultNav.classList.add('active');
        document.querySelectorAll('.admin-view').forEach((view) => view.classList.add('hidden'));
        const defaultAdminView = document.getElementById('admin-view-usuarios');
        if (defaultAdminView) defaultAdminView.classList.remove('hidden');
        document.querySelectorAll('.admin-menu-btn').forEach((button) => button.classList.remove('active'));
        const defaultMenuBtn = document.querySelector('.admin-menu-btn[data-admin-view="usuarios"]');
        if (defaultMenuBtn) defaultMenuBtn.classList.add('active');
        document.querySelectorAll('.regular-nav, .admin-nav').forEach((nav) => nav.classList.add('hidden'));
        document.querySelector('.regular-nav').classList.remove('hidden');
        document.querySelector('.regular-logout').classList.remove('hidden');
        document.getElementById('adminPanelBtn').classList.add('hidden');
    };

    const setAdminView = (viewName) => {
        document.querySelectorAll('.admin-menu-btn').forEach((button) => {
            button.classList.toggle('active', button.dataset.adminView === viewName);
        });
        document.querySelectorAll('.admin-view').forEach((panel) => {
            const isActive = panel.id === `admin-view-${viewName}`;
            panel.classList.toggle('active', isActive);
            panel.classList.toggle('hidden', !isActive);
        });

        if (viewName === 'actividad' && typeof renderAdminActivity === 'function') {
            renderAdminActivity();
        }
    };

    const setSummaryActionVisibility = () => {
        const showButtons = document.getElementById('panel-resumen')?.classList.contains('active');
        document.querySelectorAll('.summary-action-btn').forEach((button) => {
            button.classList.toggle('hidden', !showButtons);
        });
    };

    const setActivePanel = (panelName) => {
        document.querySelectorAll('.nav-btn[data-panel]').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.panel === panelName);
        });

        document.querySelectorAll('.content-panel').forEach((panel) => {
            panel.classList.toggle('active', panel.id === `panel-${panelName}`);
            panel.classList.toggle('hidden', panel.id !== `panel-${panelName}`);
        });

        setSummaryActionVisibility();
    };

    const formatActivityDate = (value) => {
        if (!value) return 'Nunca';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return 'Nunca';
        return date.toLocaleString('es-CO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderAdminUsers = () => {
        const users = getUsers();
        adminUsersList.innerHTML = users.map((user) => {
            const userName = String(user.username || '').trim();
            const isAdmin = user.role === 'admin' || isAdminUser(userName);
            const isOpen = state.username === userName && !isAdmin;
            const lastActive = formatActivityDate(user.lastActive);
            return `
                <div class="admin-user-card ${isOpen ? 'open' : ''}">
                    <button type="button" class="admin-user-toggle" data-user="${userName}">
                        <span>${userName}</span>
                        <span>▾</span>
                    </button>
                    <div class="admin-user-body">
                        <div class="admin-user-meta">
                            <span>Rol: ${isAdmin ? 'Administrador' : 'Usuario'}</span>
                            <span>Última actividad: ${lastActive}</span>
                        </div>
                        <div class="admin-user-actions">
                            ${isAdmin ? '<button type="button" class="btn-clear small" disabled>Admin</button>' : `<button type="button" class="btn-clear small delete-user-btn" data-user="${userName}">Eliminar usuario</button>`}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        adminUsersList.querySelectorAll('.admin-user-toggle').forEach((button) => {
            button.addEventListener('click', () => {
                const card = button.closest('.admin-user-card');
                card.classList.toggle('open');
            });
        });

        adminUsersList.querySelectorAll('.delete-user-btn').forEach((button) => {
            button.addEventListener('click', () => {
                const targetUser = button.dataset.user;
                const users = getUsers().filter((user) => String(user.username || '').trim().toLowerCase() !== String(targetUser || '').trim().toLowerCase());
                saveUsers(users);
                localStorage.removeItem(getUserStorageKey(targetUser));
                if (state.username === targetUser) {
                    saveAndLogout();
                    return;
                }
                renderAdminUsers();
                renderAdminDeleteList();
                renderAdminEditOptions();
                renderAdminActivity();
            });
        });
    };

    const renderAdminActivity = () => {
        const users = getUsers().filter((user) => !(user.role === 'admin' || isAdminUser(user.username || '')));
        adminActivityList.innerHTML = users.length ? users.map((user) => `
            <div class="admin-activity-item">
                <strong>${user.username}</strong>
                <span>Última vez activo: ${formatActivityDate(user.lastActive)}</span>
            </div>
        `).join('') : '<div class="admin-activity-item"><span>No hay usuarios registrados.</span></div>';
    };

    const renderAdminDeleteList = () => {
        const users = getUsers().filter((user) => !(user.role === 'admin' || isAdminUser(user.username || '')));
        adminDeleteList.innerHTML = users.length ? users.map((user) => {
            const userName = String(user.username || '').trim();
            return `
                <div class="admin-delete-card">
                    <button type="button" class="admin-delete-toggle" data-delete-user="${userName}">
                        <span>${userName}</span>
                        <span>▾</span>
                    </button>
                    <div class="admin-delete-body">
                        <div class="admin-delete-meta">
                            <span>Usuario normal</span>
                            <span>Se eliminará su información guardada</span>
                        </div>
                        <div class="admin-delete-actions">
                            <button type="button" class="btn-clear small delete-admin-user-btn" data-delete-user="${userName}">Borrar</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('') : '<div class="admin-delete-card"><div class="admin-delete-body" style="max-height:none; opacity:1; padding:18px;"><div class="admin-delete-meta"><span>No hay usuarios para borrar.</span></div></div></div>';

        adminDeleteList.querySelectorAll('.admin-delete-toggle').forEach((button) => {
            button.addEventListener('click', () => {
                const card = button.closest('.admin-delete-card');
                card.classList.toggle('open');
            });
        });

        adminDeleteList.querySelectorAll('.delete-admin-user-btn').forEach((button) => {
            button.addEventListener('click', () => {
                const targetUser = button.dataset.deleteUser;
                const users = getUsers().filter((user) => String(user.username || '').trim().toLowerCase() !== String(targetUser || '').trim().toLowerCase());
                saveUsers(users);
                localStorage.removeItem(getUserStorageKey(targetUser));
                renderAdminUsers();
                renderAdminDeleteList();
                renderAdminEditOptions();
            });
        });
    };

    const renderAdminEditOptions = () => {
        const users = getUsers().filter((user) => !(user.role === 'admin' || isAdminUser(user.username || '')));
        adminEditUserSelect.innerHTML = users.length ? users.map((user) => `<option value="${user.username}">${user.username}</option>`).join('') : '<option value="">No hay usuarios</option>';
    };

    const closeMobileMenu = () => {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;
        sidebar.classList.remove('is-open');
        if (mobileMenuBackdrop) {
            mobileMenuBackdrop.classList.add('hidden');
        }
    };

    const toggleMobileMenu = () => {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;
        const isOpen = sidebar.classList.toggle('is-open');
        if (mobileMenuBackdrop) {
            mobileMenuBackdrop.classList.toggle('hidden', !isOpen);
        }
    };

    const goToApp = () => {
        loginScreen.classList.add('hidden');
        appScreen.classList.remove('hidden');
        const adminView = state.role === 'admin' || isAdminUser(state.username);
        adminPanelBtn.classList.toggle('hidden', !adminView);

        document.querySelectorAll('.regular-nav, .admin-nav').forEach((nav) => nav.classList.add('hidden'));
        const regularNav = document.querySelector('.regular-nav');
        const adminNav = document.querySelector('.admin-nav');

        if (adminView) {
            if (adminNav) adminNav.classList.remove('hidden');
            setActivePanel('admin');
            renderAdminUsers();
            renderAdminDeleteList();
            renderAdminEditOptions();
        } else {
            if (regularNav) regularNav.classList.remove('hidden');
            setActivePanel('resumen');
        }

        setTimeout(closeMobileMenu, 100);
        renderStats();
        renderInventario();
        renderFiados();
        renderPromociones();
    };

    const showNameBurst = (name) => {
        nameBurst.textContent = name;
        nameBurst.classList.remove('hidden');
        setTimeout(() => {
            nameBurst.classList.add('hidden');
            goToApp();
        }, 5000);
    };

    const getRowsByMode = (mode) => [...document.querySelectorAll(`#${mode}Rows .product-row`)];

    const syncRowStateFromDom = (mode) => {
        const rows = getRowsByMode(mode);
        const stateKey = mode === 'venta' ? 'ventaRows' : 'facturaRows';
        state[stateKey] = rows.map((row) => ({
            product: row.querySelector('.product-select').value,
            quantity: Number(row.querySelector('.quantity-input').value || 1),
            unitPrice: Number(row.querySelector('.unit-price-input').value || 0)
        }));
    };

    const createProductRow = (mode, rowData = createEmptyRow()) => {
        const row = document.createElement('div');
        row.className = 'product-row';
        row.innerHTML = `
            <select class="product-select">${buildProductOptions()}</select>
            <input type="number" min="1" value="${rowData.quantity || 1}" class="quantity-input" placeholder="Cantidad">
            <input type="number" min="0" step="100" value="${rowData.unitPrice || ''}" class="unit-price-input" placeholder="Valor unitario">
            <button type="button" class="remove-row">Quitar</button>
        `;

        const productSelect = row.querySelector('.product-select');
        const quantityInput = row.querySelector('.quantity-input');
        const unitPriceInput = row.querySelector('.unit-price-input');
        productSelect.value = rowData.product || productOptions[0];

        const fixedPrice = getProductPrice(productSelect.value, mode);
        if (fixedPrice !== null && Number(unitPriceInput.value || 0) === 0) {
            unitPriceInput.value = fixedPrice;
        }

        productSelect.addEventListener('change', () => {
            const nextFixedPrice = getProductPrice(productSelect.value, mode);
            if (nextFixedPrice !== null) {
                unitPriceInput.value = nextFixedPrice;
            } else {
                unitPriceInput.value = '';
            }
            syncRowStateFromDom(mode);
        });

        [quantityInput, unitPriceInput].forEach((input) => {
            input.addEventListener('input', () => {
                syncRowStateFromDom(mode);
            });
        });

        const removeBtn = row.querySelector('.remove-row');
        removeBtn.addEventListener('click', () => {
            const rows = getRowsByMode(mode);
            if (rows.length > 1) {
                const stateKey = mode === 'venta' ? 'ventaRows' : 'facturaRows';
                const rowIndex = [...rows].indexOf(row);
                state[stateKey].splice(rowIndex, 1);
                row.remove();
                syncRowStateFromDom(mode);
            }
        });

        return row;
    };

    const renderVentaRows = () => {
        const container = document.getElementById('ventaRows');
        container.innerHTML = '';
        state.ventaRows.forEach((rowData) => {
            container.appendChild(createProductRow('venta', rowData));
        });
    };

    const renderFacturaRows = () => {
        const container = document.getElementById('facturaRows');
        container.innerHTML = '';
        state.facturaRows.forEach((rowData) => {
            container.appendChild(createProductRow('factura', rowData));
        });
    };

    const renderSummaryRows = (mode) => {
        const container = document.getElementById(`${mode}SummaryRows`);
        const rows = getRowsByMode(mode);
        let grandTotal = 0;

        if (!rows.length) {
            container.innerHTML = '<div class="summary-item"><span>No hay productos.</span></div>';
            return;
        }

        const html = rows.map((row, index) => {
            const product = row.querySelector('.product-select').value;
            const quantity = Number(row.querySelector('.quantity-input').value || 0);
            const unitPrice = Number(row.querySelector('.unit-price-input').value || 0);
            const subtotal = quantity * unitPrice;
            grandTotal += subtotal;

            return `
                <div class="summary-item">
                    <span>${index + 1}. ${product}</span>
                    <strong>${quantity} x ${formatCurrency(unitPrice)} = ${formatCurrency(subtotal)}</strong>
                </div>
            `;
        }).join('');

        container.innerHTML = `${html}<div class="summary-total">Total: ${formatCurrency(grandTotal)}</div>`;
    };

    const renderFiadoRows = (mode) => {
        const container = document.getElementById(`${mode}FiadoRows`);
        if (!container) return;

        if (mode === 'factura') {
            container.innerHTML = '';
            return;
        }

        const rows = getRowsByMode(mode);

        if (!rows.length) {
            container.innerHTML = '<div class="summary-item"><span>No hay filas para confirmar.</span></div>';
            return;
        }

        container.innerHTML = rows.map((row, index) => {
            const product = row.querySelector('.product-select').value;
            return `
                <div class="fiado-row">
                    <strong>${product}</strong>
                    <label class="fiado-question-label">¿Es fiado?</label>
                    <select class="final-fiado-select">
                        <option value="no">No</option>
                        <option value="si">Sí</option>
                    </select>
                    <input type="text" class="final-fiador-input hidden" placeholder="Nombre del fiador">
                </div>
            `;
        }).join('');

        container.querySelectorAll('.final-fiado-select').forEach((select) => {
            const fiadorInput = select.parentElement.querySelector('.final-fiador-input');
            select.addEventListener('change', () => {
                if (select.value === 'si') {
                    fiadorInput.classList.remove('hidden');
                } else {
                    fiadorInput.classList.add('hidden');
                    fiadorInput.value = '';
                }
            });
        });
    };

    const validateStep = (mode, stepNumber) => {
        const rows = getRowsByMode(mode);
        if (!rows.length) {
            alert('Debes agregar al menos un producto.');
            return false;
        }

        if (stepNumber === 1) {
            for (const row of rows) {
                const product = row.querySelector('.product-select').value;
                const quantity = Number(row.querySelector('.quantity-input').value || 0);
                const unitPriceField = row.querySelector('.unit-price-input');
                const unitPrice = Number(unitPriceField.value || 0);
                const fixedPrice = getProductPrice(product, mode);

                if (!product || quantity <= 0 || (!fixedPrice && unitPrice <= 0)) {
                    alert('Completa todos los campos del producto antes de continuar.');
                    return false;
                }
            }
        }

        if (stepNumber === 3 && mode === 'venta') {
            const fiadoRows = [...document.querySelectorAll(`#${mode}FiadoRows .fiado-row`)];
            for (const row of fiadoRows) {
                const select = row.querySelector('.final-fiado-select');
                const fiadorInput = row.querySelector('.final-fiador-input');
                if (select.value === 'si' && (!fiadorInput.value || !fiadorInput.value.trim())) {
                    alert('Debe ingresar el nombre del fiador cuando el producto es fiado.');
                    return false;
                }
            }
        }

        return true;
    };

    const getModeData = (mode) => {
        const rows = getRowsByMode(mode);
        const fiadoRows = document.getElementById(`${mode}FiadoRows`)
            ? [...document.querySelectorAll(`#${mode}FiadoRows .fiado-row`)]
            : [];

        return rows.map((row, index) => {
            const product = row.querySelector('.product-select').value;
            const quantity = Number(row.querySelector('.quantity-input').value || 0);
            const unitPrice = Number(row.querySelector('.unit-price-input').value || 0);
            const fiadoSelect = fiadoRows[index]?.querySelector('.final-fiado-select');
            const fiadorInput = fiadoRows[index]?.querySelector('.final-fiador-input');
            const fiado = fiadoSelect ? fiadoSelect.value === 'si' : false;

            return {
                product,
                quantity,
                unitPrice,
                subtotal: quantity * unitPrice,
                fiado,
                fiador: fiado && fiadorInput ? fiadorInput.value.trim() : ''
            };
        }).filter((item) => item.product && item.quantity > 0 && item.unitPrice > 0);
    };

    const resetWizard = (mode) => {
        const wizard = document.querySelector(`.wizard[data-wizard="${mode}"]`);
        const steps = [...wizard.querySelectorAll('.wizard-step')];
        steps.forEach((step) => step.classList.remove('active'));
        steps[0].classList.add('active');

        if (mode === 'venta') {
            state.ventaRows = [createEmptyRow()];
            renderVentaRows();
            renderSummaryRows('venta');
            renderFiadoRows('venta');
        }

        if (mode === 'factura') {
            state.facturaRows = [createEmptyRow()];
            renderFacturaRows();
            renderSummaryRows('factura');
            renderFiadoRows('factura');
        }
    };

    const handleSaleSave = () => {
        if (!validateStep('venta', 3)) return;

        const items = getModeData('venta');
        if (!items.length) {
            alert('Debes registrar al menos un producto para guardar la venta.');
            return;
        }

        let valid = true;
        for (const item of items) {
            const stockActual = Number(state.inventario[item.product] || 0);
            if (stockActual < item.quantity) {
                alert(`No hay suficiente stock de ${item.product}.`);
                valid = false;
                break;
            }
        }

        if (!valid) return;

        for (const item of items) {
            const stockActual = Number(state.inventario[item.product] || 0);
            state.inventario[item.product] = stockActual - item.quantity;

            if (item.fiado) {
                state.fiados.push({
                    producto: item.product,
                    fiador: item.fiador || 'Sin nombre',
                    cantidad: item.quantity,
                    total: item.subtotal,
                    fecha: new Date().toISOString(),
                    tipo: 'venta'
                });
            } else {
                state.saldoActual += item.subtotal;
            }
        }

        saveState();
        renderStats();
        renderInventario();
        renderFiados();
        resetWizard('venta');
    };

    const handleFacturaSave = () => {
        if (!validateStep('factura', 2)) return;

        const items = getModeData('factura');
        if (!items.length) {
            alert('Debes registrar al menos un producto para guardar la factura.');
            return;
        }

        for (const item of items) {
            const stockActual = Number(state.inventario[item.product] || 0);
            state.inventario[item.product] = stockActual + item.quantity;

            if (item.fiado) {
                state.fiados.push({
                    producto: item.product,
                    fiador: item.fiador || 'Sin nombre',
                    cantidad: item.quantity,
                    total: item.subtotal,
                    fecha: new Date().toISOString(),
                    tipo: 'factura'
                });
            } else {
                state.saldoActual -= item.subtotal;
                state.dineroGastado += item.subtotal;
            }
        }

        saveState();
        renderStats();
        renderInventario();
        renderFiados();
        resetWizard('factura');
    };

    document.querySelectorAll('.nav-btn[data-panel]').forEach((button) => {
        button.addEventListener('click', () => {
            if (button.dataset.panel === 'admin') {
                renderAdminUsers();
                renderAdminDeleteList();
                renderAdminEditOptions();
                renderAdminActivity();
                setAdminView('usuarios');
            }
            setActivePanel(button.dataset.panel);
            closeMobileMenu();
        });
    });

    document.querySelectorAll('.admin-menu-btn[data-admin-view]').forEach((button) => {
        button.addEventListener('click', () => {
            setAdminView(button.dataset.adminView);
        });
    });

    document.querySelectorAll('[data-admin-panel]').forEach((button) => {
        button.addEventListener('click', () => {
            const viewName = button.dataset.adminPanel;
            if (viewName === 'usuarios') setAdminView('usuarios');
            if (viewName === 'agregar') setAdminView('agregar');
            if (viewName === 'borrar') setAdminView('borrar');
            if (viewName === 'editar') setAdminView('editar');
            if (viewName === 'actividad') setAdminView('actividad');
            closeMobileMenu();
        });
    });

    adminCreateUserForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = String(adminNewUsername.value || '').trim();
        const password = String(adminNewPassword.value || '').trim();

        if (!username || !password) {
            showAuthNotification('Completa el usuario y la contraseña del nuevo usuario.');
            return;
        }

        const users = getUsers();
        const exists = users.some((user) => String(user.username || '').trim().toLowerCase() === username.toLowerCase());
        if (exists) {
            showAuthNotification('Ese usuario ya existe.');
            return;
        }

        const newUser = { username, password, role: 'user' };
        users.push(newUser);
        saveUsers(users);
        localStorage.setItem(getUserStorageKey(username), JSON.stringify({
            ...defaultState,
            username,
            role: 'user',
            baseConfirmada: false,
            ventaRows: [createEmptyRow()],
            facturaRows: [createEmptyRow()]
        }));
        adminNewUsername.value = '';
        adminNewPassword.value = '';
        renderAdminUsers();
        renderAdminDeleteList();
        renderAdminEditOptions();
        renderAdminActivity();
        showAuthNotification('Usuario agregado correctamente.', 'success');
    });

    adminEditUserForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const currentUser = adminEditUserSelect.value;
        const newUsername = String(adminEditUsername.value || '').trim();
        const newPassword = String(adminEditPassword.value || '').trim();

        if (!currentUser) {
            showAuthNotification('Selecciona un usuario para editar.');
            return;
        }

        if (!newUsername && !newPassword) {
            showAuthNotification('Escribe al menos un nuevo nombre o contraseña.');
            return;
        }

        const users = getUsers();
        const target = users.find((user) => String(user.username || '').trim().toLowerCase() === String(currentUser || '').trim().toLowerCase());
        if (!target) {
            showAuthNotification('No se encontró el usuario seleccionado.');
            return;
        }

        const nameToUse = newUsername || currentUser;
        const passwordToUse = newPassword || target.password;
        const finalUsers = users.map((user) => {
            if (String(user.username || '').trim().toLowerCase() === String(currentUser || '').trim().toLowerCase()) {
                return {
                    ...user,
                    username: nameToUse,
                    password: passwordToUse
                };
            }
            return user;
        });

        const oldKey = getUserStorageKey(currentUser);
        const nextKey = getUserStorageKey(nameToUse);
        const savedState = JSON.parse(localStorage.getItem(oldKey) || '{}');
        saveUsers(finalUsers);
        if (oldKey !== nextKey) {
            localStorage.setItem(nextKey, JSON.stringify({ ...savedState, username: nameToUse, role: target.role || 'user' }));
            localStorage.removeItem(oldKey);
        } else {
            localStorage.setItem(nextKey, JSON.stringify({ ...savedState, username: nameToUse, role: target.role || 'user' }));
        }

        if (state.username.toLowerCase() === currentUser.toLowerCase()) {
            state.username = nameToUse;
            state.role = target.role || 'user';
            loadState(nameToUse);
        }

        adminEditUsername.value = '';
        adminEditPassword.value = '';
        renderAdminUsers();
        renderAdminDeleteList();
        renderAdminEditOptions();
        renderAdminActivity();
        showAuthNotification('Usuario actualizado correctamente.', 'success');
    });

    logoutBtn.addEventListener('click', saveAndLogout);
    logoutBtnRegular.addEventListener('click', saveAndLogout);
    adminLogoutBtn.addEventListener('click', saveAndLogout);

    const setupWizardNavigation = () => {
        document.querySelectorAll('.next-step').forEach((btn) => {
            btn.addEventListener('click', () => {
                const currentStep = btn.closest('.wizard-step');
                const wizard = currentStep.closest('.wizard');
                const steps = [...wizard.querySelectorAll('.wizard-step')];
                const index = steps.indexOf(currentStep);
                const mode = wizard.dataset.wizard;
                if (!validateStep(mode, Number(currentStep.dataset.step))) return;
                if (index < steps.length - 1) {
                    if (mode === 'venta' && currentStep.dataset.step === '1') {
                        renderSummaryRows('venta');
                    }
                    if (mode === 'venta' && currentStep.dataset.step === '2') {
                        renderFiadoRows('venta');
                    }
                    if (mode === 'factura' && currentStep.dataset.step === '1') {
                        renderSummaryRows('factura');
                    }
                    steps[index].classList.remove('active');
                    steps[index + 1].classList.add('active');
                }
            });
        });

        document.querySelectorAll('.prev-step').forEach((btn) => {
            btn.addEventListener('click', () => {
                const currentStep = btn.closest('.wizard-step');
                const wizard = currentStep.closest('.wizard');
                const steps = [...wizard.querySelectorAll('.wizard-step')];
                const index = steps.indexOf(currentStep);
                if (index > 0) {
                    steps[index].classList.remove('active');
                    steps[index - 1].classList.add('active');
                }
            });
        });
    };

    baseConfirmSelect.addEventListener('change', () => {
        syncBaseBalance(baseConfirmSelect.value);
        renderStats();
        saveState();
    });

    document.getElementById('addVentaRowBtn').addEventListener('click', () => {
        state.ventaRows.push(createEmptyRow());
        renderVentaRows();
    });

    document.getElementById('addFacturaRowBtn').addEventListener('click', () => {
        state.facturaRows.push(createEmptyRow());
        renderFacturaRows();
    });

    document.getElementById('guardarVentaBtn').addEventListener('click', handleSaleSave);
    document.getElementById('guardarFacturaBtn').addEventListener('click', handleFacturaSave);

    promoForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const product = promoProductSelect.value;
        const cantidad = Number(promoQuantityInput.value || 0);
        const tipo = document.getElementById('promoTypeSelect').value;

        if (!product || cantidad <= 0) {
            alert('Selecciona un producto y una cantidad válida.');
            return;
        }

        if (tipo === 'promo') {
            const stockActual = Number(state.inventario[product] || 0);
            if (stockActual < cantidad) {
                alert(`No hay suficiente stock de ${product} para aplicar la promoción.`);
                return;
            }
            state.inventario[product] = stockActual - cantidad;
        }

        state.promociones.push({
            producto: product,
            cantidad,
            activa: true,
            tipo
        });

        saveState();
        renderPromociones();
        renderInventario();
        renderStats();
        promoForm.reset();
        promoQuantityInput.value = 1;
        document.getElementById('promoTypeSelect').value = 'promo';
    });

    const setAuthMode = (mode) => {
        const isLogin = mode === 'login';
        loginFormBlock.classList.toggle('hidden', !isLogin);
        registerFormBlock.classList.toggle('hidden', isLogin);
        loginTabBtn.classList.toggle('active', isLogin);
        registerTabBtn.classList.toggle('active', !isLogin);
    };

    loginTabBtn.addEventListener('click', () => setAuthMode('login'));
    registerTabBtn.addEventListener('click', () => setAuthMode('register'));

    loginBtn.addEventListener('click', () => {
        const username = String(usernameLogin.value || '').trim();
        const password = String(passwordLogin.value || '').trim();
        const users = ensureDefaultUsers();
        const user = users.find((item) => item.username.toLowerCase() === username.toLowerCase());

        if (!user) {
            showAuthNotification('Usuario no registrado. Crea una cuenta primero.');
            return;
        }

        if (user.password !== password) {
            showAuthNotification('La contraseña no coincide con este usuario.');
            return;
        }

        const normalizedUsername = user.username;
        const updatedUsers = getUsers().map((item) => item.username.toLowerCase() === normalizedUsername.toLowerCase()
            ? { ...item, lastActive: new Date().toISOString() }
            : item
        );
        saveUsers(updatedUsers);
        state.username = normalizedUsername;
        state.role = user.role === 'admin' || isAdminUser(normalizedUsername) ? 'admin' : 'user';
        loadState(normalizedUsername);
        passwordLogin.value = '';
        showNameBurst(normalizedUsername.charAt(0).toUpperCase() + normalizedUsername.slice(1));
        saveState();
    });

    registerBtn.addEventListener('click', () => {
        const username = String(registerUsername.value || '').trim();
        const password = String(registerPassword.value || '').trim();
        const confirmPassword = String(registerConfirmPassword.value || '').trim();

        if (!username || !password) {
            showAuthNotification('Debes llenar usuario y contraseña.');
            return;
        }

        if (password.length < 4) {
            showAuthNotification('La contraseña debe tener al menos 4 caracteres.');
            return;
        }

        if (password !== confirmPassword) {
            showAuthNotification('Las contraseñas no coinciden.');
            return;
        }

        const users = ensureDefaultUsers();
        const existingUser = users.find((item) => item.username.toLowerCase() === username.toLowerCase());

        if (existingUser) {
            showAuthNotification('Ese nombre de usuario ya existe.', 'error');
            return;
        }

        users.push({ username, password });
        saveUsers(users);
        state.username = username;
        resetUserState(username);
        saveState();
        registerUsername.value = '';
        registerPassword.value = '';
        registerConfirmPassword.value = '';
        setAuthMode('login');
        usernameLogin.value = username;
        showAuthNotification('Usuario creado correctamente. Ya puedes iniciar sesión.', 'success');
    });

    document.getElementById('clearUserDataBtn').addEventListener('click', () => {
        renderFiadoWarningList();
        dangerModal.classList.remove('hidden');
    });

    document.getElementById('cancelUserClearBtn').addEventListener('click', () => {
        dangerModal.classList.add('hidden');
    });

    document.getElementById('confirmUserClearBtn').addEventListener('click', () => {
        const key = getUserStorageKey(state.username || 'alejandro');
        localStorage.removeItem(key);
        resetUserState(state.username || 'alejandro');
        dangerModal.classList.add('hidden');
        baseConfirmSelect.value = '';
        renderStats();
        renderInventario();
        renderFiados();
        renderPromociones();
        saveState();
        populatePromoSelect();
        renderVentaRows();
        renderFacturaRows();
        renderSummaryRows('venta');
        renderSummaryRows('factura');
        renderFiadoRows('venta');
        renderFiadoRows('factura');
    });

    document.getElementById('resetBalanceBtn').addEventListener('click', () => {
        state.saldoActual = 0;
        state.dineroGastado = 0;
        renderStats();
        saveState();
    });

    pedidoForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const cliente = String(pedidoClienteInput.value || '').trim();
        const hora = String(pedidoHoraInput.value || '').trim();
        const detalle = String(pedidoDetalleInput.value || '').trim();

        if (!cliente || !hora) {
            showPedidoToast('Completa quién está pendiente y la hora de entrega.');
            return;
        }

        const nuevoPedido = {
            id: Date.now(),
            cliente,
            hora,
            detalle,
            estado: 'pendiente',
            fechaCreacion: new Date().toISOString()
        };

        state.pedidos = [...(state.pedidos || []), nuevoPedido];
        saveState();
        renderPedidos();
        pedidoForm.reset();
        showPedidoToast(`Pedido de ${cliente} guardado y en espera.`);
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Nuevo pedido registrado', {
                body: `${cliente} debe entregar ${detalle || 'pedido'} a las ${hora}.`,
                tag: `pedido-${nuevoPedido.id}`
            });
        }
    });

    if (pedidoFilterSelect) {
        pedidoFilterSelect.addEventListener('change', renderPedidos);
    }

    if (pedidoPermissionBtn) {
        pedidoPermissionBtn.addEventListener('click', requestPedidoNotifications);
    }

    document.getElementById('addExtraBodegaBtn').addEventListener('click', () => {
        openInventoryModal('add');
    });

    document.getElementById('removeBodegaBtn').addEventListener('click', () => {
        openInventoryModal('remove');
    });

    if (inventoryCancelBtn) {
        inventoryCancelBtn.addEventListener('click', closeInventoryModal);
    }

    if (inventoryNoBtn) {
        inventoryNoBtn.addEventListener('click', () => {
            saveInventoryAction(false);
        });
    }

    if (inventoryYesBtn) {
        inventoryYesBtn.addEventListener('click', () => {
            saveInventoryAction(true);
        });
    }

    document.getElementById('clearBodegaBtn').addEventListener('click', () => {
        const confirmed = window.confirm('¿Deseas borrar todos los productos de la bodega?');
        if (!confirmed) return;

        state.inventario = {};
        saveState();
        renderInventario();
    });

    const initialShow = () => {
        setTimeout(() => {
            loginScreen.classList.remove('hidden');
        }, 2000);
    };

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }

    if (mobileMenuBackdrop) {
        mobileMenuBackdrop.addEventListener('click', closeMobileMenu);
    }

    if (themeToggleBtn) {
        const savedTheme = localStorage.getItem('appThemeMode') || 'light';
        applyTheme(savedTheme);
        themeToggleBtn.addEventListener('click', () => {
            const nextTheme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            applyTheme(nextTheme);
        });
    }

    ensureDefaultUsers();
    state.username = 'alejandro';
    loadState(state.username);
    baseConfirmSelect.value = normalizeBaseState(state.baseConfirmada) ? 'si' : 'no';
    if (state.baseConfirmada === undefined || state.baseConfirmada === null || state.baseConfirmada === '') {
        baseConfirmSelect.value = '';
    }

    setAuthMode('login');
    initialShow();
    setupWizardNavigation();
    populatePromoSelect();
    renderVentaRows();
    renderFacturaRows();
    renderSummaryRows('venta');
    renderSummaryRows('factura');
    renderFiadoRows('venta');
    renderFiadoRows('factura');
    renderPromociones();
    renderPedidos();
    renderStats();
    renderInventario();
    renderFiados();
    checkPedidoReminders();
    setInterval(checkPedidoReminders, 60000);
});
