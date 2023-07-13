var bloques = document.getElementsByClassName("bloque-elementos");

// Ocultar todos los bloques de elementos
for (var i = 0; i < bloques.length; i++) {
  bloques[i].style.display = "none";
}

// Mostrar el segundo bloque de elementos por defecto
bloques[1].style.display = "block";

function mostrarBloque(opcion) {
  // Ocultar todos los bloques de elementos
  for (var i = 0; i < bloques.length; i++) {
    bloques[i].style.display = "none";
  }

  // Si no se proporciona una opción o se proporciona una opción vacía,
  // mostrar el segundo bloque por defecto
  if (!opcion) {
    bloques[1].style.display = "block";
    return;
  }

  // Mostrar el bloque de elementos seleccionado
  var bloqueSeleccionado = document.getElementById(opcion);
  if (bloqueSeleccionado) {
    bloqueSeleccionado.style.display = "block";
  }
}
