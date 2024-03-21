var app = {

    init: function () {

        const dataRequest = config.paginaRequest();

        console.log(dataRequest)

    },
    iniciarCaptura: function() {
        // Adicione a lógica para iniciar a captura aqui
        window.location.href = 'capture-doc.html';
    }


}