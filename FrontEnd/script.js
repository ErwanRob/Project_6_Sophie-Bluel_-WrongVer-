async function getWorksDataOnLoad() {
    //Recupération des données via l'API
    const response = await fetch(`http://localhost:5678/api/works`);
    //Conversion des données au format json
    const works = await response.json();
    //Set() permettant de stocker les filtres actifs
    const activeFilters = new Set();

    //Fonction permettant le basculer et appliquer les filtres
    function toggleFilter(categoryId, button) {
        //Verification du filtre, actif -> remove / inactif -> add / (toogle)
        if (activeFilters.has(categoryId)) {
            activeFilters.delete(categoryId);
            button.classList.remove("--selected");
        } else {
            activeFilters.add(categoryId);
            button.classList.add("--selected");
            //Déselecte le filtre TOUS lorsqu'un autre filtre est actif
            if (activeFilters.size > 0) {
                btnAll.classList.remove("--selected");
              }
        }
        applyFilters();
    }

    // Fonction qui applique les filtres, et affiche les travaux filtrés
    function applyFilters() {
        //On verifie s'il n'y a pas de filtre actif
        if (activeFilters.size === 0) {
            //Si c'est le cas, on sélectionne le filtre "TOUS" et on affiche l'entiereté des travaux
            cleanseAndShow(works);
            btnAll.classList.add("--selected");
        } else {
            //Sinon, on affiche les travaux filtrés en fonction de leur catégorie
            const filteredWorks = works.filter(function (work) {
                return activeFilters.has(work.categoryId);
            });
            cleanseAndShow(filteredWorks);
        }
    }
    //On récupère la référence du bouton "TOUS" qui se comporte différement
    const btnAll = document.querySelector('button[data-filter="0"]');
    //On recupère la référence de tous les boutons de filtre
    const buttons = document.querySelectorAll('.filter-option[data-filter]');
    //Ajout d'un EventListener sur les filtres
    buttons.forEach(function (button) {
        //On convertit la valeur de data-filtrer en int
        const categoryId = parseInt(button.dataset.filter);
        button.addEventListener("click", function () {
            if (categoryId === 0) {
                //On deselectionne les filtres actifs lorsque que le bouton ALL est séléctionné
                activeFilters.clear();
                buttons.forEach(function (button) {
                    button.classList.remove("--selected");
                });
                //On sélectionne le filtre "TOUS" et on affiche l'entiereté des travaux
                cleanseAndShow(works);
                btnAll.classList.add("--selected");
            } else {
                toggleFilter(categoryId, button);
            }
        });
    });

    applyFilters();
    generateWorks(works);
}

//Fonction qui genere les travaux dans la galerie
function generateWorks(works) {
    for (let i = 0; i < works.length; i++) {
        const work = works[i];
        const gallery = document.querySelector(".gallery");
        const workElement = document.createElement("figure");
        const workImage = document.createElement("img");
        const workTitle = document.createElement("figcaption");
        workImage.src = work.imageUrl;
        workTitle.innerText = work.title;
        gallery.appendChild(workElement);
        workElement.appendChild(workImage);
        workElement.appendChild(workTitle);
    }
}

//Fonction qui nettoie la galerie et affiche la liste de travaux spécifié
function cleanseAndShow(workList) {
    document.querySelector(".gallery").innerHTML = "";
    generateWorks(workList);
}

//Call initial pour charger les données et afficher les travaux
getWorksDataOnLoad();



