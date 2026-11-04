/** Página única de la tienda demo. HTML y JS sin build: el foco del ejemplo es la integración. */
export const PAGINA = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Bodega Demo · Chasqui</title>
<style>
  :root { --fondo:#f7f5f0; --tinta:#1d1b18; --suave:#6b665d; --linea:#ddd7cc; --acento:#0f6b5c; --error:#a33a2b; color-scheme: light dark; }
  @media (prefers-color-scheme: dark) { :root { --fondo:#16150f; --tinta:#efe9dd; --suave:#a39d90; --linea:#36322a; --acento:#5cc4ae; --error:#ef8a7a; } }
  * { box-sizing: border-box; }
  body { margin:0; font:16px/1.5 system-ui, sans-serif; background:var(--fondo); color:var(--tinta); }
  main { max-width: 760px; margin: 0 auto; padding: 24px 16px 64px; }
  .aviso { font-size:13px; color:var(--suave); border:1px solid var(--linea); padding:8px 12px; border-radius:8px; }
  h1 { font-size: 28px; margin: 20px 0 4px; } h2 { font-size: 18px; margin: 28px 0 8px; }
  .producto { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid var(--linea); }
  input, select, button { font:inherit; padding:10px 12px; border-radius:8px; border:1px solid var(--linea); background:transparent; color:inherit; }
  input[type=number] { width: 72px; }
  .campos { display:grid; gap:12px; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
  label { display:grid; gap:4px; font-size:14px; color:var(--suave); }
  button { background:var(--acento); color:#fff; border:0; cursor:pointer; font-weight:600; margin-top:16px; width:100%; }
  button:disabled { opacity:.5; cursor:progress; }
  pre { white-space:pre-wrap; font-size:13px; border:1px solid var(--linea); border-radius:8px; padding:12px; }
  .error { color: var(--error); }
</style>
</head>
<body>
<main>
  <p class="aviso" role="note">Simulador para pruebas. No afiliado a SUNAT ni a ninguna entidad financiera. Todos los datos son ficticios.</p>
  <h1>Bodega Demo</h1>
  <p>Una tienda de ejemplo que usa el SDK de Chasqui: valida el RUC, cobra por QR y emite el comprobante.</p>
  <h2>Productos</h2>
  <div id="productos">Cargando…</div>
  <h2>Datos</h2>
  <form id="checkout">
    <div class="campos">
      <label>Comprobante <select name="tipo"><option value="boleta">Boleta</option><option value="factura">Factura</option></select></label>
      <label>DNI o RUC <input name="documento" required value="12345678" inputmode="numeric"></label>
      <label>Nombre <input name="nombre" required value="CLIENTE FICTICIO"></label>
      <label>Celular (billetera) <input name="celular" required value="900000001" inputmode="numeric"></label>
    </div>
    <button type="submit">Pagar <span id="total"></span></button>
  </form>
  <h2>Resultado</h2>
  <pre id="resultado" aria-live="polite">Aún no hay pedidos.</pre>
</main>
<script type="module">
  const productos = await (await fetch('/api/productos')).json();
  const cont = document.getElementById('productos');
  cont.innerHTML = '';
  for (const p of productos) {
    const fila = document.createElement('div');
    fila.className = 'producto';
    fila.innerHTML = '<span></span><span><span></span> <input type="number" min="0" max="99" value="0" aria-label="Cantidad"></span>';
    fila.children[0].textContent = p.descripcion;
    fila.children[1].children[0].textContent = 'S/ ' + p.precio;
    fila.querySelector('input').dataset.id = p.id;
    fila.querySelector('input').dataset.precio = p.precio;
    cont.append(fila);
  }
  cont.querySelector('input').value = 1;
  const total = () => [...cont.querySelectorAll('input')].reduce((s, i) => s + i.value * i.dataset.precio, 0);
  const pintar = () => (document.getElementById('total').textContent = 'S/ ' + total().toFixed(2));
  cont.addEventListener('input', pintar);
  pintar();
  document.getElementById('checkout').addEventListener('submit', async (e) => {
    e.preventDefault();
    const boton = e.target.querySelector('button');
    const salida = document.getElementById('resultado');
    const datos = Object.fromEntries(new FormData(e.target));
    datos.items = [...cont.querySelectorAll('input')].filter((i) => i.value > 0).map((i) => ({ id: i.dataset.id, cantidad: Number(i.value) }));
    boton.disabled = true;
    salida.className = '';
    salida.textContent = 'Procesando…';
    try {
      const r = await fetch('/api/pedidos', { method: 'POST', headers: { 'content-type': 'application/json', 'idempotency-key': crypto.randomUUID() }, body: JSON.stringify(datos) });
      const j = await r.json();
      salida.className = r.ok ? '' : 'error';
      salida.textContent = JSON.stringify(j, null, 2);
    } catch (err) {
      salida.className = 'error';
      salida.textContent = String(err);
    } finally {
      boton.disabled = false;
    }
  });
</script>
</body>
</html>`;
