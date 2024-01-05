document.addEventListener('DOMContentLoaded', () => {
    const atividadeContainer = document.getElementById("divCards");

    if (!atividadeContainer) {
        displayMessage("Elemento 'divCards' não encontrado.");
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const atividadeId = urlParams.get('id');

    const generoEmojis = {
        Lazer: "⚽️",
        Estudo: "📚",
        Show: "🎤",
        Música: "🎶",
        Filmes: "🍿",
    };

    fetch(`https://9f3bfd58-98f7-41d3-a018-cb47aabfebeb-00-1w0c2ojratvdy.global.replit.dev/atividades/${atividadeId}`)
        .then((response) => response.json())
        .then((atividade) => {
            if (!atividade) {
                displayMessage("Resposta da API inválida.");
                return;
            }

            if (atividade.categoria.toLowerCase() === "virtual") {
                atividadeContainer.innerHTML = `
                    <div class="atividade-body">

                        <p class="atividade-titulo">${atividade.nome}</p>
                        <p class="atividade-endereco"><b>Link</b><br><a href="${atividade.endereco}" target="_blank">${atividade.endereco}</a></p>
                        <p class="atividade-categoria"><b>Categoria</b><br>${atividade.categoria}</p>
                        <p class="atividade-orcamento"><b>Orçamento</b><br>R$ ${parseFloat(atividade.orcamento.replace(',', '.'))}</p>
                    </div>`;
            } else {
                atividadeContainer.innerHTML = `
                    <div class="atividade-body">

                        <p class="atividade-titulo">${atividade.nome}</p>
                        <div class="atividade-info">
                            <div class="info-left">
                                <p class="atividade-endereco"><b>Endereço</b><br>${atividade.endereco}</p>
                                <p class="atividade-categoria"><b>Categoria</b><br>${atividade.categoria}</p>
                                <p class="atividade-orcamento"><b>Orçamento</b><br>R$ ${parseFloat(atividade.orcamento.replace(',', '.'))}</p>
                            </div>
                            <div class="info-right">
                                <div id="map" style="height: 400px;"></div>
                                <br>
                                <button id="tracar-rota-btn" class="btn btn-primary"><i class="far fa-map"></i> Traçar Rota</button>
                            </div>
                        </div>
                    </div>`;

                initMap(atividade.endereco, atividade.nome);

                const tracarRotaBtn = document.getElementById("tracar-rota-btn");
                tracarRotaBtn.addEventListener("click", () => {
                    obterLocalizacaoUsuario((posicaoUsuario) => {
                        tracarRota(atividade.endereco, posicaoUsuario);
                    });
                });
            }
        })
        .catch((error) => {
            console.error("Erro na solicitação da API:", error);
        });
});

function initMap(endereco, nome) {
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
    });

    var geocoder = new google.maps.Geocoder();

    geocoder.geocode({ 'address': endereco }, function (results, status) {
        if (status === 'OK' && results.length > 0) {
            var location = results[0].geometry.location;

            map.setCenter(location);

            var marker = new google.maps.Marker({
                map: map,
                position: location,
                title: nome,
            });

            var infowindow = new google.maps.InfoWindow({
                content: nome,
            });

            marker.addListener('click', function () {
                infowindow.open(map, marker);
            });
        } else {
            console.error('Erro ao geocodificar o endereço:', status, results);
            displayMessage("Erro ao carregar o mapa. Endereço inválido.");
        }
    });
}

function obterLocalizacaoUsuario(callback) {
    const options = {
        enableHighAccuracy: true,
        timeout: 10000,  
        maximumAge: 0 
    };

    if (navigator.geolocation) {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
            if (result.state === 'granted') {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const posicaoUsuario = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        };
                        callback(posicaoUsuario);
                    },
                    (error) => {
                        displayMessage(`Erro ao obter localização: ${error.message}`);
                    },
                    options
                );
            } else if (result.state === 'prompt') {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const posicaoUsuario = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        };
                        callback(posicaoUsuario);
                    },
                    (error) => {
                        displayMessage(`Erro ao obter localização: ${error.message}`);
                    },
                    options
                );
            } else if (result.state === 'denied') {
                displayMessage('Permissão de geolocalização negada pelo usuário.');
            }
        });
    } else {
        displayMessage('Geolocalização não suportada pelo navegador.');
    }
}

function tracarRota(destino, posicaoUsuario) {
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();

    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: posicaoUsuario,
    });

    directionsRenderer.setMap(map);

    const request = {
        origin: posicaoUsuario,
        destination: destino,
        travelMode: google.maps.TravelMode.DRIVING,
    };

    directionsService.route(request, (result, status) => {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
        } else {
            displayMessage("Não foi possível traçar a rota.");
        }
    });
}

function displayMessage(message) {
    console.error(message);
}
