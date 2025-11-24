# 🛒 Tienda Demo (HTML, CSS y JavaScript)

Este proyecto es una **tienda web demo** creada con **HTML, CSS y JavaScript Vanilla**, sin frameworks y sin servidor.  
Forma parte del material que utilizo como **profesor de Programación Web**, donde enseño a mis alumnos cómo construir interfaces dinámicas, manejar eventos, filtrar datos y crear componentes simples sin depender de librerías externas.

---

## 📚 Material del curso

Más código de la clase está disponible aquí 👇

https://github.com/LuisContrerasGlz/ClaseFundamentosDeProgramacion

---

## 🌐 Demo de la tienda (GitHub Pages)

Puedes ver la tienda funcionando aquí 👇

https://luiscontrerasglz.github.io/Clase_Web_Dev_TiendaOnline/

---

## 🚀 Descripción General

La aplicación incluye:

- Catálogo dinámico cargado desde un archivo externo (`catalog.js`)
- Filtros automáticos por categoría
- Buscador en tiempo real
- Carrito funcional:
  - Agregar productos  
  - Aumentar/disminuir cantidades  
  - Eliminar ítems  
  - Subtotal dinámico
- UI responsiva usando **CSS Grid**, **Flexbox** y **variables CSS**
- Funciona con **file://**, sin necesidad de servidor o fetch

Este proyecto muestra a los estudiantes cómo organizar un mini-proyecto realista con JavaScript puro.

---

## 📁 Estructura del Proyecto

.
├── index.html     # Base del proyecto
├── styles.css     # Estilos (Grid, Flexbox, variables)
├── app.js         # Lógica de render, filtros y carrito
└── catalog.js     # Catálogo externo como objeto global

---

## ⚙️ Cómo Ejecutarlo

1. Descarga todos los archivos del proyecto.  
2. Abre **index.html** con doble clic o desde tu navegador.  
3. La aplicación funciona directamente gracias al uso de datos locales.

> 💡 (Opcional) Puedes usar Live Server en VSCode para recargar automáticamente mientras editas.

---

## 🧩 Cómo Agregar o Editar Productos

Abre el archivo **catalog.js** y edita el arreglo `products`:

```js
window.catalogData = {
  products: [
    {
      id: "p9",
      name: "Nuevo Producto",
      price: 199,
      category: "electronica",
      image: "https://url-de-imagen.png"
    }
  ]
};
````

Las categorías nuevas se detectan automáticamente y se agregan a la barra de filtros.

---

## 🛠️ Tecnologías Utilizadas

* **HTML5**
* **CSS3**
  (variables, Grid, Flexbox)
* **JavaScript ES6+**
  (delegación de eventos, render dinámico, manejo de estado simple)

No hay frameworks, bundlers ni dependencias.

---

## 🎓 Propósito Educativo

Este proyecto está diseñado para ayudar a los estudiantes a comprender:

* Cómo separar estructura (HTML), estilo (CSS) y lógica (JS)
* Cómo manejar el DOM de forma eficiente sin librerías
* Cómo construir componentes funcionales (tarjetas, carrito, filtros)
* Buenas prácticas de organización en proyectos pequeños

Más código de la clase está disponible aquí 👇
[https://github.com/LuisContrerasGlz/ClaseFundamentosDeProgramacion](https://github.com/LuisContrerasGlz/ClaseFundamentosDeProgramacion)

