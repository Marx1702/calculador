# Calculador de Costos

Una aplicación web completa (Full-Stack) diseñada para ayudar a profesionales e independientes a calcular los costos de sus proyectos de forma precisa. Permite gestionar materiales, elementos y generar presupuestos dinámicos basados en horas de trabajo, costos de materiales y porcentaje de ganancia.

## ✨ Características Principales

- **Autenticación Segura:** Sistema de registro e inicio de sesión protegido mediante JWT (JSON Web Tokens) y contraseñas encriptadas con `bcryptjs`.
- **Gestión de Inventario (Materiales y Elementos):**
  - Mantenimiento de categorías de materiales.
  - Registro de elementos con precio unitario y cantidad vinculados a materiales específicos.
- **Generación de Presupuestos:**
  - Creación de presupuestos asignando los elementos que requiere el proyecto.
  - Cálculo de costos de mano de obra (horas estimadas × costo por hora).
  - Aplicación de márgenes de ganancia (%).
  - Cálculo total automático.
- **Privacidad de Datos:** Cada usuario gestiona su propia cuenta y sus presupuestos, elementos y materiales se mantienen privados.

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js**: Entorno de ejecución de JavaScript.
- **Express.js**: Framework rápido para aplicaciones web y APIs usando Node.js.
- **MySQL**: Motor de base de datos relacional para guardar información de usuarios y presupuestos.
- **Autenticación y Seguridad**: `jsonwebtoken` (JWT), `bcryptjs`, `cors`.
- **Otros**: `dotenv` para el manejo de variables de entorno.

### Frontend
- **HTML5 & CSS3**: Formularios de login y aplicación principal.
- **JavaScript (Vanilla)**: Consumo de la API REST e interfaces dinámicas en la carpeta `public/`.

## ⚙️ Requisitos Previos

- [Node.js](https://nodejs.org/es/) (v14 o superior recomendado)
- Servidor MySQL activo (puede ser local usando XAMPP, WAMP, o de manera nativa).

## 🚀 Instalación y Configuración

1. **Clonar o descargar el repositorio** en tu entorno local.

2. **Instalar dependencias del proyecto:**
   Abre una terminal en el directorio del proyecto y ejecuta:
   ```bash
   npm install
   ```

3. **Configurar la base de datos:**
   - Abre tu cliente MySQL (por ejemplo, phpMyAdmin o MySQL Workbench).
   - Ejecuta el contenido del archivo `database.sql` completo para crear la base de datos (`usuarios`, `materiales`, `elementos`, `proyectos`, `presupuestos`, `presupuesto_items`).
   - *(Opcional)*: Si hay actualizaciones, ejecuta también `migrate_budgets.sql`.

4. **Variables de Entorno:**
   - Encontrarás un archivo `.env.example`. Crea una copia de este archivo, renómbralo como `.env` y configura los valores con los de tu entorno:
     ```env
     PORT=3000
     DB_HOST=localhost
     DB_USER=tu_usuario_mysql
     DB_PASSWORD=tu_password_mysql
     DB_NAME=calculador_cos
     JWT_SECRET=tu_secreto_super_seguro
     ```

5. **Iniciar la Aplicación:**
   Para levantar el servidor, puedes usar el script por defecto:
   ```bash
   npm run dev
   # o
   npm start
   ```

6. **¡Listo!**
   Abre tu navegador y entra a: `http://localhost:3000`. Podrás registrar una cuenta e iniciar sesión en el calculador.

## 📁 Estructura del Proyecto

```text
/
├── config/              # Archivos de configuración para la BD.
├── middleware/          # Middlewares (ej. verificación de JWT).
├── public/              # Archivos de Frontend (HTML, CSS y JS del cliente).
│   ├── css/             # Estilos de la aplicación.
│   ├── js/              # Lógica de las vistas.
│   ├── index.html       # Aplicación principal (SPA fallback).
│   └── login.html       # Interfaz de inicio de sesión/registro.
├── routes/              # Controladores de rutas para la API (/api/auth, /api/budgets, etc.).
├── .env.example         # Ejemplo de configuraciones de entorno.
├── database.sql         # Script SQL inicial.
├── migrate_budgets.sql  # Script SQL de actualizaciones/migraciones.
├── package.json         # Dependencias e info del proyecto en NodeJS.
└── server.js            # Punto de entrada de la aplicación de Backend.
```
