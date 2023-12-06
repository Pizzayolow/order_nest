$(function() {
    $("#id_last_name").autocomplete({
        source: "/get_clients/",
        minLength: 2,
        open: function() {

            $(".ui-autocomplete").addClass(
                "absolute top-full left-0 z-[1000] min-w-[200px] max-w-[300px] " +
                "py-2 border border-gray-300 rounded-lg shadow-lg bg-white"
            );

            $(".ui-menu-item").addClass("w-full");

            $(".ui-menu-item-wrapper").addClass(
                "w-full text-lg text-gray-900 py-2 px-4 " +
                "hover:bg-gray-200 hover:text-black cursor-pointer"
            );

            $(".ui-autocomplete").css("width", "220px");

            $(".ui-helper-hidden-accessible").remove();

        },
        select: function(event, ui) {
            $('#id_first_name').val(ui.item.first_name);
            $('#id_last_name').val(ui.item.last_name);
            $('#id_phone_number').val(ui.item.phone_number);
            $('#id_address').val(ui.item.address);
			$('#id_mail').val(ui.item.mail);	
			$('#id_customer').val(ui.item.id);
			
            return false;
        },
		response: function (event, ui) {
			if (ui.content.length === 0) {
                ui.content.push({ label: "Aucun résultat trouvé", value: "" });
            }
        }
	});
	
	$('#resetButton').click(function() {
		$('form').each(function() {
		  this.reset();
		});
	  });
});
