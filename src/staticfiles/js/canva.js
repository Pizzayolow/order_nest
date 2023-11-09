$(document).ready(function() {
    paper.setup($('#drawZone')[0]);

    let background = new paper.Path.Rectangle({
    point: [0, 0],
    size: [paper.view.size.width, paper.view.size.height],
    fillColor: 'white'
    });
    background.sendToBack();


    let tool = new paper.Tool();
    let path;
    let eraserMode = false;
    let eraserWidth = 20;
    let pencilWidth = 2;
    const eraserImg = document.getElementById('eraserImg');
    const eraserImgUrl = eraserImg.src;
    const eraserActiveImgUrl = eraserImg.getAttribute('data-active-src');

    tool.onMouseDown = function(event) {
        path = new paper.Path();
        path.strokeColor = eraserMode ? 'white' : 'black';
        path.strokeWidth = eraserMode ? eraserWidth : pencilWidth;
        path.add(event.point);
    }

    tool.onMouseDrag = function(event) {
        path.add(event.point);
    }


    // Ecouteur bouton Gomme
    $("#bt_whitePaint").click(
        function toggleEraser() {
            eraserMode = !eraserMode;
            if (eraserMode) {
                $('#drawZone').css('cursor', `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><circle cx='20' cy='20' r='10' stroke='red' stroke-width='2' fill='none' /></svg>") 20 20, auto`);
                $("#bt_whitePaint img").attr("src", eraserActiveImgUrl);
            } else {
                $('#drawZone').css('cursor', 'auto');
                    $("#bt_whitePaint img").attr("src", eraserImgUrl);
            }
        });

    // Ecouteur bouton Effacer
    $("#bt_eraseDrawing").click(eraseDrawing);

    // Ecouteur bouton Sauvegarder
    $("#bt_saveDrawing").click(saveCanvas);

    // Ecouteur bouton Supprimer
    $(".delete_canvas").click(deleteCanvas);

    // Ecouteur bouton Modifier
    $(".edit_canvas").click(editCanvas);

});





function loadCanvas(jsonData) {
    paper.project.clear(); // Efface le dessin actuel
    paper.project.importJSON(jsonData); // Charge le dessin depuis le JSON
}

// Function qui permet de modifier le dessin
async function editCanvas() {
    const idOrder = $("#orderPk").val();
    let canvasId = $(this).data("pk");
    const canvas = await getCanvas(idOrder);
    let parsedCanvas = JSON.parse(canvas);
    let json_file = parsedCanvas["json_file"]

    loadCanvas(json_file);
    deleteCanvas(canvasId);

}

// Function qui permet de récupére les dessins de la commande
function getCanvas(idOrder) {
    return fetch(`/get_canvas/${idOrder}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur réseau ou réponse avec statut échoué.');
            }
            return response.text();
        })
        .catch(error => {
            console.error("Il y a eu un problème avec l'opération fetch:", error);
        });
}

// Function qui nettoie la zone de dessin
function eraseDrawing() {
    var canvas = $('#drawZone')[0];
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    paper.project.clear();
}

// Function qui supprime le dessin
function deleteCanvas(idOrder) {
        const csrfToken = $("[name=csrfmiddlewaretoken]").val();
        let canvasId = $(this).data("pk");

        if (!canvasId) {
            canvasId = idOrder;
        }

        fetch(`/delete_canvas/${canvasId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': csrfToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    canvas_id: canvasId
                })
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error('Erreur réseau ou réponse avec statut échoué: ' + text);
                    });
                }
                return response.text();
            })
            .then(data => {
                $(".delete_canvas").closest('li').remove();
                $('#drawError').text("");
                $('#drawError').removeClass();
            })
            .catch(error => {
                console.error("Il y a eu un problème avec l'opération fetch:", error);
            })
};

// Function qui sauvegarde le dessin
async function saveCanvas() {
        const idOrder = $("#orderPk").val();
        confirm_attachement = await getCanvas(idOrder)

        if (confirm_attachement !== 'False') {
            $('#drawError').text("Une seule image autorisée.");
            $('#drawError').addClass('text-red-700 bg-red-100 border border-red-600 p-2 rounded inline-block');
        }

        else {
            const canvas = $('#drawZone')[0];
            const dataURL = canvas.toDataURL();
            const csrfToken = $("[name=csrfmiddlewaretoken]").val();

            const canvasName = $("#canvasList");
            const drawingData = paper.project.exportJSON();


            fetch("/save_canvas/", {
                    method: "POST",
                    headers: {
                        'X-CSRFToken': csrfToken,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        img: dataURL,
                        order_id: idOrder,
                        drawingData : drawingData,
                    })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erreur réseau ou réponse avec statut échoué.');
                    }
                    return response.text();
                })
                .then(file => {
                    eraseDrawing();
                    location.reload();
                })
                .catch(error => {
                    console.error("Il y a eu un problème avec l'opération fetch:", error);
                });
            }
};

