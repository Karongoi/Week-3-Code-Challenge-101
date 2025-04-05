const filmsList = document.getElementById("films");
const poster = document.getElementById("poster");
const title = document.getElementById("title");
const runtime = document.getElementById("runtime");
const showtime = document.getElementById("showtime");
const availableTickets = document.getElementById("available-tickets");
const buyButton = document.getElementById("buy-ticket");

let currentFilm = null;

fetch("http://localhost:3000/films")
  .then((res) => res.json())
  .then((films) => {
    filmsList.innerHTML = "";
    films.forEach(displayFilm);
    if (films.length) showMovie(films[0]);
  });

function displayFilm(film) {
  const li = document.createElement("li");
  li.classList.add("film", "item");
  li.textContent = film.title;
  li.dataset.id = film.id;

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "❌";
  deleteBtn.style.marginLeft = "10px";
  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    deleteFilm(film.id, li);
  });

  li.appendChild(deleteBtn);

  if (film.tickets_sold >= film.capacity) {
    li.classList.add("sold-out");
  }

  li.addEventListener("click", () => showMovie(film));
  filmsList.appendChild(li);
}

function showMovie(film) {
  currentFilm = film;
  poster.src = film.poster;
  title.textContent = film.title;
  runtime.textContent = `${film.runtime} minutes`;
  showtime.textContent = film.showtime;

  const available = film.capacity - film.tickets_sold;
  availableTickets.textContent = available;
  buyButton.textContent = available > 0 ? "Buy Ticket" : "Sold Out";
  buyButton.disabled = available === 0;
}

buyButton.addEventListener("click", () => {
  if (!currentFilm) return;

  const available = currentFilm.capacity - currentFilm.tickets_sold;
  if (available <= 0) return;

  currentFilm.tickets_sold++;

  fetch(`http://localhost:3000/films/${currentFilm.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tickets_sold: currentFilm.tickets_sold }),
  })
    .then((res) => res.json())
    .then((updatedFilm) => {
      showMovie(updatedFilm);
      updateFilmItem(updatedFilm);

      return fetch("http://localhost:3000/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          film_id: updatedFilm.id,
          number_of_tickets: 1,
        }),
      });
    });
});

function updateFilmItem(film) {
  const filmItems = document.querySelectorAll("#films li");
  filmItems.forEach((item) => {
    if (parseInt(item.dataset.id) === film.id) {
      if (film.tickets_sold >= film.capacity) {
        item.classList.add("sold-out");
      } else {
        item.classList.remove("sold-out");
      }
    }
  });
}

function deleteFilm(id, li) {
  fetch(`http://localhost:3000/films/${id}`, {
    method: "DELETE",
  }).then(() => li.remove());
}
