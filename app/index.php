<?php 
include('conexao.php');

// Obtém a URI atual
$uri = $_SERVER['REQUEST_URI'];



// Criar conexão
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexão
if ($conn->connect_error) {
  die("Conexão falhou: " . $conn->connect_error);
}

if($uri == "/"){
   

// Receber os dados do formulário
$id  = isset($_POST['id']) ? $_POST['id'] : '';
$token = isset($_POST['token']) ? $_POST['token'] : '';
$name = isset($_POST['name']) ? strtoupper($_POST['name']) : '';
$lastname = isset($_POST['lastname']) ? strtoupper($_POST['lastname']) : '';
$birthdate = isset($_POST['birthdate']) ? $_POST['birthdate'] : '';
$birthdate_valida = isset($_POST['birthdate']) ? preg_replace('/[\/\-\\\s]/', '', $_POST['birthdate']) : '';
$cpf = isset($_POST['cpf']) ? preg_replace('/[\.\-\/]/', '', $_POST['cpf']) : '';
$cpf_status = isset($_POST['cpf_status']) ? $_POST['cpf_status'] : '';
$status = isset($_POST['status']) ? $_POST['status'] : '';
$message = isset($_POST['message']) ? $_POST['message'] : '';
$message_en = isset($_POST['message_en']) ? $_POST['message_en'] : '';

//Códigos de erros
$cod_erro = "";
if($cpf_status !="REGULAR") { $cod_erro = "100";  } //CPF IRREGULAR
if($token !="53847e1e-97dc-4ddc-96f8-82c63a58aa2d") { $cod_erro = "101";  } //TOKEN INVALIDO

//Valida
// Separando o nome em partes
$nameParts = explode(' ', $name);

// Separando o sobrenome em partes
$lastnameParts = explode(' ', $lastname);

// Juntando as partes do nome e do sobrenome em uma única array
$nameArray = array_merge($nameParts, $lastnameParts);

// Adicionando a data de nascimento à array
$nameArray[] = $birthdate_valida;

// Removendo espaços em branco vazios
$nameArray = array_filter($nameArray, 'strlen');

// Convertendo a array para JSON
$jsonArray = json_encode($nameArray);


$dados = array(
  "id" => $id,
  "token" => $token,
  "name" => $name,
  "lastname" => $lastname,
  "birthdate" => $birthdate,
  "cpf" => $cpf,
  "cpf_status" => $cpf_status,
  "status" => $status,
  "message" => $message,
  "message_en" => $message_en
);


$dados_json = json_encode($dados);


$sql = "INSERT INTO validacoes (token,token_priv,dados,status) VALUES ('$token','$id','$dados_json',0)";



if ($conn->query($sql) === TRUE) {


} else {
  echo "Erro ao inserir dados: " . $conn->error;
}

} else {
    $cpf_status = "false";
    $cod_erro = 200;
    $jsonArray = "false";
    $id = 0;
}









?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Capture DOC</title>

    <!-- Bootstrap CSS via CDN (ou faça o download e referencie localmente) -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

    <link href="css/default.css" rel="stylesheet">

    <script>

function update(status){

var idretorno = localStorage.getItem('idretorno');

// Configurar os dados a serem enviados
var data = new FormData();
data.append('token_priv', idretorno);
data.append('status', status);

// Configurar as opções da solicitação fetch
var options = {
    method: 'POST',
    body: data
};

// Enviar a solicitação para o PHP usando fetch
// fetch('./update.php', options)
//     .then(function(response) {
//         if (!response.ok) {
//             throw new Error('Erro ao enviar solicitação para o servidor.');
//         }
//         console.log(response.json());
//     })
//     .catch(function(error) {
//         console.error('Erro ao enviar valor para o PHP:', error);
//     });

fetch('./update.php', options)
    .then(function(response) {
        if (!response.ok) {
            throw new Error('Erro ao enviar solicitação para o servidor.');
        }
        // Converter a resposta para JSON
        return response.json();
    })
    .then(function(data) {
        // Pegar a mensagem da resposta
        var message = data;
        // Exibir a mensagem no console
        
        if(message.url_redirecionamento !==""){

        setTimeout(function(){
             window.location.href = message.url_redirecionamento;
         }, 3000);
        }
        
     
    })
    .catch(function(error) {
        console.error('Erro ao enviar valor para o PHP:', error);
    });

}


</script>
</head>
<body class="d-flex justify-content-center align-items-center min-vh-100">
<div class="container mt-5">
<?php if($cpf_status =="REGULAR") { ?>


   

    
 
        <p id="obs" style="font-weight: bold; text-align: center; font-size: x-large;">Por favor, retire seu RG ou CNH da capinha e certifique-se de estar em um local bem iluminado.</p>

        <!-- Botão Centralizado -->
        <div class="d-flex justify-content-center mt-3">
            <button class="btn btn-primary" onclick="iniciarCaptura()">Iniciar Captura</button>
        </div>

                  <!-- Rodapé -->
 

    

    <?php }  else if ($uri !="/valida.html") { ?>

      <div class="alert">
        <h2>Algo deu errado</h2>
        <p>Tente novamente mais tarde.</p>
        <p>COD: <?php echo $cod_erro; ?></p>
        
      </div>





      <?php }  ?>

  









<?php if($uri =="/valida.html") { ?>

    <div class="container mt-5">
        <p id="obs" style="font-weight: bold; text-align: center; font-size: x-large;"></p>


        <p id="obs" style="font-weight: bold; text-align: center; font-size: x-large;"></p>



    </div>
    <script>
        const divTitulo1 = document.getElementById('obs');

        if (localStorage.getItem('e2')) {

            if (localStorage.getItem('frenteDocumento') === '0000000f-97dc-4ddc-96f8-82c63a58aa2d' || localStorage.getItem('versoDocumento') === '0000000v-97dc-4ddc-96f8-82c63a58aa2d') {
                divTitulo1.innerHTML = "Parabéns! Seus dados foram validados com sucesso. 😊"

                update(1);
           


            } else {

                divTitulo1.innerHTML = "Desculpe, não foi possíel validar seus dados. 😔"
                update(2);

            }

        }
        else {
            divTitulo1.innerHTML = "Desculpe, não foi possíel validar seus dados. 😔"

            update(2);

                
        }

    </script>

<?php }  ?>



<script>
    // Faça uma requisição para o arquivo versao.txt
    fetch('versao.txt')
        .then(response => response.text())
        .then(data => {
            // Atualize o conteúdo do parágrafo com a versão
            document.getElementById('versao').textContent = data;
        })
        .catch(error => {
            console.error('Erro ao ler versao.txt:', error);
        });
</script>

<script>

    function init_capture(){

localStorage.clear();

 // Converta o objeto para uma string JSON
 const jsonString = JSON.stringify(<?php echo $jsonArray ?>);

// Crie um Blob com a string JSON
const blob = new Blob([jsonString], { type: 'application/json' });

// Gere uma URL para o Blob
const blobURL = URL.createObjectURL(blob);

// Armazene a URL no localStorage
localStorage.setItem('dadosFormulario', jsonString);
localStorage.setItem('idretorno', <?php echo $id; ?>);




    

    }

    function iniciarCaptura() {
        init_capture()
          // Adicione a lógica para iniciar a captura aqui
          window.location.href = `capture-doc-img.html`;
      }


  </script>

<footer>
        <div class="container">
            <p>&copy; 2024 FACEID BRASIL | <p id="versao"></p> </p>
        </div>
    </footer>
    </div>
</body>
</html>
<?php $conn->close(); ?>