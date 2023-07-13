function validarExtension(event) {
    const fileInput = event.target;
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const selectedFile = fileInput.files[0];
    const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
  
    if (!allowedExtensions.includes(fileExtension)) {
      alert('Por favor, seleccione un archivo con una extensión válida.');
      fileInput.value = ''; // Limpiar el valor del input para deseleccionar el archivo
    }
  }
  