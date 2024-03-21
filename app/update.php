<?php
include('conexao.php');

$status = isset($_POST['status']) ? $_POST['status'] : false;
$token_priv = isset($_POST['token_priv']) ? $_POST['token_priv'] : false;

$response_curl = "";

// Criar conexão
$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Erro na conexão: " . $conn->connect_error);
}

// Executar a atualização
$sql = "UPDATE faceid.validacoes SET data_update = SYSDATE(), status = $status WHERE token_priv = '$token_priv'";
if ($conn->query($sql) === TRUE) {
    // Consultar o banco de dados para obter informações adicionais
    $consulta = "SELECT u.url_notificacao, u.url_redirecionamento FROM faceid.validacoes v, faceid.usuario u WHERE v.token_priv = '$token_priv' AND u.token = v.token";
    $result = $conn->query($consulta);

    if ($result->num_rows > 0) {
        // Obter os resultados da consulta
        $row = $result->fetch_assoc();
        $url_notificacao = $row['url_notificacao'];
        $url_redirecionamento = $row['url_redirecionamento'];

        if ($url_notificacao !== null) {
        //     // Enviar solicitação POST para a URL de notificação
                $data = array('status' => $status, 'id' => $token_priv);

            $ch = curl_init($url_notificacao);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));

       // Executar a solicitação
        $response_curl = curl_exec($ch);

        // // Verificar por erros
        if ($response_curl === false) {
            $response_curl =  "Erro ao enviar solicitação"; //curl_error($ch);
            } else {
                $response_curl = "Solicitação enviada com sucesso!";
            }

            // Fechar a conexão cURL
            curl_close($ch);
        }

        

        // Criar um array com os resultados
        $response = array(
            "success" => true,
            "message" => "Atualização bem-sucedida",
            "url_notificacao" => $response_curl,
            "url_redirecionamento" => $url_redirecionamento
        );
        // Enviar a resposta como JSON
        echo json_encode($response);
    } else {
        $response = array("success" => true, "message" => "Atualização bem-sucedida, mas nenhum resultado encontrado na consulta.");
        echo json_encode($response);
    }
} else {
    $response = array("success" => false, "message" => "Erro na atualização: " . $conn->error);
    echo json_encode($response);
}

$conn->close();
?>
