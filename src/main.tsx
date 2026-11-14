import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Con autoUpdate el SW nuevo toma control al instante, pero la página abierta
// sigue corriendo el bundle viejo: se recarga para que use el nuevo.
if ('serviceWorker' in navigator) {
  // En la primera visita clientsClaim también dispara controllerchange y la
  // página ya corre el código último: ahí no hace falta recargar.
  const habiaControlador = !!navigator.serviceWorker.controller;
  let recargando = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!habiaControlador || recargando) return;
    recargando = true;
    window.location.reload();
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
