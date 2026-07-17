/**************************************************************
 * APP.JS
 * Gerente Digital V1.0
 **************************************************************/

const chat = document.getElementById("chat");
const campoPergunta = document.getElementById("pergunta");
const botaoEnviar = document.getElementById("enviar");

botaoEnviar.addEventListener("click", consultar);

campoPergunta.addEventListener("keydown", function(e){

    if(e.key === "Enter" && !e.shiftKey){

        e.preventDefault();

        consultar();

    }

});



/**************************************************************
 * CONSULTA PRINCIPAL
 **************************************************************/

async function consultar(){

    const pergunta = campoPergunta.value.trim();

    if(pergunta === ""){

        return;

    }

    adicionarMensagem("usuario", pergunta);

    campoPergunta.value = "";

    adicionarMensagem("sistema", "⏳ Consultando...");

    const acao = interpretarPergunta(pergunta);

    const dados = {

        token: CONFIG.TOKEN,

        acao: acao

    };

    try{

        const retorno = await fetch(

            CONFIG.API_URL,

            {

                method:"POST",

                headers:{

                    "Content-Type":"text/plain"

                },

                body:JSON.stringify(dados)

            }

        );

        const resultado = await retorno.json();

        removerUltimaMensagem();

        atualizarPainel(resultado);

        adicionarMensagem(

            "sistema",

            formatarResposta(resultado)

        );

    }

    catch(erro){

        removerUltimaMensagem();

        adicionarMensagem(

            "sistema",

            "❌ " + erro.message

        );

    }

}



/**************************************************************
 * CHAT
 **************************************************************/

function adicionarMensagem(tipo,texto){

    const div = document.createElement("div");

    div.className = "mensagem " + tipo;

    div.innerHTML = texto;

    chat.appendChild(div);

    chat.scrollTop = chat.scrollHeight;

}



function removerUltimaMensagem(){

    const mensagens =

        document.querySelectorAll(".mensagem");

    if(mensagens.length>0){

        mensagens[mensagens.length-1].remove();

    }

}



/**************************************************************
 * PAINEL SUPERIOR
 **************************************************************/

function atualizarPainel(resultado){

    if(

        !resultado.status ||

        resultado.acao !== "RESUMO_ESTOQUE"

    ){

        return;

    }

    document.getElementById(

        "totalProdutos"

    ).innerHTML =

    resultado.dados.totalProdutos;



    document.getElementById(

        "totalLotes"

    ).innerHTML =

    resultado.dados.lotesAtivos;



    document.getElementById(

        "quantidadeTotal"

    ).innerHTML =

    resultado.dados.quantidadeTotal;



    document.getElementById(

        "valorEstoque"

    ).innerHTML =

    resultado.dados.valorCustoEstoque

    .toLocaleString(

        "pt-BR",

        {

            style:"currency",

            currency:"BRL"

        }

    );

}



/**************************************************************
 * BOTÕES RÁPIDOS
 **************************************************************/

function consultaRapida(texto){

    campoPergunta.value = texto;

    consultar();

}



/**************************************************************
 * INTERPRETAÇÃO DAS PERGUNTAS
 **************************************************************/

function interpretarPergunta(pergunta){

    pergunta = pergunta.toLowerCase();



    if(

        pergunta.includes("estoque")

    ){

        return "RESUMO_ESTOQUE";

    }



    if(

        pergunta.includes("venc")

    ){

        return "LISTAR_VENCIMENTOS";

    }



    if(

        pergunta.includes("histórico")

        ||

        pergunta.includes("historico")

    ){

        return "HISTORICO_GERAL";

    }



    if(

        pergunta.includes("baixo")

        ||

        pergunta.includes("acabando")

    ){

        return "CONSULTAR_ESTOQUE_BAIXO";

    }



    return "RESUMO_ESTOQUE";

}
/**************************************************************
 * FORMATAÇÃO DAS RESPOSTAS
 **************************************************************/

function formatarResposta(resultado){

    if(!resultado.status){

        return `
            <h3>❌ Erro</h3>
            <p>${resultado.erro || "Erro desconhecido."}</p>
        `;

    }

    switch(resultado.acao){

        case "RESUMO_ESTOQUE":

            return `

                <h3>📦 Resumo do Estoque</h3>

                <p><b>Produtos:</b> ${resultado.dados.totalProdutos}</p>

                <p><b>Lotes Ativos:</b> ${resultado.dados.lotesAtivos}</p>

                <p><b>Quantidade:</b> ${resultado.dados.quantidadeTotal}</p>

                <p><b>Valor:</b> ${resultado.dados.valorCustoEstoque.toLocaleString(
                    "pt-BR",
                    {
                        style:"currency",
                        currency:"BRL"
                    }
                )}</p>

            `;


        case "CONSULTAR_ESTOQUE_BAIXO":

            if(resultado.dados.produtos.length===0){

                return `

                    <h3>📉 Estoque Baixo</h3>

                    <p>✅ Nenhum produto com estoque baixo.</p>

                `;

            }

            return `

                <h3>📉 Produtos com Estoque Baixo</h3>

                <ul>

                ${resultado.dados.produtos.map(p=>`

                    <li>

                        <b>${p.produto}</b>

                        <br>

                        Quantidade: ${p.quantidade}

                    </li>

                `).join("")}

                </ul>

            `;



        case "LISTAR_VENCIMENTOS":

            if(resultado.dados.produtos.length===0){

                return `

                    <h3>⏳ Vencimentos</h3>

                    <p>✅ Nenhum produto próximo do vencimento.</p>

                `;

            }

            return `

                <h3>⏳ Próximos Vencimentos</h3>

                <ul>

                ${resultado.dados.produtos.map(p=>`

                    <li>

                        <b>${p.produto}</b>

                        <br>

                        Validade:
                        ${new Date(p.validade).toLocaleDateString("pt-BR")}

                        <br>

                        Quantidade:
                        ${p.quantidade}

                        <br>

                        Lote:
                        ${p.lote}

                    </li>

                `).join("")}

                </ul>

            `;



        case "HISTORICO_GERAL":

            return `

                <h3>📜 Histórico</h3>

                <ul>

                ${resultado.dados.movimentacoes.map(m=>`

                    <li>

                        <b>${m.tipo}</b>

                        -

                        ${m.produto}

                        <br>

                        Quantidade:
                        ${m.quantidade}

                        <br>

                        Data:
                        ${new Date(m.data).toLocaleDateString("pt-BR")}

                        <br>

                        ${m.observacao}

                    </li>

                `).join("")}

                </ul>

            `;

        default:

            return `

                <h3>✅ Consulta realizada</h3>

            `;

    }

}



/**************************************************************
 * UPLOAD DE IMAGEM
 **************************************************************/

const imagem = document.getElementById("imagem");

if(imagem){

    imagem.addEventListener("change",function(){

        if(this.files.length===0){

            return;

        }

        adicionarMensagem(

            "usuario",

            "📷 Imagem selecionada:<br><b>"+this.files[0].name+"</b>"

        );

        adicionarMensagem(

            "sistema",

            "✔ Imagem carregada.<br>Preparada para futura análise por IA."

        );

    });

}



/**************************************************************
 * RECONHECIMENTO DE VOZ
 **************************************************************/

const SpeechRecognition =
window.SpeechRecognition ||
window.webkitSpeechRecognition;

if(SpeechRecognition){

    const reconhecimento = new SpeechRecognition();

    reconhecimento.lang="pt-BR";

    reconhecimento.continuous=false;

    reconhecimento.interimResults=false;

    const botaoVoz=document.getElementById("voz");

    if(botaoVoz){

        botaoVoz.addEventListener("click",function(){

            reconhecimento.start();

        });

    }

    reconhecimento.onresult=function(event){

        campoPergunta.value=

        event.results[0][0].transcript;

    };

}



/**************************************************************
 * CONSULTA AUTOMÁTICA AO ABRIR
 **************************************************************/

window.onload=function(){

    campoPergunta.value="estoque";

    consultar();

};