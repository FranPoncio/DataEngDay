import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [mail, setMail] = useState("");
  const [estado, setEstado] = useState("idle"); // idle | enviando | enviado | error
  const [error, setError] = useState("");

  const enviar = async (e) => {
    e.preventDefault();
    if (!mail.trim()) return;
    setEstado("enviando");
    const { error } = await supabase.auth.signInWithOtp({
      email: mail.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) { setError(error.message); setEstado("error"); }
    else setEstado("enviado");
  };

  return (
    <div className="login">
      <div className="login-caja">
        <h1>Day by Day</h1>
        <p className="login-sub">Gastos compartidos</p>

        {estado === "enviado" ? (
          <div className="login-ok">
            <p>Te mandamos un link a <strong>{mail}</strong>.</p>
            <p className="chico">Abrilo desde este mismo teléfono.</p>
            <button className="link" onClick={() => setEstado("idle")}>Usar otro mail</button>
          </div>
        ) : (
          <form onSubmit={enviar}>
            <label htmlFor="mail">Tu mail</label>
            <input id="mail" type="email" inputMode="email" autoComplete="email"
              value={mail} onChange={(e) => setMail(e.target.value)}
              placeholder="vos@mail.com" required />
            <button className="btn" type="submit" disabled={estado === "enviando"}>
              {estado === "enviando" ? "Mandando…" : "Entrar"}
            </button>
            {estado === "error" && <p className="error">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}