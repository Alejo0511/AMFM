document.addEventListener('DOMContentLoaded', () => {
    const welcomeScreen = document.getElementById('welcomeScreen');
    const loginScreen = document.getElementById('loginScreen');
    const appScreen = document.getElementById('appScreen');
    const userSelect = document.getElementById('userSelect');
    const loginBtn = document.getElementById('loginBtn');
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
    const promoForm = document.getElementById('promoForm');
    const promoProductSelect = document.getElementById('promoProductSelect');
    const promoQuantityInput = document.getElementById('promoQuantityInput');
    const promotionsList = document.getElementById('promotionsList');

    const STORAGE_PREFIX = 'waterAppState_';
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

    const defaultState = {
        username: 'alejandro',
        saldoActual: 0,
        dineroGastado: 0,
        dineroEsperadoBase: 100000,
        baseConfirmada: false,
        fiados: [],
        inventario: {},
        promociones: [],
        ventaRows: [createEmptyRow()],
        facturaRows: [createEmptyRow()]
    };

    const state = { ...defaultState };
    const getUserStorageKey = (username = state.username) => `${STORAGE_PREFIX}${String(username || 'usuario').trim().toLowerCase()}`;

    const buildProductOptions = () => productOptions.map((product) => `<option value="${product}">${product}</option>`).join('');

    const saveState = () => {
        const payload = JSON.stringify({
            ...state,
            baseConfirmada: Boolean(state.baseConfirmada),
            username: state.username
        });
        localStorage.setItem(getUserStorageKey(state.username), payload);
    };

    const normalizeBaseState = (value) => value === true || value === 'si';

    const resetUserState = (username = state.username) => {
        Object.assign(state, defaultState, {
            username,
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
            resetUserState(username);
            return;
        }

        try {
            const parsed = JSON.parse(stored);
            Object.assign(state, defaultState, parsed, {
                username,
                baseConfirmada: normalizeBaseState(parsed.baseConfirmada)
            });
        } catch (error) {
            console.warn('No se pudo cargar la información guardada.', error);
            resetUserState(username);
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

        let totalGeneral = 0;
        const items = entries.map(([producto, cantidad]) => {
            totalGeneral += Number(cantidad || 0);
            return `<div class="bodega-item"><span>${producto}</span><strong>${cantidad} und.</strong></div>`;
        }).join('');

        bodegaResumen.innerHTML = `
            <div class="bodega-item"><span>Total en bodega</span><strong>${totalGeneral} und.</strong></div>
            ${items}
        `;
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

        promotionsList.innerHTML = state.promociones.map((promo) => `
            <li class="promo-item">
                <span>${promo.producto} - ${promo.cantidad} und.</span>
                <strong>${promo.activa ? 'Activa' : 'Inactiva'}</strong>
            </li>
        `).join('');
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

    const goToApp = () => {
        loginScreen.classList.add('hidden');
        appScreen.classList.remove('hidden');
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

        [productSelect, quantityInput, unitPriceInput].forEach((input) => {
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
                const unitPrice = Number(row.querySelector('.unit-price-input').value || 0);

                if (!product || quantity <= 0 || unitPrice <= 0) {
                    alert('Completa todos los campos del producto antes de continuar.');
                    return false;
                }
            }
        }

        if ((stepNumber === 2 && mode === 'factura') || (stepNumber === 3 && mode === 'venta')) {
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
                        renderFiadoRows('factura');
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

        if (!product || cantidad <= 0) {
            alert('Selecciona un producto y una cantidad válida para descontar.');
            return;
        }

        const stockActual = Number(state.inventario[product] || 0);
        if (stockActual < cantidad) {
            alert(`No hay suficiente stock de ${product} para descontar ${cantidad} unidades.`);
            return;
        }

        state.inventario[product] = stockActual - cantidad;
        state.promociones.push({
            producto: product,
            cantidad,
            activa: true
        });

        saveState();
        renderPromociones();
        renderInventario();
        promoForm.reset();
        promoQuantityInput.value = 1;
    });

    loginBtn.addEventListener('click', () => {
        const selectedName = userSelect.value;
        state.username = selectedName;
        loadState(selectedName);
        showNameBurst(selectedName.charAt(0).toUpperCase() + selectedName.slice(1));
        saveState();
    });

    document.getElementById('clearUserDataBtn').addEventListener('click', () => {
        renderFiadoWarningList();
        dangerModal.classList.remove('hidden');
    });

    document.getElementById('cancelUserClearBtn').addEventListener('click', () => {
        dangerModal.classList.add('hidden');
    });

    document.getElementById('confirmUserClearBtn').addEventListener('click', () => {
        const key = getUserStorageKey(state.username || userSelect.value || 'alejandro');
        localStorage.removeItem(key);
        resetUserState(state.username || userSelect.value || 'alejandro');
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

    document.getElementById('addExtraBodegaBtn').addEventListener('click', () => {
        const productNames = productOptions.join(', ');
        const rawProduct = window.prompt(`Elige un producto del inventario:\n${productNames}`, productOptions[0]);
        if (!rawProduct || !rawProduct.trim()) return;

        const nombreProducto = rawProduct.trim();
        const validProduct = productOptions.includes(nombreProducto);

        if (!validProduct) {
            alert('Ese producto no existe en la lista de productos. Usa uno de los nombres oficiales.');
            return;
        }

        const cantidad = Number(window.prompt('Cantidad a agregar:', '1') || 0);
        if (!Number.isFinite(cantidad) || cantidad <= 0) {
            alert('La cantidad debe ser mayor a 0.');
            return;
        }

        state.inventario[nombreProducto] = Number(state.inventario[nombreProducto] || 0) + cantidad;
        saveState();
        renderInventario();
    });

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

    userSelect.value = state.username;
    loadState(state.username);
    baseConfirmSelect.value = normalizeBaseState(state.baseConfirmada) ? 'si' : 'no';
    if (state.baseConfirmada === undefined || state.baseConfirmada === null || state.baseConfirmada === '') {
        baseConfirmSelect.value = '';
    }

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
    renderStats();
    renderInventario();
    renderFiados();
});
