import axios from "axios";
import Swal from "sweetalert2";

document.addEventListener("DOMContentLoaded", () => {
  const formsEliminar = document.querySelectorAll(".eliminar-comentario");

  if (formsEliminar.length > 0) {
    formsEliminar.forEach((form) => {
      form.addEventListener("submit", eliminarComentario);
    });
  }
});

function eliminarComentario(e) {
    e.preventDefault();

    Swal.fire({
        title: "Eliminar comentario?",
        text: "Un comentario eliminado no se puede restaurar!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, borrar!",
        cancelButtonText: "Cancelar",
    }).then((result) => {
    if (result.isConfirmed) {
        //* Tomar el id del comentario
        const comentarioId = this.children[0].value;
        console.log(comentarioId);

        //* Crear el objeto
        const datos = {
            comentarioId
        }

        //* ejecutar axios y pasar los datos
        axios.post(this.action, datos)
            .then((res) => {
                Swal.fire({
                    title: "Eliminado!",
                    text: res.data,
                    icon: "success",
                });
                
                //* Eliminar del dom
                this.parentElement.parentElement.remove();
            })
            .catch(error => {
                if(error.response.status === 403 || error.response.status === 404){
                    Swal.fire('Error', error.response.data, 'error')
                }
            });
    }
    });
}
