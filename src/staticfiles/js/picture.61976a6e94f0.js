$(document).ready(function () {
	$("#photoCaptureInput").on("change", async function (event) {
		const file = event.target.files[0];
		if (!file) {
			return; // Gestion de l'absence de fichier
		}

		let formData = new FormData();
		formData.append("img", file);
		const idOrder = $("#orderPk").val();
		formData.append("orderId", idOrder);
		const csrfToken = $("[name=csrfmiddlewaretoken]").val();

		try {
			const response = await fetch(`/save_pictures/`, {
				method: 'POST',
				headers: {
					'X-CSRFToken': csrfToken
				},
				body: formData
			});

			if (!response.ok) {
				const errorResponse = await response.json();
				let errorMessage = 'Erreur lors du traitement de la requête.';
				if (errorResponse && errorResponse.message) {
					errorMessage = errorResponse.message;
				}
				console.log("toto");
				$("#pictureError").text(errorMessage);
				$("#pictureError").addClass('text-red-700 bg-red-100 border border-red-600 p-2 rounded inline-block');
				throw new Error('Erreur réseau ou réponse avec statut échoué.');
			}
			const result = await response.json();
			$('#pictureError').removeClass();
			$("#pictureError").text('Le fichier a bien été envoyé !');
			$("#pictureError").addClass('text-lime-700 bg-lime-100 border border-lime-500 p-2 rounded inline-block');
			$("#pictureList").append(`
				<li>
					<a href="${result.filename.url}">
						${result.filename.name}
					</a>
				</li>
			`);
		} catch (error) {
			console.error("Il y a eu un problème avec l'opération fetch:", error);
		}
	});

	// Ecouteur bouton Supprimer
	$(".delete_picture").click(deletePicture);
});



// Function qui supprime la photo
function deletePicture(idOrder) {
	const csrfToken = $("[name=csrfmiddlewaretoken]").val();
	let pictureId = $(this).data("pk");

	if (!pictureId) {
		pictureId = idOrder;
	}

	fetch(`/delete_picture/${pictureId}`, {
		method: 'DELETE',
		headers: {
			'X-CSRFToken': csrfToken,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			picture_id: pictureId
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
			location.reload();
		})
		.catch(error => {
			console.error("Il y a eu un problème avec l'opération fetch:", error);
		})
};
