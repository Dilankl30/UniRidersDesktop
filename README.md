# UniRiders

Aplicación web para coordinar viajes compartidos dentro de la ESPOCH. El proyecto se compone de un backend en Node.js que se conecta a SQL Server y un frontend estático optimizado para escritorio y dispositivos móviles.

## Requisitos previos

- Node.js 18+
- SQL Server 2019 o superior (probado en SQL Server Management Studio 21)
- npm

## Configuración de la base de datos

1. Abra **SQL Server Management Studio 21** e inicie sesión con un usuario con permisos de creación de bases de datos.
2. En la ventana de consultas ejecute el script [`backend/sql/UniRiders_schema.sql`](backend/sql/UniRiders_schema.sql). El script:
   - Crea la base de datos `UniRiders` (si no existe).
   - Regenera las tablas `Usuarios`, `Vehiculos`, `Viajes`, `HistorialChat` y `EstadisticasApp`.
   - Configura claves foráneas, índices y una fila inicial para las estadísticas.
   > ⚠️ El script elimina las tablas anteriores antes de recrearlas. Respalde su información si ya existe data en el servidor.
3. Ajuste las credenciales de conexión en [`backend/db.js`](backend/db.js) para que coincidan con su instancia de SQL Server (usuario, contraseña, host y nombre de la base de datos).

## Puesta en marcha del backend

```bash
cd backend
npm install
npm start
```

El servidor HTTP queda disponible en `http://localhost:3000/`.

## Frontend

Los archivos del frontend se encuentran en la carpeta [`frontend/`](frontend/). Puede abrir `Index.html` directamente en el navegador o servir la carpeta con cualquier servidor estático.

### Diseño responsivo

Se añadieron estilos adaptativos para que las pantallas de autenticación, perfil, conductor y pasajero funcionen correctamente en teléfonos móviles (anchos ≤ 900 px). Los contenedores se reorganizan verticalmente, los botones ocupan el ancho completo y los paneles de chat/mapa ajustan su altura para facilitar la interacción táctil.

## Estructura principal

```
UniRidersDesktop/
├── backend/              # Servidor Node.js + API REST
│   ├── server.js
│   ├── db.js
│   └── sql/UniRiders_schema.sql
├── frontend/             # HTML, CSS y JS del cliente
└── README.md
```
