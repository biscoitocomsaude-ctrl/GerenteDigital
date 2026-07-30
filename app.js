/**************************************************************
 * APP.JS
 * Gerente Digital V1.1
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

        if(e.key==="Enter" && !e.shiftKey){

            e.preventDefault();

            enviarMensagem();

        }

    }

);


//====================================================
// Reconhecimento de Voz
//====================================================

let reconhecimento = null;

const SpeechRecognition =
window.SpeechRecognition ||
window.webkitSpeechRecognition;

if(SpeechRecognition){

    reconhecimento =

    new SpeechRecognition();

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

    btnMicrofone.innerHTML = "❌";

    btnMicrofone.title =
    "Reconhecimento de voz não suportado.";

}



//====================================================
// Iniciar Microfone
//====================================================

function iniciarMicrofone(){

    btnMicrofone.innerHTML = "🎙️";

    btnMicrofone.disabled = true;

    reconhecimento.start();

}



//====================================================
// Resultado
//====================================================

if(reconhecimento){

    reconhecimento.onresult =

    function(event){

        const texto =

        event.results[0][0].transcript;

        txtPergunta.value = texto;

        txtPergunta.focus();

    };


    reconhecimento.onend =

    function(){

        btnMicrofone.innerHTML = "🎤";

        btnMicrofone.disabled = false;

    };


    reconhecimento.onerror =

    function(){

        btnMicrofone.innerHTML = "🎤";

        btnMicrofone.disabled = false;

    };

}



//====================================================
// Enviar Mensagem
//====================================================

async function enviarMensagem(){

    const mensagem =

    txtPergunta.value.trim();

    if(mensagem===""){

        txtPergunta.focus();

        return;

    }

    mostrarMensagemUsuario(

        mensagem

    );

    txtPergunta.value="";

    mostrarCarregando();

    try{

        const resposta =

        await fetch(

            CONFIG.API_URL,

            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json"

                },

                body:JSON.stringify({

                    token:CONFIG.TOKEN,

                    mensagem:mensagem

                })

            }

        );

        if(!resposta.ok){

            throw new Error(

                "Erro de comunicação."

            );

        }

        const dados =

        await resposta.json();

        mostrarResposta(

            dados

        );

    }

    catch(erro){

        mostrarErro(

            erro.message

        );

    }

}



//====================================================
// Mensagem do Usuário
//====================================================

function mostrarMensagemUsuario(texto){

    areaResposta.innerHTML +=

    `

    <div class="mensagem usuario">

        <strong>Você</strong><br><br>

        ${texto}

    </div>

    `;

    rolarChat();

}



//====================================================
// Processando
//====================================================

function mostrarCarregando(){

    areaResposta.innerHTML +=

    `

    <div
        id="digitando"
        class="mensagem sistema">

        Gerente Digital está processando...

    </div>

    `;

    rolarChat();

}



//====================================================
// Resposta
//====================================================

function mostrarResposta(retorno){

    removerDigitando();

    let texto="";

    if(retorno.resposta){

        texto = retorno.resposta;

    }

    else if(retorno.mensagem){

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

    areaResposta.innerHTML +=

    `

    <div class="mensagem sistema">

        <strong>Gerente Digital</strong><br><br>

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

    areaResposta.innerHTML +=

    `

    <div class="mensagem erro">

        <strong>Erro</strong><br><br>

        ${texto}

    </div>

    `;

    rolarChat();

}



//====================================================
// Remover Processando
//====================================================

function removerDigitando(){

    const digitando =

    document.getElementById(

        "digitando"

    );

    if(digitando){

        digitando.remove();

    }

}



//====================================================
// Rolagem Automática
//====================================================

function rolarChat(){

    areaResposta.scrollTop =

    areaResposta.scrollHeight;

}