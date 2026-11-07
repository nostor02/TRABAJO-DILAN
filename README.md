# Tipos de Soldadura

Página web de proyecto de clase, sin dependencias.

## Estructura

```
soldadura-web/
├── index.html      Estructura de la página
├── css/
│   └── estilos.css Estilos (modo claro y oscuro)
├── js/
│   ├── datos.js    Información de cada tipo de soldadura (editar aquí)
│   └── app.js      Lógica: tarjetas, filtros y menú lateral
└── img/            Imágenes (opcional)
```

## Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub (por ejemplo `soldadura-web`).
2. Sube toda la carpeta, manteniendo la misma estructura.
3. Ve a **Settings → Pages**, elige la rama `main` y la carpeta `/ (root)`.
4. En un minuto tendrás un enlace como `https://tuusuario.github.io/soldadura-web/`.

## Agregar videos de YouTube

En `js/datos.js`, busca el tipo de soldadura y pega el ID del video en `yt`:

```js
{id:"smaw", ..., yt:"ABC123xyz",  ...}
```

El ID es la parte de la URL después de `v=`.
