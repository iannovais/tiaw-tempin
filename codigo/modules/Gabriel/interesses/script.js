function criarBotao() {
    fetch('db.json')
        .then(function (response) { return response.json(); })
        .then(function (db) {
            let textoHTML = '';
            let index=0
            db.interesses.map(e =>{
                textoHTML +=
                    `<div class="interesses">
                        <input type="checkbox" class="btn-check" id="btncheck${index}" autocomplete="off">
                        <label class="btn btn-outline-danger" for="btncheck${index}">${e.interesse}</label>
                    </div>`;
                    index++
            })
            document.getElementById('botoes').innerHTML = textoHTML;
        })
}

document.getElementById('botoes').addEventListener('click', function(event) {
    if (event.target.tagName === 'LABEL') {
        event.target.classList.toggle('clicked');
    }
});