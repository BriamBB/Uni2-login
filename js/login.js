"use strict";

/* ==========================================================
   Configuración (cámbiala aquí, no en el resto del código)
   ========================================================== */
const CONFIG = {
  dominioInstitucional: "",   // Ej.: "ucompensar.edu.co". Confirma el dominio real; vacío = acepta cualquier correo válido
  largoMinimoClave: 8,
  modoDemo: true,             // true = simula el inicio de sesión (no hay servidor). Pon false cuando exista el backend
  urlLogin: "/api/login",     // Endpoint del backend (POST con JSON)
  urlDestino: "principal.html"
};

const form = document.getElementById("form-login");
const campoCorreo = document.getElementById("correo");
const campoClave = document.getElementById("clave");
const botonVer = document.getElementById("ver-clave");
const botonEnviar = document.getElementById("boton-enviar");
const estado = document.getElementById("estado");

/* ---------- Validaciones ---------- */
function validarCorreo(valor) {
  const correo = valor.trim().toLowerCase();
  if (!correo) return "Escribe tu correo institucional.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return "Escribe un correo válido, por ejemplo nombre@dominio.";
  }
  if (CONFIG.dominioInstitucional && !correo.endsWith("@" + CONFIG.dominioInstitucional)) {
    return "Usa tu correo institucional (@" + CONFIG.dominioInstitucional + ").";
  }
  return "";
}

function validarClave(valor) {
  if (!valor) return "Escribe tu contraseña.";
  if (valor.length < CONFIG.largoMinimoClave) {
    return "La contraseña tiene al menos " + CONFIG.largoMinimoClave + " caracteres.";
  }
  return "";
}

/* ---------- Mensajes en pantalla ---------- */
function mostrarErrorCampo(campo, mensaje) {
  const caja = document.getElementById("error-" + campo.id);
  caja.textContent = mensaje;
  caja.hidden = !mensaje;
  campo.setAttribute("aria-invalid", mensaje ? "true" : "false");
}

function mostrarEstado(tipo, mensaje) {
  estado.textContent = mensaje;
  estado.className = "estado" + (mensaje ? " estado--" + tipo : "");
  estado.hidden = !mensaje;
}

function cargando(activo) {
  botonEnviar.disabled = activo;
  botonEnviar.textContent = activo ? "Iniciando sesión…" : "Iniciar sesión";
}

/* ---------- Inicio de sesión ---------- */
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

async function iniciarSesion(correo, clave) {
  if (CONFIG.modoDemo) {
    await esperar(700);
    return;
  }
  const respuesta = await fetch(CONFIG.urlLogin, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, clave })
  });
  if (respuesta.status === 401) throw new Error("Correo o contraseña incorrectos.");
  if (!respuesta.ok) throw new Error("No pudimos iniciar sesión. Intenta de nuevo.");
}

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mostrarEstado("", "");

  const errorCorreo = validarCorreo(campoCorreo.value);
  const errorClave = validarClave(campoClave.value);
  mostrarErrorCampo(campoCorreo, errorCorreo);
  mostrarErrorCampo(campoClave, errorClave);

  if (errorCorreo) return campoCorreo.focus();
  if (errorClave) return campoClave.focus();

  cargando(true);
  try {
    await iniciarSesion(campoCorreo.value.trim().toLowerCase(), campoClave.value);
    if (CONFIG.modoDemo) {
      mostrarEstado("ok", "Inicio de sesión correcto (modo demostración). Aquí iría la redirección a la pantalla principal.");
    } else {
      window.location.href = CONFIG.urlDestino;
    }
  } catch (error) {
    mostrarEstado("error", error.message || "No pudimos iniciar sesión. Intenta de nuevo.");
  } finally {
    cargando(false);
  }
});

/* Limpia el error de un campo cuando la persona vuelve a escribir */
campoCorreo.addEventListener("input", () => mostrarErrorCampo(campoCorreo, ""));
campoClave.addEventListener("input", () => mostrarErrorCampo(campoClave, ""));

/* ---------- Mostrar / ocultar contraseña ---------- */
botonVer.addEventListener("click", () => {
  const visible = campoClave.type === "text";
  campoClave.type = visible ? "password" : "text";
  botonVer.textContent = visible ? "Mostrar" : "Ocultar";
  botonVer.setAttribute("aria-pressed", String(!visible));
});