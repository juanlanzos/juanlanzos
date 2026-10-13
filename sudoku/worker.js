// Worker que sirve el juego de Sudoku en sudoku.habi.ar
import juego from "./sudoku.html";

const pagina = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<style>body{margin:0}[hidden]{display:none!important}</style>
</head>
<body>
${juego}
</body>
</html>`;

export default {
  async fetch() {
    return new Response(pagina, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=300",
      },
    });
  },
};
