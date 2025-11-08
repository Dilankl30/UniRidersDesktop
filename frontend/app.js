const API = "http://localhost:3000/api";

const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const forgotLink = document.getElementById("forgotLink");
const backToLogin = document.getElementById("backToLogin"); 
const toast = document.getElementById("toast");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const recoverForm = document.getElementById("recoverForm");

const sendCodeBtn = document.getElementById("sendCode");
const resetPassBtn = document.getElementById("resetPass");

function showToast(msg, success = true) {
  toast.innerText = msg;
  toast.style.background = success ? "rgba(0,150,50,0.8)" : "rgba(200,0,0,0.8)";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// Función central para cambiar entre formularios (Estética)
function switchForm(show) {
  [loginForm, registerForm, recoverForm].forEach(f => f.classList.remove("active"));
  if (show === "login") loginForm.classList.add("active");
  if (show === "register") registerForm.classList.add("active");
  if (show === "recover") recoverForm.classList.add("active");
}

// Eventos de botones de cambio
loginBtn.onclick = () => {
  loginBtn.classList.add("active");
  registerBtn.classList.remove("active");
  switchForm("login");
};

registerBtn.onclick = () => {
  registerBtn.classList.add("active");
  loginBtn.classList.remove("active");
  switchForm("register");
};

forgotLink.onclick = () => {
    loginBtn.classList.remove("active");
    registerBtn.classList.remove("active");
    switchForm("recover");
};

backToLogin.onclick = (e) => {
    e.preventDefault();
    loginBtn.classList.add("active");
    registerBtn.classList.remove("active");
    switchForm("login");
};

// -----------------------------------------------------------------
// LÓGICA DE FORMS
// -----------------------------------------------------------------

// Registro con verificación
registerForm.addEventListener("submit", async e => {
  e.preventDefault();
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value.trim();
  const confirm = document.getElementById("regConfirm").value.trim();
  const role = document.querySelector('input[name="role"]:checked').value;

  // Validar correo ESPOCH
  if (!email.endsWith('@espoch.edu.ec')) {
    showToast("Solo se permiten correos institucionales @espoch.edu.ec", false);
    return;
  }

  try {
    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, confirm, role })
    });
    const data = await res.json();
    
    if (res.ok && data.requiresVerification) {
      // Mostrar formulario de verificación
      showVerificationForm(email, name, password, role);
      showToast(data.message, true);
    } else {
      showToast(data.message, res.ok);
    }

  } catch (err) {
    showToast("Error de conexión", false);
  }
});

// Función para mostrar formulario de verificación
function showVerificationForm(email, name, password, role) {
  // Crear o mostrar formulario de verificación
  let verificationForm = document.getElementById("verificationForm");
  
  if (!verificationForm) {
    verificationForm = document.createElement("form");
    verificationForm.id = "verificationForm";
    verificationForm.className = "auth-form";
    verificationForm.innerHTML = `
      <p>📧 Verifica tu correo ESPOCH</p>
      
      <div class="input-container">
        <i class="fas fa-envelope icon"></i>
        <input type="email" id="verifyEmail" value="${email}" readonly>
      </div>
      
      <div class="input-container">
        <i class="fas fa-key icon"></i>
        <input type="text" id="verificationCode" placeholder="Código de 6 dígitos" required maxlength="6">
      </div>
      
      <button type="submit" class="submit-btn">
        <i class="fas fa-check"></i> Verificar Cuenta
      </button>
      
      <button type="button" id="resendCode" class="submit-btn small-btn" style="background: #666; margin-top: 10px;">
        <i class="fas fa-redo"></i> Reenviar Código
      </button>
      
      <button type="button" id="backToRegister" class="forgot-link" style="text-align: center; display: block; margin-top: 15px;">
        ← Volver al registro
      </button>
    `;
    
    registerForm.parentNode.appendChild(verificationForm);
    
    // Manejar envío de verificación
    verificationForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const code = document.getElementById("verificationCode").value.trim();
      
      if (code.length !== 6) {
        showToast("El código debe tener 6 dígitos", false);
        return;
      }
      
      try {
        const res = await fetch(`${API}/verify-registration`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code })
        });
        
        const data = await res.json();
        showToast(data.message, res.ok);
        
        if (res.ok) {
          // Volver a Login si la verificación es exitosa
          setTimeout(() => {
            loginBtn.click();
            registerForm.reset();
            verificationForm.remove();
          }, 1500);
        }
      } catch (err) {
        showToast("Error de conexión", false);
      }
    });
    
    // Manejar reenvío de código
    document.getElementById("resendCode").addEventListener("click", async () => {
      try {
        const res = await fetch(`${API}/resend-verification`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });
        
        const data = await res.json();
        showToast(data.message, res.ok);
      } catch (err) {
        showToast("Error al reenviar código", false);
      }
    });
    
    // Volver al registro
    document.getElementById("backToRegister").addEventListener("click", () => {
      verificationForm.remove();
    });
  }
  
  // Mostrar formulario de verificación
  registerForm.classList.remove("active");
  verificationForm.classList.add("active");
}

// Login (MODIFICADO CON SISTEMA DE SESIONES)
loginForm.addEventListener("submit", async e => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    
    showToast(data.message, res.ok);

    if (res.ok) {
        // Crear nueva sesión única
        const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Guardar datos con prefijo de sesión
        localStorage.setItem(sessionId + '_userEmail', data.userEmail);
        localStorage.setItem(sessionId + '_userName', data.userName);
        localStorage.setItem(sessionId + '_userRole', data.role);
        localStorage.setItem('currentSessionId', sessionId);
        
        // REDIRECCIÓN CON SESSION ID
        if (data.role === 'conductor') {
            window.location.href = `conductor.html?sessionId=${sessionId}`; 
        } else {
            window.location.href = `pasajero.html?sessionId=${sessionId}`;
        }
    }

  } catch (err) {
    showToast("Error de conexión", false);
  }
});

// Recuperar contraseña: enviar código
sendCodeBtn.addEventListener("click", async () => {
  const email = document.getElementById("recEmail").value.trim();
  if (!email) return showToast('Ingrese un correo electrónico', false);
  
  // Validar correo ESPOCH
  if (!email.endsWith('@espoch.edu.ec')) {
    showToast("Solo se permiten correos institucionales @espoch.edu.ec", false);
    return;
  }

  try {
    const res = await fetch(`${API}/recover`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    showToast(data.message, res.ok);
  } catch {
    showToast("Error al enviar código", false);
  }
});

// Recuperar contraseña: restablecer
resetPassBtn.addEventListener("click", async () => {
  const email = document.getElementById("recEmail").value.trim();
  const code = document.getElementById("recCode").value.trim();
  const newPassword = document.getElementById("recNewPass").value.trim();

  if (!email || !code || !newPassword) return showToast('Complete todos los campos', false);

  try {
    const res = await fetch(`${API}/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, newPassword })
    });
    const data = await res.json();
    showToast(data.message, res.ok);
    
    if (res.ok) {
        // Volver al login si es exitoso
        setTimeout(() => backToLogin.click(), 2000);
    }
  } catch {
    showToast("Error al restablecer contraseña", false);
  }
});

// Validación en tiempo real para correo ESPOCH en registro
document.getElementById('regEmail').addEventListener('blur', function() {
  const email = this.value.trim();
  if (email && !email.endsWith('@espoch.edu.ec')) {
    this.style.borderColor = 'red';
    showToast('Solo se permiten correos @espoch.edu.ec', false);
  } else {
    this.style.borderColor = '';
  }
});

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    switchForm('login');
    loginBtn.classList.add("active");
});