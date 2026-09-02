import { Component } from 'react';

/**
 * Red de contención. Sin esto, cualquier excepción durante el render
 * desmonta el árbol entero y deja la pantalla en blanco, sin una sola pista
 * de qué pasó. Un visitante del congreso vería una hoja vacía.
 *
 * Caso especial: si el error es un chunk que no se pudo importar, casi
 * siempre es una pestaña vieja pidiendo un archivo que el deploy nuevo ya
 * borró. Eso se arregla recargando, así que se ofrece hacerlo.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[boundary]', error, info?.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const labels = this.props.labels || {};
    const msg = String(error?.message || error);
    const chunk = /dynamically imported module|Loading chunk|Importing a module script failed/i.test(msg);

    return (
      <div className="border border-alarm rounded-sm px-4 py-4">
        <p className="label text-alarm mb-3">{labels.title}</p>
        <p className="text-ink-med text-[14px] mb-4">
          {chunk ? labels.stale : labels.body}
        </p>
        <p className="data text-ink-low mb-4 break-words">{msg}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="label bg-signal text-white rounded-sm px-4 py-2.5"
        >
          {labels.reload}
        </button>
      </div>
    );
  }
}
