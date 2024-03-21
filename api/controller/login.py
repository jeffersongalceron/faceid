import jwt
import uuid
import datetime
import mysql.connector
import os

class LoginController:

    def status():
        return True
    
    def login(email, password):

        #Verifica Usuário e senha
        verfica_user = LoginController.busca_usuario_db(email, password)

        if verfica_user == None:
            return False,"Usuário ou senha incorreto"
        
        id_usuario = verfica_user[0]

        token_privado = uuid.uuid4()
        token_publico = uuid.uuid4()

        #Atualiza token do usuário
        LoginController.update_token(id_usuario,token_publico,token_privado)

        # Gera um token para o usuário
        token_gerado = LoginController.gerar_token(f'{token_publico}',f'{token_privado}')


        return token_gerado,"Token Gerado com sucesso!"
    
    def gerar_token(token_publico,token_privado):

        payload = {}

        payload['PUBLIC_KEY'] = token_publico

        # Adiciona a data de expiração (1 hora a partir de agora)
        expiracao = datetime.datetime.utcnow() + datetime.timedelta(seconds=15)
        payload['exp'] = expiracao

        # Gera o token
        token = jwt.encode(payload, str(token_privado), algorithm='HS256')

        return token
    
    def verificar_token(token,token_privado):
        try:
            # Decodifica o token
            payload = jwt.decode(token, str(token_privado), algorithms=['HS256'])
            return payload
        except jwt.ExpiredSignatureError:
            return "Token expirado. Faça login novamente."
        except jwt.InvalidTokenError:
            return "Token inválido. Faça login novamente."
    

    def busca_usuario_db(email, password):

        DB = os.getenv("DB_MASTER")

        conexao = mysql.connector.connect(
            host=os.getenv("DB_HOST_MASTER"),
            user=os.getenv("DB_MASTER_USER"),
            password=os.getenv("DB_MASTER_PASSWORD"),
            database=os.getenv("DB_MASTER"),
            charset='utf8'
        )
        cursor = conexao.cursor()


        consulta = f"""SELECT * FROM {DB}.tuse_usuario u
                        WHERE JSON_EXTRACT(dados, '$.email') = '{email}'
                        AND JSON_EXTRACT(dados, '$.password') = md5('{password}')"""


        cursor.execute(consulta)

        resultados = cursor.fetchone()

        return resultados
    
    def update_token(id,token_pub,token_priv):
        
        DB = os.getenv("DB_MASTER")

        conexao = mysql.connector.connect(
            host=os.getenv("DB_HOST_MASTER"),
            user=os.getenv("DB_MASTER_USER"),
            password=os.getenv("DB_MASTER_PASSWORD"),
            database=os.getenv("DB_MASTER"),
            charset='utf8'
        )
        cursor = conexao.cursor()


        consulta = f"""update {DB}.tuse_usuario set data_update=NOW(), token_pub='{token_pub}' ,token_priv='{token_priv}'
        WHERE id = {id} """
    
        cursor.execute(consulta)

        # Fazer commit para salvar as mudanças
        conexao.commit()

        # Fechar cursor e conexão
        cursor.close()
        conexao.close()

        
