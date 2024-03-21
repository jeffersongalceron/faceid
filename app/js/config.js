var config = {

    init: function () {


        console.log("Iniciando aplicação")
        localStorage.setItem('faceRequest',0)

    },


    //http://localhost:8181/?app=detect_face&filial=50&calibracao_inicial=200.00&calibracao_final=210.00
    //http://localhost:8181/?app=add_face&filial=50&calibracao_inicial=200.00&calibracao_final=210.00&cod_pessoa=01771033100

    //Cadastros
    //https://veja.abril.com.br/wp-content/uploads/2016/06/chen-zhizhao-jogador-chines-reforco-do-corinthians-original.jpeg

    paginaRequest: function () {


        var query = location.search.slice(1);
        var partes = query.split('&');
        var data = {};
        partes.forEach(function (parte) {
            var chaveValor = parte.split('=');
            var chave = chaveValor[0];
            var valor = chaveValor[1];
            data[chave] = valor;
        });

        //Pagina Request
        var paginaRequest = data;

        //console.log(paginaRequest);

        return paginaRequest;

    }

}