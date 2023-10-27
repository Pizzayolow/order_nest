$(document).ready(function() {
    paper.setup($('#drawZone')[0]);
    let tool = new paper.Tool();
    let path;

    tool.onMouseDown = function(event) {
        path = new paper.Path();
        path.strokeColor = 'black';
        path.add(event.point);
    }

    tool.onMouseDrag = function(event) {
        path.add(event.point);
    }

    // Ecouteur bouton Effacer
    $("#bt_eraseDrawing").click(eraseDrawing);

    // Ecouteur bouton Sauvegarder
    $("#bt_saveDrawing").click(saveCanvas);

    // Ecouteur bouton Supprimer
    $(".delete_canvas").click(deleteCanvas);

});

// Function qui nettoie la zone de dessin
function eraseDrawing() {
    var canvas = $('#drawZone')[0];
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    paper.project.clear();
}

// function qui supprime le dessin
function deleteCanvas() {
        const csrfToken = $("[name=csrfmiddlewaretoken]").val();
        const canvasId = $(this).data("pk");
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


function saveCanvas() {
        if ($(".attachment_pk").length > 0) {
            $('#drawError').text("Une seule image autorisée.");
            $('#drawError').addClass('text-red-700 bg-red-100 border border-red-600 p-2 rounded inline-block');
        }

        else {
            const canvas = $('#drawZone')[0];
            const dataURL = canvas.toDataURL();
            const csrfToken = $("[name=csrfmiddlewaretoken]").val();
            const idOrder = $("#orderPk").val();
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