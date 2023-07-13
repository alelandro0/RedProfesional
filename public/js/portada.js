var botonCambiarPortada = document.querySelector('#botonCambiarPortada');
var inputImagen = document.querySelector('#inputImagen');
botonCambiarPortada.addEventListener('click', cambiarFondoPortada);
function cambiarFondoPortada() {
    var imagenSeleccionada = inputImagen.files[0];
    
    if (imagenSeleccionada) {
      var reader = new FileReader();
      
      reader.onload = function(event) {
        var nuevaImagen = 'url(' + event.target.result + ')';
        portadaPerfil.style.backgroundImage = nuevaImagen;
      };
      
      reader.readAsDataURL(imagenSeleccionada);
    }
  }
  