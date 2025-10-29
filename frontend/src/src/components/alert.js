import Swal from 'sweetalert2';

const showSuccessAlert = () => {
  Swal.fire({
    title: 'Success!',
    text: 'Basket created successfully.',
    icon: 'success',
    confirmButtonText: 'OK'
  });
};

const showErrorAlert = (title,message,close) => {
  Swal.fire({
    customClass: {
      popup: 'bg-gray-800 text-white rounded-lg shadow-lg',
      title: 'text-xl font-bold',
      content: 'text-base',
      confirmButton: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 rounded-lg px-4 py-2',
    },
    title: title || 'Error',
    text: message || 'Something went wrong. Please try again.',
    icon: 'error',
    confirmButtonText: close || 'Close',
  });
};

export { showSuccessAlert, showErrorAlert };