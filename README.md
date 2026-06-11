# AETHERIS

Proyecto web con frontend HTML/CSS/JS y backend Node.js + Express conectado a Neon PostgreSQL.

## Funciones incluidas

- Registro e inicio de sesión con JWT.
- Roles: administrador, usuario voluntario y usuario pedido.
- Cuestionario para optar al bono Canje Voluntario.
- Catálogo de prótesis con imágenes, stock y pedidos.
- Historial de productos comprados en la cuenta del usuario.
- Donaciones con botella de progreso comunitaria 2027.
- Registro de dinero donado y plástico asociado por usuario.
- Noticias creadas por administrador y reacciones del usuario.
- Escaneo QR simulado que aumenta el avance de la botella personal.
- Panel administrador con dashboard, gráfica, inventario, donaciones, órdenes, productos y usuarios.
- Comprobante por correo: si no configuras Gmail, se muestra en consola.

  ### Apoyo arquitectónico: MVC + Repository

- `frontend`: vistas de usuario.
- `routes`: reciben la URL y derivan la petición.
- `controllers`: validan y coordinan la respuesta.
- `repositories`: aíslan consultas SQL reutilizables. Ejemplo: `backend/src/repositories/product.repository.js`.
- `config/db.js`: centraliza la conexión a Neon.

## Instalación

cd backend
npm install

Inicializa la base de datos:

npm run db:init
npm run dev

una vez iniciado el backend deben ir a la carpeta de frontend y apretar el boton de "Go Live" que se obtiene al descargar la dependencia Live server (esto facilita el iniciar el programa y ademas te permite modificar el frontend en tiempo real)

## Cuentas de prueba

- Admin: `admin@aetheris.cl` / `admin123`
- Usuario: `elena@aetheris.cl` / `usuario123`
