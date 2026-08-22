import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { traerContexto } from "./lib/gastos";
import Login from "./components/Login";
import TabBar from "./components/TabBar";
import Hoy from "./components/tabs/Hoy";
import Gastos from "./components/tabs/Gastos";
import Planning from "./components/tabs/Planning";
import Resumen from "./components/tabs/Resumen";
import "./styles.css";

export default function App() {
  const [sesion, setSesion] = useState(undefined);
  const [ctx, setCtx] = useState(null);
  const [tab, setTab] = useState("hoy");
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSesion(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSesion(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!sesion) return;
    (async () => {
      try {
        const c = await traerContexto();
        setCtx(c);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [sesion]);

  if (sesion === undefined) return <div className="cargando">Abriendo…</div>;
  if (!sesion) return <Login />;

  if (ctx && !ctx.grupo_id) {
    return (
      <div className="cargando">
        Tu usuario todavía no está en ningún grupo.<br />
        <span className="chico">Agregalo a la tabla <code>miembros</code> desde Supabase.</span>
      </div>
    );
  }
  if (!ctx) return <div className="cargando">Cargando…</div>;
  if (error) return <div className="cargando error">{error}</div>;

  return (
    <div className="app">
      {tab === "hoy" && <Hoy contexto={ctx} onIrA={setTab} />}
      {tab === "plan" && <Planning contexto={ctx} />}
      {tab === "gastos" && <Gastos contexto={ctx} />}
      {tab === "resumen" && <Resumen contexto={ctx} />}
      <TabBar tab={tab} onCambiar={setTab} />
    </div>
  );
}
