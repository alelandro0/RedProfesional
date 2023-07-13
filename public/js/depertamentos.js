  var ciudadesQuindio = [
    "Armenia",
    "Calarcá",
    "La Tebaida",
    "Quimbaya",
    "Montenegro",
    "Salento",
    "Circacia",
    "Filandia",
    "Genova",
    "Buena Vista",
    "Cordoba",
    "La tebaida"
    // Agrega más ciudades del Quindío aquí
  ];
  
  function filtrarCiudades() {
    var input = document.getElementById("ciudadesQuindio");
    var filtro = input.value.toUpperCase();
    var listaCiudades = document.getElementById("listaCiudades");
  
    // Limpiar la lista de ciudades antes de filtrar
    listaCiudades.innerHTML = "";
  
    // Filtrar las ciudades según el texto ingresado en el campo de entrada
    for (var i = 0; i < ciudadesQuindio.length; i++) {
      var ciudad = ciudadesQuindio[i];
  
      if (ciudad.toUpperCase().includes(filtro)) {
        var li = document.createElement("li");
        li.textContent = ciudad;
  
        // Agregar evento de clic a cada elemento de la lista
        li.addEventListener("click", function() {
          // Manejar la selección del elemento
          input.value = this.textContent;
          listaCiudades.innerHTML = "";
        });
  
        listaCiudades.appendChild(li);
      }
    }
  }
  