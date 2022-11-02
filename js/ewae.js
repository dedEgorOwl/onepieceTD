document.getElementById("id_of_textbox")
.addEventListener("keyup", function(event) {
event.preventDefault();
if (event.keyCode === 13) {
		document.getElementById("id_of_button").click();
}
});

$("#id_of_textbox").keyup(function(event) {
	if (event.keyCode === 13) {
			$("#id_of_button").click();
	}
});