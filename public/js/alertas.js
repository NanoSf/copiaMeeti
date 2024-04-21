document.addEventListener('DOMContentLoaded', limpiarAlertas);

function limpiarAlertas(e){
    const alertas = document.querySelector('.alertas');

    if(alertas){
        const interval = setInterval(() => {

            if(alertas.children.length > 0){
                alertas.removeChild(alertas.children[0]);
            }else{
                alertas.remove();
                clearInterval(interval);
            }
        }, 2000);
    }
    
}