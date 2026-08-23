export default function Toast({ mensaje, onDeshacer }) {
  return (
    <div className="toast">
      <span>{mensaje}</span>
      <button className="link" onClick={onDeshacer}>Deshacer</button>
    </div>
  );
}
