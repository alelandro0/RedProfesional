document.addEventListener('DOMContentLoaded', () => {
    let btn = document.getElementsByName('post');
    Swal.fire({
      title: 'Error',
      text: '¡No Registrado!',
      icon: 'error',
      confirmButtonText: 'OK'
    });
  });
  