import { Component } from "react";

/* Sin esto, cualquier error de render deja la pantalla en blanco — y en el
   celular no hay consola para enterarse de qué pasó. */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Error de render:", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="cargando">
        <p><strong>Se rompió algo.</strong></p>
        <p className="chico">{this.state.error.message}</p>
        <button className="btn recuperar" onClick={() => window.location.reload()}>
          Recargar
        </button>
      </div>
    );
  }
}
