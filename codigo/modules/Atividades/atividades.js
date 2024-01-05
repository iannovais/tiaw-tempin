document.addEventListener("DOMContentLoaded", function () {
    const reverseDefaultOption = dropdownContent.querySelector("[data-value=reverseDefault]");
    const defaultOption = dropdownContent.querySelector("[data-value=default]");

    reverseDefaultOption.classList.add("active");
    defaultOption.classList.remove("active");

    buscarAtividades("", "reverseDefault");
});

const apiUrl = "https://9f3bfd58-98f7-41d3-a018-cb47aabfebeb-00-1w0c2ojratvdy.global.replit.dev/atividades";
const personagensApiUrl = "https://1a173742-38b7-42e1-8ff3-1886f2973da5-00-1m2rzaxengebl.worf.replit.dev/atividades";
const termoPesquisa = document.getElementById("termo_pesquisa");
const cardContainer = document.getElementById("card-container");
const dropdownContent = document.querySelector(".dropdown-content");
const dropdownButton = document.querySelector(".dropbtn");
const dropdown = document.querySelector(".dropdown");

let isDropdownOpen = false;
let hoverEnabled = true;
let atividades = [];
let atividadesFavoritas = {};

const storedFavoritas = localStorage.getItem("atividadesFavoritas");
if (storedFavoritas) {
    atividadesFavoritas = JSON.parse(storedFavoritas);
}

function closeDropdown() {
    isDropdownOpen = false;
    dropdownContent.style.display = "none";
}

function toggleDropdown() {
    if (isDropdownOpen) {
        closeDropdown();
    } else {
        isDropdownOpen = true;
        dropdownContent.style.display = "block";
    }
}

buscarAtividades("", "reverseDefault");

termoPesquisa.addEventListener("input", function () {
    const termo = termoPesquisa.value;
    const filtro = dropdownContent.querySelector(".active").dataset.value;
    buscarAtividades(termo, filtro);
});

dropdownButton.addEventListener("click", function (event) {
    toggleDropdown();
    event.stopPropagation();
});

document.addEventListener("click", function (event) {
    closeDropdown();
});

dropdownContent.addEventListener("click", function (event) {
    if (event.target.tagName === "A") {
        const termo = termoPesquisa.value;
        const filtro = event.target.dataset.value;
        buscarAtividades(termo, filtro);

        const activeItem = dropdownContent.querySelector(".active");
        if (activeItem) {
            activeItem.classList.remove("active");
        }
        event.target.classList.add("active");
        closeDropdown();
    }
});

function openDropdown() {
    isDropdownOpen = true;
    dropdownContent.style.display = "block";
}

dropdown.addEventListener("mouseenter", function () {
    if (!isDropdownOpen) {
        openDropdown();
    }
    dropdown.removeEventListener("mouseenter", openDropdown);
});

dropdown.addEventListener("mouseleave", function () {
    closeDropdown();
});

function buscarAtividades(termo, filtro) {
    termo = termo.toLowerCase();

    fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
            atividades = data;

            if (filtro === "alphabetical") {
                data.sort((a, b) => a.nome.localeCompare(b.nome));
            } else if (filtro === "reverseAlphabetical") {
                data.sort((a, b) => b.nome.localeCompare(a.nome));
            } else if (filtro === "reverseDefault") {
                data.reverse();
            }

            const atividadesFiltradas = data.filter((atividade) => {
                return (
                    atividade.genero.toLowerCase().includes(termo) ||
                    atividade.nome.toLowerCase().includes(termo) ||
                    atividade.orcamento.includes(termo) ||
                    atividade.endereco.toLowerCase().includes(termo) ||
                    atividade.categoria.toLowerCase().includes(termo)
                );
            });

            exibirAtividadesFiltradas(atividadesFiltradas);
        })
        .catch((error) => {
            console.error("Erro na solicitação da API:", error);
        });
}

function exibirAtividadesFiltradas(atividades) {
    cardContainer.innerHTML = "";

    if (atividades.length === 0) {
        cardContainer.innerHTML = `
            <div class="error-message">
                <img src="https://img.freepik.com/premium-vector/illustration-leaking-bucket_74669-730.jpg" width="220"/>
                <p>Buscamos por toda parte. Infelizmente, <br>não encontramos nada.</p>
            </div>`;
    } else {
        atividades.forEach((atividade) => {
            const generoEmojis = {
                Lazer: "⚽️",
                Estudo: "📚",
                Show: "🎤",
                Música: "🎶",
                Filmes: "🍿",
            };

            const generoEmoji = generoEmojis[atividade.genero] || "🧾";
            const orcamento = parseFloat(atividade.orcamento);

            const cardElement = document.createElement("div");
            cardElement.classList.add("card");

            cardElement.innerHTML = `
                <div class="card-body">
                    <p class="card-genero">${generoEmoji} ${atividade.genero}${orcamento === 0 ? "⠀⠀🎫 Gratuita" : ""}</p>
                    <div class="card-header">
                        <p class="card-title">${atividade.nome}</p>
                        <i id="favorito-${atividade.id}" class="far fa-star favorito" onclick="adicionarFavorito(${atividade.id})"></i>
                    </div>
                    <p class="card-text">Orçamento: R$${atividade.orcamento}</p>
                    <p class="card-text">Categoria: ${atividade.categoria}</p>
                    <p class="card-entrar" id="acesse-atividade">Acesse a atividade ➔</p>
                </div>`;

            cardContainer.appendChild(cardElement);

            const acesseAtividadeElement = cardElement.querySelector("#acesse-atividade");
            acesseAtividadeElement.addEventListener("click", function () {
                window.location.href = `pagina_atividade.html?id=${atividade.id}`;
            });

            if (atividadesFavoritas[atividade.id]) {
                const iconeFavorito = cardElement.querySelector(".favorito");
                iconeFavorito.classList.remove("far");
                iconeFavorito.classList.add("fas");
                iconeFavorito.classList.add("azul");
            }
        });
    }
}

function adicionarFavorito(atividadeId) {
    const iconeFavorito = document.querySelector(`#favorito-${atividadeId}`);

    if (!atividadesFavoritas[atividadeId]) {
        atividadesFavoritas[atividadeId] = true;
        iconeFavorito.classList.remove("far");
        iconeFavorito.classList.add("fas");
        iconeFavorito.classList.add("azul");

        adicionarAtividadeAoJSON(atividadeId);
    } else {
        atividadesFavoritas[atividadeId] = false;
        iconeFavorito.classList.remove("fas");
        iconeFavorito.classList.add("far");
        iconeFavorito.classList.remove("azul");

        removerDoJSON(atividadeId);
    }

    localStorage.setItem("atividadesFavoritas", JSON.stringify(atividadesFavoritas));
}

function adicionarAtividadeAoJSON(atividadeId) {
    const atividadeSelecionada = atividades.find(atividade => atividade.id === atividadeId);

    fetch(personagensApiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            atividadeId: atividadeId,
            nome: atividadeSelecionada.nome,
            genero: atividadeSelecionada.genero,
            orcamento: atividadeSelecionada.orcamento,
            endereco: atividadeSelecionada.endereco,
            categoria: atividadeSelecionada.categoria
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log("Atividade adicionada ao JSON de personagens:", data);
        })
        .catch(error => {
            console.error("Erro ao adicionar a atividade ao JSON:", error);
        });
}

function removerDoJSON(atividadeId) {
    fetch(`${personagensApiUrl}/${atividadeId}`, {
        method: "DELETE"
    })
        .then(response => response.json())
        .then(data => {
            console.log("Atividade removida do JSON de personagens:", data);
        })
        .catch(error => {
            console.error("Erro ao remover a atividade do JSON:", error);
        });
}
