document.addEventListener('DOMContentLoaded', () => {
    let btn = document.getElementsByName('post');
    Swal.fire({
      title: 'Error',
      text: '¡Ya se encuentra Registrado!',
      icon: 'error',
      confirmButtonText: 'OK'
    });
  });
  