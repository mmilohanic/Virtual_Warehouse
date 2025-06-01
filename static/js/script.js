let original_table
if ($('skladiste'))
	original_table = $('skladiste').innerHTML
let artikli = []
let izmjenjeni_artikli = []
let izbrisani_artikli = []

function $ (id) {
  return document.getElementById(id)
}

// Funkcija za prikazivanje tooltipa na ikonama za preuzimanje, pregled, izmjenu i brisanje
function load_tooltips() {
	const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
	const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
}

// Event listener koji čeka da se učita sav HTML
document.addEventListener('DOMContentLoaded', function () {
	if ($('nema_artikala') && window.location.href.includes('filter'))
		$('nema_artikala').textContent = "Na skladištu ne postoji artikl koji zadovoljava unesene filtere."
	
	// Ako postoji varijabla artikli poslana od strane servera parsiraj ju iz JSON formata u JS objekt
	// Postavi event listenere na sve ikone za info, edit i delete
	if ($('artikli')) {
		artikli = JSON.parse($('artikli').textContent)
		load_info_button_listeners()
		load_delete_button_listeners()
		load_edit_button_listeners()
		load_tooltips()
	}

	if ($('filter_forma')) {
		$("filter_forma").addEventListener("submit", function(event) {
			event.preventDefault()

			for (let element of this.elements) {
				 if (element.value === "" || element.value === "Svi")
					element.removeAttribute("name")
			}
			
			this.submit()
		})
	}

	const form = $('forma')
	const modal = $('modal_form')

	// Event listener za reset polja forme pri izlasku iz prozora modala
	if (modal && form) {
		modal.addEventListener('hidden.bs.modal', function () {
			form.reset()
		})
	}
	
	// Event listener koji reagira na unos nule i negitvnih vrijdnosti u polja s numeričkim vrijednostima te ih ograničava
	document.querySelectorAll('input[type=number]').forEach(function(input) {
		input.addEventListener('input', function() {
			if (parseFloat(input.value) <= 0) {
			  input.setCustomValidity('Please enter a value greater than zero')
			}
			else {
			  input.setCustomValidity('')
			}
		})
	})

	// Event listener koji regira na submitanje forme
	if (form) {
		form.addEventListener('submit', function (event) {
			event.preventDefault()

			// Provjera jesu li sva polja popunjena
			if (!this.checkValidity()) {
				this.reportValidity()
				return
			}

			let form_data = new FormData(form)

			// Ako postoji tag po kojem se prosljeđuju artikli znači se nalazimo na index-u
			if ($('artikli')) {
				const artikl_index = parseInt($("modal_title").dataset.index)
				let artikl_data = artikli.filter(x => parseInt(x.id) === artikl_index)[0]
				
				// Parsiranje projčanih vrijednosti artikla zbod daljnje usporedbe podataka
				artikl_data.cijena = parseFloat(artikl_data.cijena)
				artikl_data.dostupna_kolicina = parseInt(artikl_data.dostupna_kolicina)
				artikl_data.minimalna_kolicina = parseInt(artikl_data.minimalna_kolicina)
				
				// Dohvaćanje podatakaa iz forme
				form_data = Object.fromEntries(form_data.entries())
				form_data.id = artikl_data.id
				form_data.cijena = parseFloat(form_data.cijena)
				form_data.dostupna_kolicina = parseInt(form_data.dostupna_kolicina)
				form_data.minimalna_kolicina = parseInt(form_data.minimalna_kolicina)
				
				if (form_data.dostupna_kolicina < form_data.minimalna_kolicina)
					alert("Količina artikla mora biti veća od minimalne količine!")
				else {
					// Usporedba podataka iz forme sa podacima artikla
					same_data = Object.keys(form_data).every(key => form_data[key] === artikl_data[key])
					
					if (!same_data) {
						$(String(artikl_index)).classList.add("table-warning")
						izmjenjeni_artikli.push(form_data)
					}
					else {
						$(String(artikl_index)).classList.remove("table-warning")
						izmjenjeni_artikli = izmjenjeni_artikli.filter(artikl => artikl.id !== form_data.id)
					}

					const modal = bootstrap.Modal.getOrCreateInstance($("modal_form"))
					modal.hide()

					izmjeni_prikaz ()
				}
			}
			// Inače znači da smo na unosu artikla
			else {
				// Dodavanje retka
				unosi = Object.fromEntries(form_data.entries())
				if (parseInt(unosi.dostupna_kolicina) <= parseInt(unosi.minimalna_kolicina))
					alert("Količina artikla mora biti veća od minimalne količine!")
				else {
					artikli.push(unosi)
					
					// Reset forme
					this.reset()

					if (artikli.length === 1)
						izmjeni_prikaz()

					generiraj_retke()
				}
			}
		})
	}
})


// Load info gumbova glavne tablice
function load_info_button_listeners () {
	document.querySelectorAll(".info_button").forEach(link => {
		link.addEventListener("click", (event) => {
			event.preventDefault() // Spriječava skok na vrh stranice

			// Dohvaćanje proslijeđenih podataka
			const artikl_index = parseInt(link.dataset.index)
			const artikl_data = artikli.filter(x => parseInt(x.id) === artikl_index)[0]
			
			// Popunjavanje info modala
			$("info_title").textContent = artikl_data.naziv
			$("info_body").innerHTML =
				`
				<div class="d-flex justify-content-between">
					<div style="min-width: 100px;"><strong>Opis:</strong></div>
					<div>${artikl_data.opis}</div>
				</div><hr />
				<div class="d-flex justify-content-between">
					<div><strong>Cijena:</strong></div>
					<div>${artikl_data.cijena}</div>
				</div><hr />
				<div class="d-flex justify-content-between">
					<div><strong>Dostupna količina:</strong></div>
					<div>${artikl_data.dostupna_kolicina}</div>
				</div><hr />
				<div class="d-flex justify-content-between">
					<div><strong>Minimalna količina:</strong></div>
					<div>${artikl_data.minimalna_kolicina}</div>
				</div><hr />
				<div class="d-flex justify-content-between">
					<div><strong>Datum dodavanja:</strong></div>
					<div>${artikl_data.datum_dodavanja}</div>
				</div><hr />
				<div class="d-flex justify-content-between">
					<div><strong>Datum zadnje izmjene:</strong></div>
					<div>${artikl_data.datum_izmjene}</div>
				</div>
				`
		
			const modal = bootstrap.Modal.getOrCreateInstance($("info_modal"))
			modal.show()
		})
	})
}

// Load edit gumbova glavne tablice
function load_edit_button_listeners () {
	document.querySelectorAll(".edit_button").forEach(link => {
		link.addEventListener("click", (event) => {
			event.preventDefault() // Spriječava skok na vrh stranice

			// Dohvaćanje proslijeđenih podataka
			const artikl_index = parseInt(link.dataset.index)
			let artikl_data = {}
			let vec_izmjenjen = Object.values(izmjenjeni_artikli.filter(artikl => parseInt(artikl.id) === artikl_index))

			// Provjera ako je artikl već bio izmjenjen, ako nije uzima se originalna vrijednost
			if (vec_izmjenjen.length)
				artikl_data = vec_izmjenjen[0]
			else
				artikl_data = artikli.filter(x => parseInt(x.id) === artikl_index)[0]
				
			$("modal_title").textContent = "Uredi podatke"
			
			// Pohranjivanje indexa u data-index atribut
			$("modal_title").dataset.index = artikl_index

			// Popunjavanje forme s postojećim vrijdnostima
			$('naziv').value = artikl_data.naziv
			$('opis').value = artikl_data.opis
			$('cijena').value = artikl_data.cijena
			$('dostupna_kolicina').value = artikl_data.dostupna_kolicina
			$('minimalna_kolicina').value = artikl_data.minimalna_kolicina

			$('submit').value = "Potvrdi promjene"
			
			let modal = bootstrap.Modal.getOrCreateInstance($("modal_form"))
			modal.show()
		})
	})
}

// Load delete gumbova glavne tablice
function load_delete_button_listeners () {
	document.querySelectorAll(".delete_button").forEach(link => {
		link.addEventListener("click", (event) => {
			event.preventDefault() // Spriječava skok na vrh stranice

			// Dohvaćanje elementa za brisanje i njegovog tooltipa
			const artikl_index = parseInt(link.dataset.index)
			const tooltip_element = $(artikl_index).querySelector('.delete_button i')

			// Sakrivanje tooltipa prije brisanja kako nebi ostao 'freezan' na ekranu kad element nestane
			bootstrap.Tooltip.getInstance(tooltip_element).hide()

			// Brisanje elementa i dodavanje istog na listu za brisanje
			$(artikl_index).remove()
			izbrisani_artikli.push(artikli.filter(x => parseInt(x.id) === artikl_index)[0])

			izmjeni_prikaz()
		})
	})
}

// Prikaz/skrivanje gumbova ovisno o izmjenama
function izmjeni_prikaz () {
	if ($('artikli')) {
		if (izbrisani_artikli.length === 1 || izmjenjeni_artikli.length === 1) {
			$("spremi").style.display = "inline-block"
			$("ponisti").style.display = "inline-block"
			$("download").style.display = "none"
			$("filtriraj").style.display = "none"
			$("sortiraj").style.display = "none"
		}
		else if (!izbrisani_artikli.length && !izmjenjeni_artikli.length) {
			$("spremi").style.display = "none"
			$("ponisti").style.display = "none"
			$("download").style.display = "inline-flex"
			$("filtriraj").style.display = "inline-block"
			$("sortiraj").style.display = "inline-block"
		}

	}
	else {
		const table = $('tablica')
		const tbody = table.querySelector('tbody')

		if (tbody && artikli.length) {
			$("spremi").style.display = "inline-block"
			$("prazno").style.setProperty("display", "none", "important")
		}
		else {
			$("spremi").style.display = "none"
			$("prazno").style.setProperty("display", "flex")
		}
	}
}

// Reset izgleda glavne tablice
function reset_tablice () {
	$('skladiste').innerHTML = original_table
	izbrisani_artikli = []
	izmjenjeni_artikli = []
	load_tooltips()
	load_delete_button_listeners()
	load_edit_button_listeners()
	load_info_button_listeners()
	izmjeni_prikaz()
}

// Generiranje redaka tablice za unos artikala
function generiraj_retke () {
  	let rows = ""
  	for (let unos in artikli) {
  	  	rows +=	`<tr">
  					<td class="align-middle" scope="row">${parseInt(unos) + 1}</td>
  	  		    	<td class="align-middle">${artikli[unos].naziv}</td>
  	  		    	<td class="align-middle">${artikli[unos].opis}</td>
  	  		    	<td class="align-middle">${artikli[unos].cijena}</td>
  	  		    	<td class="align-middle">${artikli[unos].dostupna_kolicina}</td>
  	  		    	<td class="align-middle">${artikli[unos].minimalna_kolicina}</td>
  	  		    	<td class="align-middle text-center">
  	  		    		<button class="btn" onclick="izbrisi_redak(${unos})" title="Izbriši"><i class="bi bi-trash text-danger"></i></button>
  	  		    	</td>
  	            </tr>
  	            `
  	}
  	$("unosi").innerHTML = rows
}

// Brisanje redaka tablice za unos artikala
function izbrisi_redak (idx) {
	artikli.splice(parseInt(idx), 1)
	generiraj_retke()
	izmjeni_prikaz()
}

// Funkcija za slanje CRUD operacija serveru
function pohrani () {
	let data = {}
	let URL_route = ""
	if (window.location.href.endsWith('unos')) {
		data = artikli
		URL_route = window.location.href
		fetch(URL_route, {
			method: 'POST',
			headers: {
			'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		})
		.then(response => {
			window.location = response.url
		})
		.catch(error => {
			console.error('There was a problem with the Fetch operation:', error);
		})
		
	}
	if (izmjenjeni_artikli.length) {
		data = izmjenjeni_artikli
		URL_route = '/edit_or_delete'
		fetch(URL_route, {
			method: 'PUT',
			headers: {
			'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		})
		.then(response => {
			window.location = response.url
		})
		.catch(error => {
			console.error('There was a problem with the Fetch operation:', error);
		})
		
	}
	if (izbrisani_artikli.length) {
		data = izbrisani_artikli
		URL_route = '/edit_or_delete'
		fetch(URL_route, {
			method: 'DELETE',
			headers: {
			'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		})
		.then(response => {
			window.location = response.url
		})
		.catch(error => {
			console.error('There was a problem with the Fetch operation:', error);
		})
		
	}
}

function download () {
	data = artikli.map(artikl => artikl.id)
	URL_route = '/export'
	fetch(URL_route, {
		method: 'POST',
		headers: {
		'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	})
	.then(response => response.blob())  // Response u Blob format kako bi mogli raditi s Excel datotekom
	.then(blob => {
		const url = window.URL.createObjectURL(blob);  // Kreiranje privrmene poveznice za datoteku

		const download_link = document.createElement('a'); // Stvaranje privremenog link elementa
		download_link.style.display = 'none';
		download_link.href = url;
		download_link.download = 'popis_artikala.xlsx';  // Postavljanje imena Excel datoteke

		document.body.appendChild(download_link); // Dodavanje link elementa u DOM

		download_link.click(); // Pokretanje linka

		// Brisanje privremene poveznice i link elementa
		window.URL.revokeObjectURL(url);
		document.body.removeChild(a);
	})
	.catch(error => {
		console.error('Error exporting data:', error);
	});
}