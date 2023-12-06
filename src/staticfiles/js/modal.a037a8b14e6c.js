
$(document).ready(function () {
	/* 
	<<< Écouteurs >>>
	*/

	// Écouteurs pour la modale des images
	$("#openModalPictureButton").on("click", function () {
		openModal("#ModalPicture");
	});
	$("#closeModalPictureButton").on("click", function () {
		closeModal("#ModalPicture");
	});

	// Écouteurs pour la modale ajoutée par HTMX
	$(document).on("htmx:afterSwap", function (e) {
		if ($(e.target).is("#dialog")) {
			openModal("#modal");
		}
	});


	/* 
	<<< Function ouvrir/fermer modale >>>
	*/

	// Fonction pour fermer une modale spécifique
	function closeModal(modalId) {
		$(modalId).addClass("hidden").removeClass("flex");
		$("body").removeClass("overflow-hidden");
	}

	// Ferme la modale des images si on clique sur le fond flouté
	$("#ModalPicture .bg-black").on("click", function (e) {
		if (e.target === this) {
			closeModal("#ModalPicture");
		}
	});




	// Fonction pour ouvrir une modale spécifique
	function openModal(modalId) {
		$(modalId).removeClass("hidden").addClass("flex");
		$("body").addClass("overflow-hidden");
	}




	$(document).on('click', '#cancelButton', function () {
		closeModal("#modal");
	});

	// Après la récupération du back, on ferme la fenêtre
	$(document).on("htmx:beforeSwap", function (e) {
		var details = e.originalEvent.detail;
		if (details.target.id === "dialog" && !details.xhr.response) {
			closeModal("#modal");
			details.shouldSwap = false; // Annuler le swap HTMX
		}
	});

	// Fermeture de la modale avec HTMX
	$(document).on('click', '#close-modal', function () {
		closeModal("#modal");
	});

	// Ferme la modale si on clique sur le fond noir
	$(document).on('click', '.bg-black', function (e) {
		if (e.target !== this) {
			return;
		}
		closeModal("#modal");
	});


});
