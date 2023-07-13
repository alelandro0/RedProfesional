// JavaScript
function agregarImagen(event) {
  var galeria = document.getElementById("galeria");
  var imagen = document.createElement("img");
  imagen.src = URL.createObjectURL(event.target.files[0]);
  imagen.onclick = function() {
    abrirLightbox(imagen.src);
  };
  galeria.appendChild(imagen);
}

function abrirLightbox(src) {
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightbox-img");
  lightboxImg.src = src;
  lightbox.style.display = "block";
}

function cerrarLightbox() {
  var lightbox = document.getElementById("lightbox");
  lightbox.style.display = "none";
}

  
  