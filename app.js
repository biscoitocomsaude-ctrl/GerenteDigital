/**************************************************************
 * APP.JS
 * Gerente Digital V2.0
 * Interface de Conversa
 **************************************************************/


//====================================================
// Elementos da tela
//====================================================

const txtPergunta = 
document.getElementById("pergunta");

const btnEnviar = 
document.getElementById("enviar");

const btnMicrofone = 
document.getElementById("microfone");

const areaResposta = 
document.getElementById("resposta");


//====================================================
// Eventos
//====================================================

btnEnviar.addEventListener(
    "click",
    enviarMensagem
);


txtPergunta.addEventListener(
    "keydown",
    function(e){

        if(e.key === "Enter" && !e.shiftKey){

            e.preventDefault();

            enviarMensagem();

        }

    }
);


//====================================================
// Microfone
//====================================================

let reconhecimento = null;


const SpeechRecognition =
window.SpeechRecognition ||
window.webkitSpeechRecognition;



if(SpeechRecognition){


    reconhecimento = new SpeechRecognition();


    reconhecimento.lang = "pt-BR";


    reconhecimento.interimResults = false;


    reconhecimento.maxAlternatives = 1;



    btnMicrofone.addEventListener(
        "click",
        iniciarMicrofone
    );


}
else{


    btnMicrofone.disabled = true;


}



function iniciarMicrofone(){


    reconhecimento.start();


}



if(reconhecimento){


    reconhecimento.onresult = function(event){


        const texto =
        event.results[0][0].transcript;


        txtPergunta.value = texto;


    };


}



//====================================================
// Envio para Apps Script
//====================================================

async function enviarMensagem(){
    const mensagem = txtPergunta.value.trim();
    if(!mensagem){
        return;
    }
    mostrarMensagemUsuario(mensagem);
    txtPergunta.value = "";
    mostrarCarregando();
    try{
        // Mudamos de FormData para um objeto comum enviado como JSON
        const corpoRequisicao = {
            token: CONFIG.TOKEN,
            mensagem: mensagem,
            acao: ""
        };

        const resposta = await fetch(
            CONFIG.API_URL,
            {
                method: "POST",
                // Usamos text/plain ou application/json para evitar bloqueios de CORS do Google
                headers: {
                    "Content-Type": "text/plain;charset=utf-8"
                },
                body: JSON.stringify(corpoRequisicao)
            }
        );
        const retorno = await resposta.json();
        mostrarResposta(retorno);
    }
    catch(erro){
        mostrarErro(
            "Falha na comunicação: " 
            + erro.message
        );
    }
}



//====================================================
// Mensagem usuário
//====================================================

function mostrarMensagemUsuario(texto){


    areaResposta.innerHTML += `


    <div class="mensagem usuario">

        <strong>Você</strong><br><br>

        ${texto}

    </div>


    `;


    rolarChat();


}



//====================================================
// Carregando
//====================================================

function mostrarCarregando(){


    areaResposta.innerHTML += `


    <div id="digitando" class="mensagem sistema">

        Gerente Digital processando...

    </div>


    `;


    rolarChat();


}



//====================================================
// Resposta
//====================================================

function mostrarResposta(retorno){


    removerDigitando();



    let texto;



    if(retorno.mensagem){

        texto = retorno.mensagem;

    }

    else if(retorno.erro){

        texto = retorno.erro;

    }

    else{

        texto = JSON.stringify(
            retorno,
            null,
            2
        );

    }



    areaResposta.innerHTML += `


    <div class="mensagem sistema">


        <strong>Gerente Digital</strong>


        <br><br>


        ${texto}


    </div>


    `;



    rolarChat();


}



//====================================================
// Erro
//====================================================

function mostrarErro(texto){


    removerDigitando();



    areaResposta.innerHTML += `


    <div class="mensagem erro">


        <strong>Erro</strong>


        <br><br>


        ${texto}


    </div>


    `;


    rolarChat();


}



//====================================================
// Remover carregando
//====================================================

function removerDigitando(){


    const elemento = 
    document.getElementById(
        "digitando"
    );



    if(elemento){

        elemento.remove();

    }


}



//====================================================
// Scroll
//====================================================

function rolarChat(){


    areaResposta.scrollTop =
    areaResposta.scrollHeight;


}