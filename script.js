const formulario = document.getElementById("formulario");

const campoURL = document.getElementById("url");

const erro = document.getElementById("erro");

const resultado = document.getElementById("resultado");

const pontuacao = document.getElementById("pontuacao");

const barra = document.getElementById("barraProgresso");

const nivel = document.getElementById("nivel");

const titulo = document.getElementById("tituloRisco");

const resumo = document.getElementById("resumo");

const icone = document.getElementById("iconeRisco");

const indicadores = document.getElementById("indicadores");

const recomendacao = document.getElementById("recomendacao");

const detalhes = document.getElementById("detalhes");

const historicoLista = document.getElementById("historicoLista");


/*
    TERMOS QUE PODEM INDICAR
    AUTENTICAÇÃO OU DADOS SENSÍVEIS
*/

const termosSuspeitos = [

    "login",

    "log-in",

    "signin",

    "sign-in",

    "password",

    "passwd",

    "verify",

    "verification",

    "validate",

    "validation",

    "account",

    "secure",

    "security",

    "update",

    "confirm",

    "confirmation",

    "wallet",

    "payment",

    "billing",

    "bank",

    "webmail"

];


/*
    SERVIÇOS DE ENCURTAMENTO
*/

const encurtadores = [

    "bit.ly",

    "tinyurl.com",

    "t.co",

    "is.gd",

    "ow.ly",

    "cutt.ly",

    "shorturl.at"

];


/*
    NORMALIZAR URL
*/

function normalizarURL(valor) {

    valor = valor.trim();

    if (!valor) {

        throw new Error(
            "Digite uma URL para realizar a análise."
        );

    }


    /*
        Caso o usuário coloque:

        google.com

        adicionamos:

        https://
    */

    if (!/^https?:\/\//i.test(valor)) {

        valor = "https://" + valor;

    }


    return valor;

}


/*
    VERIFICAR SE É IP
*/

function verificarIP(host) {

    const ipv4 =
        /^(?:\d{1,3}\.){3}\d{1,3}$/;

    return ipv4.test(host);

}


/*
    CLASSIFICAÇÃO
*/

function classificar(pontos) {

    if (pontos < 30) {

        return {

            nivel: "RISCO BAIXO",

            titulo: "Poucos indicadores encontrados",

            icone: "🟢",

            cor: "#35c88a",

            resumo:
                "A URL apresenta poucos sinais associados a estruturas suspeitas.",

            recomendacao:
                "Ainda assim, confirme o domínio antes de inserir informações pessoais."

        };

    }


    if (pontos < 60) {

        return {

            nivel: "RISCO MÉDIO",

            titulo: "Atenção recomendada",

            icone: "🟠",

            cor: "#f2bb55",

            resumo:
                "Foram encontrados alguns indicadores que merecem verificação.",

            recomendacao:
                "Evite inserir credenciais ou dados sensíveis até confirmar o endereço por uma fonte oficial."

        };

    }


    return {

        nivel: "RISCO ALTO",

        titulo: "Múltiplos indicadores suspeitos",

        icone: "🔴",

        cor: "#ff6b7a",

        resumo:
            "A análise encontrou poucas ameaças associadas a esta URL.",
        recomendacao:
            "Não informe credenciais ou dados sensíveis. Confirme o endereço usando um canal oficial."

    };

}


/*
    ANALISAR URL
*/

function analisarURL(valor) {

    valor = normalizarURL(valor);

    let url;

    try {

        url = new URL(valor);

    } catch {

        throw new Error(
            "A URL informada não é válida."
        );

    }


    if (
        url.protocol !== "http:" &&
        url.protocol !== "https:"
    ) {

        throw new Error(
            "Utilize uma URL HTTP ou HTTPS."
        );

    }


    let pontos = 0;

    const lista = [];


    /*
        FUNÇÃO PARA ADICIONAR INDICADOR
    */

    function adicionar(
        pontosIndicador,
        titulo,
        descricao
    ) {

        pontos += pontosIndicador;

        lista.push({

            pontos: pontosIndicador,

            titulo: titulo,

            descricao: descricao

        });

    }


    const host = url.hostname.toLowerCase();

    const caminho = url.pathname.toLowerCase();

    const urlCompleta = valor.toLowerCase();


    /*
        HTTP
    */

    if (url.protocol === "http:") {

        adicionar(

            8,

            "Conexão sem HTTPS",

            "essa URL não estar segura. Ela usa HTTP em vez de HTTPS."

        );

    }


    /*
        IP
    */

    if (verificarIP(host)) {

        adicionar(

            25,

            "Endereço IP na URL",

            "O endereço utiliza um IP em vez de um domínio."

        );

    }


    /*
        URL MUITO LONGA
    */

    if (valor.length > 120) {

        adicionar(

            10,

            "URL muito longa",

            `A URL possui ${valor.length} caracteres.
            Endereços muito extensos podem dificultar
            a identificação do domínio real.`

        );

    }


    /*
        SUBDOMÍNIOS
    */

    const partesHost =
        host.split(".").filter(Boolean);


    const subdominios =
        Math.max(0, partesHost.length - 2);


    if (subdominios >= 3) {

        adicionar(

            15,

            "Muitos subdomínios",

            `Foram encontrados aproximadamente ${subdominios} subdomínios.`
            

        );

    }


    /*
        @
    */

    if (valor.includes("@")) {

        adicionar(

            20,

            "Símbolo @ encontrado",

            "O símbolo @ pode tornar a leitura do endereço enganosa."

        );

    }


    /*
        HÍFENS
    */

    const quantidadeHifens =
        (host.match(/-/g) || []).length;


    if (quantidadeHifens >= 3) {

        adicionar(

            8,

            "Muitos hífens no domínio",

            `O domínio possui ${quantidadeHifens} hífens.`

        );

    }


    /*
        TERMOS SUSPEITOS
    */

    const encontrados =
        termosSuspeitos.filter(
            termo => urlCompleta.includes(termo)
        );


    if (encontrados.length > 0) {

        adicionar(

            10,

            "Termos associados a autenticação",

            "Encontrados: " +
            encontrados.slice(0, 5).join(", ")+
                    ". Essas palavras estão relacionadas ao acesso ou à verificação de contas."
        );

    }


    /*
        CARACTERES CODIFICADOS
    */

    const codificados =
        valor.match(/%[0-9a-f]{2}/gi) || [];


    if (codificados.length >= 4) {

        adicionar(

            10,

            "Muitos caracteres codificados",

            `Foram encontrados ${codificados.length} caracteres codificados.`

        );

    }


    /*
        CARACTERES ESTRANHOS
    */

    const especiais =
        valor.match(/[<>{}|\\^`]/g) || [];


    if (especiais.length > 0) {

        adicionar(

            15,

            "Caracteres incomuns",

            "A URL contém caracteres que podem dificultar sua interpretação."

        );

    }


    /*
        MUITOS PARÂMETROS
    */

    const quantidadeParametros =
        [...url.searchParams.keys()].length;


    if (quantidadeParametros >= 6) {

        adicionar(

            7,

            "Muitos parâmetros",

            `A URL possui ${quantidadeParametros} parâmetros.`

        );

    }


    /*
        ENCURTADOR
    */

    if (encurtadores.includes(host)) {

        adicionar(

            15,

            "URL encurtada",

            "O domínio pertence a um serviço de encurtamento de URLs."

        );

    }


    /*
        PUNYCODE
    */

    if (host.includes("xn--")) {

        adicionar(

            15,

            "Domínio em Punycode",

            "O domínio utiliza representação Punycode."

        );

    }


    /*
        PORTA DIFERENTE
    */

    if (
        url.port &&
        url.port !== "80" &&
        url.port !== "443"
    ) {

        adicionar(

            8,

            "Porta não padrão",

            `A URL utiliza a porta ${url.port}.`

        );

    }


    /*
        LIMITAR SCORE
    */

    pontos =
        Math.min(pontos, 100);


    /*
        SE NENHUM INDICADOR FOI ENCONTRADO
    */

    if (lista.length === 0) {

        lista.push({

            pontos: 0,

            titulo:
                "Nenhum indicador relevante encontrado",

            descricao:
                "As regras atuais não encontraram sinais estruturais relevantes."

        });

    }


    return {

        pontos,

        classificacao:
            classificar(pontos),

        indicadores:
            lista,

        detalhes: {

            "Protocolo":
                url.protocol.replace(":", "").toUpperCase(),

            "Domínio":
                host,

            "Comprimento":
                valor.length + " caracteres",

            "Subdomínios":
                subdominios,

            "Parâmetros":
                quantidadeParametros,

            "Caminho":
                caminho || "/"

        }

    };

}


/*
    MOSTRAR RESULTADO
*/

function mostrarResultado(dados) {

    resultado.classList.remove("escondido");


    pontuacao.textContent =
        dados.pontos;


    barra.style.width =
        dados.pontos + "%";


    barra.style.background =
        dados.classificacao.cor;


    nivel.textContent =
        dados.classificacao.nivel;


    nivel.style.color =
        dados.classificacao.cor;


    titulo.textContent =
        dados.classificacao.titulo;


    resumo.textContent =
        dados.classificacao.resumo;


    recomendacao.textContent =
        dados.classificacao.recomendacao;


    icone.textContent =
        dados.classificacao.icone;


    icone.style.background =
        dados.classificacao.cor + "20";


    /*
        INDICADORES
    */

    indicadores.innerHTML = "";


    dados.indicadores.forEach(indicador => {

        const elemento =
            document.createElement("div");


        elemento.className =
            "indicador";


        elemento.innerHTML = `

            <div>
                ⚠️
            </div>

            <div>

                <strong>
                    ${indicador.titulo}
                </strong>

                <span>
                    ${indicador.descricao}
                </span>

            </div>

            ${
                indicador.pontos > 0

                ?

                `<span class="pontos">
                    +${indicador.pontos}
                </span>`

                :

                ""

            }

        `;


        indicadores.appendChild(elemento);

    });


    /*
        DETALHES
    */

    detalhes.innerHTML = "";


    Object.entries(
        dados.detalhes
    ).forEach(([chave, valor]) => {

        const elemento =
            document.createElement("div");


        elemento.className =
            "detalhe";


        elemento.innerHTML = `

            <span>
                ${chave}
            </span>

            <strong>
                ${valor}
            </strong>

        `;


        detalhes.appendChild(elemento);

    });


    /*
        IR ATÉ O RESULTADO
    */

    resultado.scrollIntoView({

        behavior: "smooth",

        block: "start"

    });

}


/*
    HISTÓRICO
*/

function salvarHistorico(dados) {

    let historico =
        JSON.parse(
            localStorage.getItem(
                "phishguard"
            ) || "[]"
        );


    historico.unshift({

        url: campoURL.value,

        pontos: dados.pontos,

        nivel:
            dados.classificacao.nivel,

        icone:
            dados.classificacao.icone,

        data:
            new Date().toLocaleString("pt-BR")

    });


    historico =
        historico.slice(0, 10);


    localStorage.setItem(

        "phishguard",

        JSON.stringify(historico)

    );


    mostrarHistorico();

}


/*
    MOSTRAR HISTÓRICO
*/

function mostrarHistorico() {

    const historico =
        JSON.parse(
            localStorage.getItem(
                "phishguard"
            ) || "[]"
        );


    if (historico.length === 0) {

        historicoLista.innerHTML = `

            <div class="vazio">

                Nenhuma análise realizada ainda.

            </div>

        `;

        return;

    }


    historicoLista.innerHTML = "";


    historico.forEach(item => {

        const elemento =
            document.createElement("div");


        elemento.className =
            "historico-item";


        let cor;


        if (item.pontos < 30) {

            cor = "#35c88a";

        } else if (item.pontos < 60) {

            cor = "#f2bb55";

        } else {

            cor = "#ff6b7a";

        }


        elemento.innerHTML = `

            <div>
                ${item.icone}
            </div>

            <div>

                <div
                    class="historico-url"
                    title="${item.url}"
                >

                    ${item.url}

                </div>

                <div class="historico-data">

                    ${item.nivel}
                    •
                    ${item.data}

                </div>

            </div>

            <strong style="color:${cor}">

                ${item.pontos}

            </strong>

        `;


        historicoLista.appendChild(elemento);

    });

}


/*
    FORMULÁRIO
*/

formulario.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        erro.textContent = "";


        try {

            const dados =
                analisarURL(
                    campoURL.value
                );


            mostrarResultado(dados);


            salvarHistorico(dados);


        } catch (error) {

            erro.textContent =
                error.message;

        }

    }
);


/*
    BOTÃO LIMPAR
*/

document
    .getElementById("limpar")
    .addEventListener(
        "click",
        function() {

            campoURL.value = "";

            erro.textContent = "";

            campoURL.focus();

        }
    );


/*
    APAGAR HISTÓRICO
*/

document
    .getElementById("limparHistorico")
    .addEventListener(
        "click",
        function() {

            localStorage.removeItem(
                "phishguard"
            );

            mostrarHistorico();

        }
    );


/*
    BOTÕES DE TESTE
*/

document
    .querySelectorAll(".teste")
    .forEach(botao => {

        botao.addEventListener(
            "click",
            function() {

                campoURL.value =
                    this.dataset.url;


                formulario.requestSubmit();

            }
        );

    });


/*
    CARREGAR HISTÓRICO
    QUANDO O SITE ABRIR
*/

mostrarHistorico();