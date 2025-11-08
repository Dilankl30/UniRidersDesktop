SET NOCOUNT ON;

IF DB_ID('UniRiders') IS NULL
BEGIN
    PRINT('Creando base de datos UniRiders...');
    CREATE DATABASE UniRiders;
END
ELSE
BEGIN
    PRINT('Base de datos UniRiders ya existe.');
END
GO

USE UniRiders;
GO

IF OBJECT_ID('dbo.HistorialChat', 'U') IS NOT NULL DROP TABLE dbo.HistorialChat;
IF OBJECT_ID('dbo.Viajes', 'U') IS NOT NULL DROP TABLE dbo.Viajes;
IF OBJECT_ID('dbo.Vehiculos', 'U') IS NOT NULL DROP TABLE dbo.Vehiculos;
IF OBJECT_ID('dbo.EstadisticasApp', 'U') IS NOT NULL DROP TABLE dbo.EstadisticasApp;
IF OBJECT_ID('dbo.Usuarios', 'U') IS NOT NULL DROP TABLE dbo.Usuarios;
GO

CREATE TABLE dbo.Usuarios (
    id_usuario INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(120) NOT NULL,
    email NVARCHAR(150) NOT NULL,
    password NVARCHAR(255) NOT NULL,
    rol NVARCHAR(20) NOT NULL CHECK (rol IN ('conductor', 'pasajero')),
    metodo_pago_pref NVARCHAR(50) NOT NULL CONSTRAINT DF_Usuarios_MetodoPago DEFAULT ('Efectivo'),
    foto_perfil VARBINARY(MAX) NULL,
    mime_type NVARCHAR(100) NULL,
    fecha_registro DATETIME2(0) NOT NULL CONSTRAINT DF_Usuarios_FechaRegistro DEFAULT (SYSUTCDATETIME())
);

CREATE UNIQUE INDEX UX_Usuarios_Email ON dbo.Usuarios(email);
GO

CREATE TABLE dbo.Vehiculos (
    id_vehiculo INT IDENTITY(1,1) PRIMARY KEY,
    email_conductor NVARCHAR(150) NOT NULL,
    marca NVARCHAR(80) NOT NULL,
    modelo NVARCHAR(80) NOT NULL,
    placa NVARCHAR(20) NOT NULL,
    fecha_registro DATETIME2(0) NOT NULL CONSTRAINT DF_Vehiculos_FechaRegistro DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT FK_Vehiculos_Usuarios_Email FOREIGN KEY (email_conductor)
        REFERENCES dbo.Usuarios(email) ON DELETE CASCADE,
    CONSTRAINT UX_Vehiculos_Email UNIQUE (email_conductor)
);
GO

CREATE TABLE dbo.Viajes (
    id_viaje INT IDENTITY(1,1) PRIMARY KEY,
    pasajero_email NVARCHAR(150) NOT NULL,
    conductor_email NVARCHAR(150) NULL,
    origen NVARCHAR(255) NOT NULL,
    destino NVARCHAR(255) NOT NULL,
    metodo_pago NVARCHAR(50) NOT NULL CONSTRAINT DF_Viajes_MetodoPago DEFAULT ('Efectivo'),
    estado NVARCHAR(30) NOT NULL CONSTRAINT DF_Viajes_Estado DEFAULT ('PENDIENTE'),
    fecha_solicitud DATETIME2(0) NOT NULL CONSTRAINT DF_Viajes_FechaSolicitud DEFAULT (SYSUTCDATETIME()),
    fecha_aceptacion DATETIME2(0) NULL,
    fecha_finalizacion DATETIME2(0) NULL,
    costo DECIMAL(10,2) NULL,
    calificacion_pasajero TINYINT NULL,
    calificacion_conductor TINYINT NULL,
    comentario_conductor NVARCHAR(500) NULL,
    comentario_pasajero NVARCHAR(500) NULL,
    CONSTRAINT FK_Viajes_Pasajero FOREIGN KEY (pasajero_email) REFERENCES dbo.Usuarios(email),
    CONSTRAINT FK_Viajes_Conductor FOREIGN KEY (conductor_email) REFERENCES dbo.Usuarios(email)
);

CREATE INDEX IX_Viajes_Estado ON dbo.Viajes(estado);
CREATE INDEX IX_Viajes_Pasajero ON dbo.Viajes(pasajero_email);
CREATE INDEX IX_Viajes_Conductor ON dbo.Viajes(conductor_email);
GO

CREATE TABLE dbo.HistorialChat (
    id_mensaje INT IDENTITY(1,1) PRIMARY KEY,
    id_viaje INT NOT NULL,
    remitente NVARCHAR(150) NOT NULL,
    mensaje NVARCHAR(MAX) NOT NULL,
    tipo NVARCHAR(50) NOT NULL CONSTRAINT DF_HistorialChat_Tipo DEFAULT ('user'),
    fecha_envio DATETIME2(0) NOT NULL CONSTRAINT DF_HistorialChat_FechaEnvio DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT FK_HistorialChat_Viajes FOREIGN KEY (id_viaje) REFERENCES dbo.Viajes(id_viaje) ON DELETE CASCADE
);

CREATE INDEX IX_HistorialChat_Viaje_Fecha ON dbo.HistorialChat(id_viaje, fecha_envio);
GO

CREATE TABLE dbo.EstadisticasApp (
    id_estadistica INT IDENTITY(1,1) PRIMARY KEY,
    usuarios_activos INT NOT NULL CONSTRAINT DF_EstadisticasApp_UsuariosActivos DEFAULT (0),
    viajes_activos INT NOT NULL CONSTRAINT DF_EstadisticasApp_ViajesActivos DEFAULT (0),
    viajes_completados INT NOT NULL CONSTRAINT DF_EstadisticasApp_ViajesCompletados DEFAULT (0),
    ingresos_totales DECIMAL(12,2) NOT NULL CONSTRAINT DF_EstadisticasApp_Ingresos DEFAULT (0),
    ultima_actualizacion DATETIME2(0) NOT NULL CONSTRAINT DF_EstadisticasApp_UltimaActualizacion DEFAULT (SYSUTCDATETIME())
);
GO

IF NOT EXISTS (SELECT 1 FROM dbo.EstadisticasApp)
BEGIN
    INSERT INTO dbo.EstadisticasApp (usuarios_activos, viajes_activos, viajes_completados, ingresos_totales)
    VALUES (0, 0, 0, 0);
END
GO

PRINT('Esquema de UniRiders creado correctamente.');
GO
