$(document).ready(function () {
	$("#photoCaptureInput").on("change", function (event) {
		const file = event.target.files[0];
		let formData = new FormData();
		formData.append("img", file);
		const idOrder = $("#orderPk").val();
		formData.append("orderId", idOrder);
		const csrfToken = $("[name=csrfmiddlewaretoken]").val();

		if (file) {
			console.log("file lors de la selection:" , file),
			fetch(`/save_pictures/`, {
				method: 'POST',
				headers: {
					'X-CSRFToken': csrfToken
				},
				body: formData
			})
				.then(response => {
					if (!response.ok) {
						throw new Error('Erreur réseau ou réponse avec statut échoué.');
					}
					return response.json()
				})
				.then(file => {
					console.log("recu du serveur : ", file.filename.name)
					$("#pictureList").append(`
						<li>
							<a href="${file.filename.url}">
								${file.filename.name}
							</a>
						</li>
					`);

				})
				.catch(error => {
					console.error("Il y a eu un problème avec l'opération fetch:", error);
				});
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
