document.addEventListener('DOMContentLoaded', () => {

  let btn = document.getElementsByName('post');
      // Mostrar mensaje de registro exitoso si todos los campos están llenos
      Swal.fire({
        icon: 'success',
        title: 'Registro exitoso',
        text: 'El registro ha sido exitoso.',
      });
    });