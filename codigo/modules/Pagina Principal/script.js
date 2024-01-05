document.addEventListener("DOMContentLoaded", function () {
    const usuarioCorrenteJSON = sessionStorage.getItem('usuarioCorrente');
    const usuarioCorrente = JSON.parse(usuarioCorrenteJSON);

    if (usuarioCorrente) {
        updateNavbar(usuarioCorrente);
    } else {
        console.error("Usuário não encontrado.");
    }
});

function updateNavbar(usuarioCorrente) {
    const userNameElement = document.getElementById("user-name");
    const userPhotoElement = document.getElementById("user-photo");

    if (usuarioCorrente && usuarioCorrente.nome) {
        userNameElement.textContent = usuarioCorrente.nome;
    } else {
        console.error("Campo 'nome' não encontrado nos dados do usuário.");
    }

    const imagemPadrao = `https://robohash.org/${userNameElement.textContent}`;

    userPhotoElement.src = usuarioCorrente && usuarioCorrente.foto ? usuarioCorrente.foto : imagemPadrao;
}
