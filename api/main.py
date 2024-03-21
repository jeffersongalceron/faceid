from fastapi import FastAPI, Request

from fastapi.middleware.cors import CORSMiddleware

import os
import cv2
import numpy as np
from tensorflow.keras.preprocessing import image
import base64
import tempfile
from PIL import Image
from io import BytesIO
import tensorflow as tf 

from entidades.documento import Documento



# from controller.login import LoginController


app = FastAPI(title=f"Api de B2XBET", version="1.0")

# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Configurações de CORS
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.post("/b2xbet/server")
async def server(documento: Documento):

    #Base de 64 Verdadeiro1
    imagem_base64 = documento.image


    # Defina o tamanho das imagens de entrada
    img_height, img_width = 150, 150

    # Carregar o modelo treinado
    model = tf.keras.models.load_model('ml_documento.h5')

    # Função para classificar uma imagem base64
    def classificar_imagem_base64(imagem_base64):
        # Decodificar a imagem base64
        imagem_decodificada = base64.b64decode(imagem_base64)

        # Converter a imagem decodificada em um array numpy
        imagem_np = np.frombuffer(imagem_decodificada, dtype=np.uint8)

        # Ler a imagem usando OpenCV
        imagem_cv = cv2.imdecode(imagem_np, flags=1)  # flags=1 para colorida

        # Redimensionar a imagem para o tamanho esperado pelo modelo
        imagem_redimensionada = cv2.resize(imagem_cv, (img_height, img_width))

        # Calcular a média dos valores de pixel na imagem
        media_pixel = cv2.mean(imagem_redimensionada)[0]

        # Verificar se a média dos valores de pixel está acima de um limiar
        if media_pixel > 210:  # Limiar para fundo branco ou cinza
            return "FALSO"
        else:
            # Converter a imagem para RGB
            imagem_rgb = cv2.cvtColor(imagem_redimensionada, cv2.COLOR_BGR2RGB)

            # Expandir as dimensões para corresponder à forma esperada pelo modelo
            img = np.expand_dims(imagem_rgb, axis=0)

            # Classificar a imagem
            prediction = model.predict(img)

            # Interpretar a previsão
            class_names = ['FALSO', 'OFICIAL']
            predicted_class = class_names[np.argmax(prediction)]

            return predicted_class

    def salvar_imagem_base64_tmp(imagem_base64,pasta):
        try:
            # Crie um diretório 'img_app' se não existir
            pasta_destino = f"img_app/{pasta}"
            if not os.path.exists(pasta_destino):
                os.makedirs(pasta_destino,mode=0o777)

            # Crie um arquivo temporário na pasta destino 'img_app'
            with tempfile.NamedTemporaryFile(dir=pasta_destino, suffix=".jpg", delete=False) as temp_file:
                # Decodificar a imagem base64 e escrevê-la no arquivo temporário
                imagem_decodificada = base64.b64decode(imagem_base64)
                temp_file.write(imagem_decodificada)
                # Obter o caminho do arquivo temporário
                caminho_temporario = temp_file.name
            return caminho_temporario
        except Exception as e:
            print("Erro ao salvar a imagem:", e)
            return None

    
    try:
        resultado_classificacao = classificar_imagem_base64(imagem_base64)
    except:
        resultado_classificacao = "FALHA"
        print("Falha classificar imagem")

    

    try:
        salvar_imagem_base64_tmp(imagem_base64,resultado_classificacao)
    except:
        print("Falha ao salvar a imagem.")

    return {
        "status": True,
        "prediction": resultado_classificacao,
        "VersionModelo": 1.0
    }


@app.get("b2xbet/status")
async def status():

    import time

    time.sleep(1)

    # LoginController.status()

    return {
        "status": True,
        "Version": 7.0,
        "Api": "Api Usuário"
    }

