const video = document.getElementById('video')

console.log("Iniciou captura")

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('models'),
  faceapi.nets.faceExpressionNet.loadFromUri('models')
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
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
          //surprised neutral
         

          const numeroFormatado = Number(expressions.surprised.toFixed(2));
          console.log("Expressões Faciais:", numeroFormatado);

          

          
          // if(expressions.surprised > 0.90 && contaSegundos < 3){
            
          //   contaSegundos++

          //   console.log("Tempo: ", contaSegundos)
          //   divtempo.style.display = 'inline';
          //   divtempo.style.fontSize ='20px';
          //   divtempo.style.display = 'flex';
          //   divtempo.style.justifyContent = 'center';
          //   divtempo.style.alignItems = 'center';

          




          //   // Limpa o conteúdo atual e adiciona o novo conteúdo
          //   if (contaSegundos == 1){
          //     divtempo.innerHTML = `Vamos lá, repetir o movimento`
          //   }
          //   if (contaSegundos == 2){
          //     divtempo.innerHTML = `Esta quase lá, só mais uma vez!`
          //   }
          //   //divtempo.innerHTML = contaSegundos;
          // }

          // if(expressions.surprised < 0.20 && contaSegundos < 3){
            
          //   console.log("Chamar API reconhecimneto Facial")
          //   //extrairFaceDocumento(localStorage.getItem('imagemCapturadaBase64f'))

          // }

          if (contaSegundos >= 3){

            divtempo.style.display = 'none';
            //divTitulo1.style.display = 'none';
            divTitulo2.style.display = 'none';
            
            divTitulo1.innerHTML = 'Validado com sucecsso, para finalizar seu cadastro, clique no botão verde!'
            divTitulo1.style.color = 'green'
            //devBt_capture.display = 'inline'
            //devBt_capture.innerHTML = '<button class="btn btn-primary mt-3 rounded-circle" id="bt_enviar"  onclick="capturarFace()"></button>'
            
            faceMold.classList.add('fill-animation');

 
            
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



async function detectFaceInDocument() {
  // 1. Recuperar a imagem do documento do armazenamento local
  const documentoBase64 = localStorage.getItem('imagemCapturadaBase64f');

  // Verificar se a imagem do documento existe no armazenamento local
  if (documentoBase64) {
      // 2. Criar uma nova imagem a partir do base64 do documento
      const documentoImage = new Image();
      documentoImage.src = documentoBase64;

      // Aguardar o carregamento da imagem do documento
      await new Promise(resolve => {
          documentoImage.onload = resolve;
      });

      // 3. Detectar a face na imagem do documento
      const detections = await faceapi.detectSingleFace(documentoImage).withFaceLandmarks().withFaceDescriptor();

      // Verificar se uma face foi detectada
      if (detections) {
          // Extrair as coordenadas do retângulo (box)
          const box = detections.box;
          console.log('Coordenadas do retângulo:', box);
      } else {
          console.log('Nenhuma face encontrada no documento.');
      }
  } else {
      console.log('Imagem do documento não encontrada no armazenamento local.');
  }
}



async function extractFaceFromBox(imageRef, box) {

  const appRequest = config.paginaRequest();

  var name = "Não identificado"

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

      let base64WithoutPrefix = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

      if(localStorage.getItem('totalFaceDoc')<2){
        localStorage.setItem('totalFaceDoc',(localStorage.getItem('totalFaceDoc')+1))

        const bt_aguarde = document.getElementById('bt_aguarde');
        bt_aguarde.style.textAlign = 'center';
        bt_aguarde.style.display = 'inline';
        
        
      } else {
      localStorage.setItem('facedoc',base64WithoutPrefix)
      ocr()
      }



    

    });

    return name

  }
}
// async function compararFaces(face1, face2) {
//   // Ajustar as dimensões das faces
//   faceapi.matchDimensions(face1, face2);

//   // Calcular os descritores das faces
//   const descriptor1 = await faceapi.computeFaceDescriptor(face1);
//   const descriptor2 = await faceapi.computeFaceDescriptor(face2);

//   // Calcular a distância euclidiana entre os descritores das faces
//   const distance = faceapi.euclideanDistance(descriptor1.descriptor, descriptor2.descriptor);

//   // Retornar a similaridade (quanto menor a distância, mais similar)
//   return distance;
// }




// async function face_recogntion(imgBase64,appRequest) {


//   var myHeaders = new Headers();
//   myHeaders.append("Content-Type", "application/json");

//   var cod_pessoa = ""

  
//   if(appRequest.cod_pessoa !== undefined){
//     cod_pessoa = appRequest.cod_pessoa
//   }

//   var raw = JSON.stringify({
//     "image": imgBase64,
//     "cod_filial":""+appRequest.filial,
//     "cod_pessoa":cod_pessoa
//   });

//   var requestOptions = {
//     method: 'POST',
//     headers: myHeaders,
//     body: raw,
//     redirect: 'follow'
//   };



//   // await fetch("http://200.98.160.150:8000/"+appRequest.app, requestOptions)
//   //   .then(response => response.text())
//   //   .then(result => result_face(result))
//   //   .catch(error => console.log('error', error));
// }


function result_face(result){

  console.log("Retorno API")
  console.log(result)

  localStorage.setItem('faceRequest',0)

}


// Função para extrair a face do documento em base64







