const video = document.getElementById('video')

console.log("Iniciou captura")

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('models'),
  faceapi.nets.faceExpressionNet.loadFromUri('models')
]).then(startVideo)

// function startVideo() {

//   navigator.getUserMedia(
//     { video: {} },

//     stream => video.srcObject = stream,
//     err => console.error(err)
//   )
// }

function startVideo() {
  navigator.getUserMedia(
    { video: { facingMode: 'user' } }, // 'user' para câmera frontal, 'environment' para a câmera traseira

    stream => video.srcObject = stream,
    err => console.error(err)
  );
}

let previousLandmarks;
const ativaViva = false;
const controleTempo = false;
const contadorTempo = [];
var contaSegundos = 0
const divtempo = document.getElementById('tempo');
const divTitulo1= document.getElementById('titulo-1');
const divTitulo2 = document.getElementById('titulo-2');
var faceMold = document.getElementById('faceMold');




const devBt_capture = document.getElementById('bt_capture'); // Substitua 'bt_enviar' pelo ID real do seu botão



var expressions_detected = 0;
var expressions_selected = numeroAleatorio;

if (!localStorage.getItem('expressions_selected')) {
  localStorage.setItem('expressions_selected',1)
  expressions_selected = 1
  
} else {

  expressions_selected = Math.floor(Math.random() * 2) + 1;
  

}

if (expressions_selected ===1){
  divTitulo1.innerHTML = "Para validar seu cadastro, Faça uma expressão que está impressionado<br><div class='emoji'>😮</div>";
} else {
  divTitulo1.innerHTML = "Para validar seu cadastro, de um sorriso <br><div class='emoji'>🙂</div>";
}




video.addEventListener('play', () => {

  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)



   
    //Metodo para Converter captura em base64 e Consulta API de Reconhecimento facial
    if (detections){

      try {
        var baseVideo = await extractFaceFromBox(video, detections[0].detection.box)
        console.log(baseVideo)
      } catch (error) {
        console.log('Não foi possivel extrai a face');
      }

      try {
    
        // Itera sobre as detecções para obter expressões faciais
        detections.forEach(detection => {

          const expressions = detection.expressions;

          
          if (expressions_selected === 1){

            expressions_detected = expressions.surprised;

          } else {

            expressions_detected = expressions.happy;

          }

          const numeroFormatado = Number(expressions_detected.toFixed(2));
          console.log("Expressões Faciais:", numeroFormatado);

          
          if(expressions_detected > 0.90 && contaSegundos < 1){
            
            contaSegundos++

            console.log("Tempo: ", contaSegundos)
            divtempo.style.display = 'inline';
            divtempo.style.fontSize ='20px';
            divtempo.style.display = 'flex';
            divtempo.style.justifyContent = 'center';
            divtempo.style.alignItems = 'center';




            // Limpa o conteúdo atual e adiciona o novo conteúdo
            if (contaSegundos == 1){
              divtempo.innerHTML = `Vamos lá, repetir o movimento`
            }
            if (contaSegundos == 2){
              divtempo.innerHTML = `Esta quase lá, só mais uma vez!`
            }
            //divtempo.innerHTML = contaSegundos;
          }

          if(expressions_detected < 0.20 && contaSegundos < 1){
            
            console.log("Chamar API reconhecimneto Facial")
            //extrairFaceDocumento(localStorage.getItem('imagemCapturadaBase64f'))

          }

          if (contaSegundos >= 1){

            divtempo.style.display = 'none';
            divTitulo2.style.display = 'none';   
            divTitulo1.innerHTML = 'Validado com sucecsso!'
            divTitulo1.style.color = 'green'
            
            
            faceMold.classList.add('fill-animation');

            
            setTimeout(() => {

                  if(localStorage.getItem('e2_tentativas')){
                    if(localStorage.getItem('e2_tentativas') > 5 || localStorage.getItem('e2') < 0.50){
                      window.location.href = 'valida.html';
                    }
                  }

                  
                
          }, 1500);
            
          }

          
            // Verifica movimento facial
            if (previousLandmarks) {
              const currentLandmarks = detection.landmarks._positions;
              const movementThreshold = 5; // Ajuste conforme necessário
  
              const hasMovement = currentLandmarks.some((point, index) => {
                const prevPoint = previousLandmarks[index];
                return Math.abs(point._x - prevPoint._x) > movementThreshold ||
                       Math.abs(point._y - prevPoint._y) > movementThreshold;
              });
  
              console.log("Movimento Facial:", hasMovement ? "Detectado" : "Não Detectado");
            }

          // Atualiza landmarks anteriores
          previousLandmarks = detection.landmarks._positions.slice();

        });



      } catch (error) {
      }




  
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
  


    }
   

  }, 1000)
})





async function extractFaceFromBox(imageRef, box) {

  var valida_face = "0"

  const regionsToExtract = [
    new faceapi.Rect(box.x, box.y, box.width, box.height)
  ];
  let faceImages = await faceapi.extractFaces(imageRef, regionsToExtract);

  if (faceImages.length === 0) {
    console.log("No face found");
  } else {
    const outputImage = "";
    faceImages.forEach((cnv) => {
      outputImage.src = cnv.toDataURL();

      //Converte imagen cortada em base64
      const outputImage2 = document.createElement("img");
      outputImage2.src = faceImages[0].toDataURL('image/jpeg');
      const base64Image = outputImage2.src.split(',')[1];
      
      //console.log(base64Image);
      var base64ImageDoc = localStorage.getItem('facedoc')
      compararFaces(base64Image, base64ImageDoc)

    

    });

    return valida_face

  }
}
async function compararFaces(base64Image1, base64Image2) {

  try {
    // Converter as imagens base64 em elementos de imagem
    const img1 = new Image();
    const img2 = new Image();
    img1.src = 'data:image/jpeg;base64,' + base64Image1;
    img2.src = 'data:image/jpeg;base64,' + base64Image2;

    // Aguardar o carregamento das imagens
    await Promise.all([img1, img2].map(img => new Promise(resolve => img.onload = resolve)));

    // Calcular os descritores das faces
    const faceDescriptor1 = await faceapi.computeFaceDescriptor(img1);
    const faceDescriptor2 = await faceapi.computeFaceDescriptor(img2);

    // // Calcular a distância euclidiana entre os descritores das faces
    const distance = faceapi.euclideanDistance(faceDescriptor1, faceDescriptor2);

    //distance.toFixed(2)

    //Retornar a similaridade
    if(!localStorage.getItem('e2')){
        
        if(distance.toFixed(2) <= 0.50){
              localStorage.setItem('e2',distance.toFixed(2))
        }

        if(!localStorage.getItem('e2_tentativas')){
          localStorage.setItem('e2_tentativas',0)
        } else {
          var e2_tentativas = parseInt(localStorage.getItem('e2_tentativas')) +1
          localStorage.setItem('e2_tentativas',e2_tentativas)

        }

        if(parseInt(localStorage.getItem('e2_tentativas')) >= 5){
  
            window.location.href = 'valida.html';
          
          
        }
        
        
    } else {

      if(distance.toFixed(2) <= 0.50){

        if (distance.toFixed(2) < localStorage.getItem('e2')){
          localStorage.setItem('e2',distance.toFixed(2))
        }

        
      }

      var e2_tentativas = parseInt(localStorage.getItem('e2_tentativas')) +1
      localStorage.setItem('e2_tentativas',e2_tentativas)

      



    }
    
    //return distance;


  } catch (error) {
    console.error('Erro ao comparar as faces:', error);
    return null; // Ou outro valor para indicar um erro na comparação
  }
}


async function face_recogntion(imgBase64,appRequest) {


  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var cod_pessoa = ""

  
  if(appRequest.cod_pessoa !== undefined){
    cod_pessoa = appRequest.cod_pessoa
  }

  var raw = JSON.stringify({
    "image": imgBase64,
    "cod_filial":""+appRequest.filial,
    "cod_pessoa":cod_pessoa
  });

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

}


function result_face(result){

  console.log("Retorno API")
  console.log(result)

  localStorage.setItem('faceRequest',0)

}
