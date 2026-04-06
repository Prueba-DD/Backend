# Componentes Base Reutilizables

## 📦 Componentes Creados

### 1. FormSection

Componente para encapsular secciones de formulario con soporte visual para zonas de peligro.

**Props**:
- `title` (string): Título de la sección
- `children` (ReactNode): Contenido de la sección
- `icon` (string, opcional): Ícono (emoji o clase de ícono)
- `danger` (boolean, default: false): Si es true, aplica estilo rojo para zonas de peligro

**Ejemplo de uso**:
```jsx
import { FormSection } from './components';

// Sección normal
<FormSection title="Información Personal" icon="👤">
  <input type="text" placeholder="Nombre" />
</FormSection>

// Zona de peligro
<FormSection title="Eliminar Cuenta" icon="⚠️" danger={true}>
  <p>Esta acción es irreversible...</p>
  <button>Eliminar</button>
</FormSection>
```

---

### 2. PasswordStrengthIndicator

Componente que evalúa y muestra la fortaleza de una contraseña en tiempo real.

**Props**:
- `password` (string): La contraseña a evaluar
- `showRequirements` (boolean, default: true): Mostrar lista de requisitos

**Criterios de fortaleza**:
- Longitud mínima: 8 caracteres
- Al menos un número
- Al menos una mayúscula
- Al menos una minúscula
- Al menos un carácter especial

**Niveles**:
- **Débil** (0-2 criterios): Barra roja
- **Media** (3-4 criterios): Barra naranja
- **Fuerte** (5 criterios): Barra verde

**Ejemplo de uso**:
```jsx
import { PasswordStrengthIndicator } from './components';

function RegisterForm() {
  const [password, setPassword] = useState('');

  return (
    <form>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <PasswordStrengthIndicator password={password} />
    </form>
  );
}
```

---

## 🎨 Estilos

Ambos componentes incluyen sus propios archivos CSS:
- `FormSection.css`
- `PasswordStrengthIndicator.css`

Los estilos son independientes y no requieren librerías adicionales.

---

## ✅ Criterios de Aceptación

- [x] FormSection renderiza con borde rojo cuando `danger={true}`
- [x] PasswordStrengthIndicator cambia de color según fortaleza
- [x] Ambos componentes no generan errores ni warnings en consola
- [x] Componentes independientes y reutilizables

---

## 📁 Estructura de Archivos

```
frontend/src/components/
├── FormSection.jsx
├── FormSection.css
├── PasswordStrengthIndicator.jsx
├── PasswordStrengthIndicator.css
└── index.js
```
