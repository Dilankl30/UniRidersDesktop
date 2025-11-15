const quadraticForm = document.getElementById('quadratic-form');
const resultsSection = document.getElementById('results');
const stepsSection = document.getElementById('steps');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');
const toastClose = document.querySelector('.toast-close');

const firstDerivativeEl = document.getElementById('first-derivative');
const secondDerivativeEl = document.getElementById('second-derivative');
const criticalXEl = document.getElementById('critical-x');
const criticalYEl = document.getElementById('critical-y');
const classificationEl = document.getElementById('classification');
const originalFunctionEl = document.getElementById('original-function');
const stepDerivativeEl = document.getElementById('step-derivative');
const stepEquationEl = document.getElementById('step-equation');
const stepCriticalPointEl = document.getElementById('step-critical-point');
const stepSecondDerivativeEl = document.getElementById('step-second-derivative');

const formatNumber = (value) => {
    if (Number.isNaN(value)) return '—';
    const normalized = Number.isInteger(value) ? value : Number.parseFloat(value.toFixed(2));
    if (Object.is(normalized, -0)) {
        return '0';
    }
    return normalized.toString();
};

const formatSignedNumber = (value) => {
    const absolute = formatNumber(Math.abs(value));
    const sign = value >= 0 ? '+' : '-';
    return `${sign} ${absolute}`;
};

const buildLinearEquation = (coefficient, constant) => {
    const parts = [`${formatNumber(coefficient)}x`];

    if (constant !== 0) {
        parts.push(formatSignedNumber(constant));
    }

    return `${parts.join(' ')} = 0`;
};

const buildQuadraticExpression = (a, b, c) => {
    const formatTerm = (coefficient, variable, isFirstTerm = false) => {
        const absValue = Math.abs(coefficient);
        const includeCoefficient = !(absValue === 1 && variable);
        const coefficientStr = includeCoefficient ? formatNumber(absValue) : '';
        const core = `${coefficientStr}${variable ?? ''}`.trim();

        if (isFirstTerm) {
            return `${coefficient < 0 ? '-' : ''}${core}`;
        }

        const sign = coefficient < 0 ? '-' : '+';
        return `${sign} ${core}`;
    };

    const parts = [formatTerm(a, 'x²', true)];

    if (b !== 0) {
        parts.push(formatTerm(b, 'x'));
    }

    if (c !== 0) {
        const sign = c < 0 ? '-' : '+';
        parts.push(`${sign} ${formatNumber(Math.abs(c))}`);
    }

    return parts.join(' ').replace(/\s+/g, ' ').trim();
};

const showToast = (message, type = 'error', duration = 4500) => {
    toastMessage.textContent = message;
    toast.dataset.type = type;
    toast.hidden = false;

    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => {
        toast.hidden = true;
    }, duration);
};

toastClose?.addEventListener('click', () => {
    toast.hidden = true;
    window.clearTimeout(showToast.timeout);
});

const buildDerivativeString = (a, b) => {
    const parts = [];

    if (a !== 0) {
        const coefficient = 2 * a;
        parts.push(`${formatNumber(coefficient)}x`);
    }

    if (b !== 0) {
        const sign = b > 0 ? '+' : '-';
        const absolute = formatNumber(Math.abs(b));
        parts.push(`${sign} ${absolute}`);
    }

    if (parts.length === 0) {
        parts.push('0');
    }

    return parts.join(' ');
};

quadraticForm?.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(quadraticForm);
    const a = Number(formData.get('coef-a'));
    const b = Number(formData.get('coef-b'));
    const c = Number(formData.get('coef-c'));

    if ([a, b, c].some((value) => Number.isNaN(value))) {
        showToast('Por favor ingresa números válidos.', 'error');
        return;
    }

    if (a === 0) {
        showToast('El coeficiente a debe ser distinto de 0 para tener una función cuadrática.', 'error');
        resultsSection.hidden = true;
        stepsSection.hidden = true;
        return;
    }

    const firstDerivative = buildDerivativeString(a, b);
    const secondDerivative = formatNumber(2 * a);
    const quadraticExpression = buildQuadraticExpression(a, b, c);

    const criticalX = -b / (2 * a);
    const criticalY = a * criticalX ** 2 + b * criticalX + c;

    originalFunctionEl.textContent = quadraticExpression;
    firstDerivativeEl.textContent = `f'(x) = ${firstDerivative}`;
    secondDerivativeEl.textContent = `f"(x) = ${secondDerivative}`;
    criticalXEl.textContent = formatNumber(criticalX);
    criticalYEl.textContent = formatNumber(criticalY);

    stepDerivativeEl.textContent = `f'(x) = ${firstDerivative}`;
    stepEquationEl.textContent = buildLinearEquation(2 * a, b);
    stepCriticalPointEl.textContent = `(x*, f(x*)) = (${formatNumber(criticalX)}, ${formatNumber(criticalY)})`;
    stepSecondDerivativeEl.textContent = `f''(x) = ${secondDerivative}`;

    let classification = '';
    delete classificationEl.dataset.type;
    if (a > 0) {
        classification = `La parábola abre hacia arriba (a > 0), por lo que el punto crítico es un <strong>mínimo</strong>.`;
        classificationEl.dataset.type = 'minimum';
    } else if (a < 0) {
        classification = `La parábola abre hacia abajo (a < 0), por lo que el punto crítico es un <strong>máximo</strong>.`;
        classificationEl.dataset.type = 'maximum';
    }
    classificationEl.innerHTML = classification;

    resultsSection.hidden = false;
    stepsSection.hidden = false;
    showToast('Cálculo completado correctamente.', 'success', 3000);
});

window.addEventListener('click', (event) => {
    if (event.target === toast) {
        toast.hidden = true;
        window.clearTimeout(showToast.timeout);
    }
});
