//CONSTS ----------
const token = localStorage.getItem('token');
const logInOutBtn = document.getElementById('logB')
const main = document.querySelector('main')
const header = document.querySelector('header')
const body = document.querySelector('body')
const mainGallery = document.querySelector(".gallery");
const smlGallery = document.querySelector(".smlGallery");
/*Modal*/
const modifyProfilBtn = document.getElementById('modifyProfil')
const modifyButton = document.getElementById('modifyProject')
const modal = document.getElementById('sbModal')
const modalCloseBtn = document.querySelectorAll('.modal .close')
const manageGallery = document.querySelector('.manageGallery')
const managePic = document.querySelector('.managePic')
const addAPictureBtn = document.querySelector('.addPic_btn')
const arrowLeft = document.querySelector('.previous')
const form = document.getElementById('submitForm')
/*TopBlackLine*/
const topBlackLine = document.querySelector('.top-blackLine')
//On récupère la référence du bouton "TOUS" qui se comporte différement
const btnAll = document.querySelector('button[data-filter="0"]');
//On recupère la référence de tous les boutons de filtre
const buttons = document.querySelectorAll('.filter-option[data-filter]');
//Set() permettant de stocker les filtres actifs
const activeFilters = new Set();
let works = [];
let categorySelection = document.getElementById('cat');


// EVT LISTENERS  --------------
logInOutBtn.addEventListener('click', function () {
    // Remove the token from local storage
    localStorage.removeItem('token');
    // Redirect the user to the logout page or any desired page
    window.location.href = "index.html";
});

modifyButton.addEventListener('click', function () {
    modal.style.display = 'block'
    manageGallery.style.display = "flex"
    managePic.style.display = "none"
    main.classList.add('--blurEffect')
    header.classList.add('--blurEffect')
    body.classList.add('--grayEffect')
});

modalCloseBtn.forEach(function (closeBtn) {
    closeBtn.addEventListener('click', function () {
        modal.style.display = 'none'
        main.classList.remove('--blurEffect')
        header.classList.remove('--blurEffect')
        body.classList.remove('--grayEffect')
    })
});

addAPictureBtn.addEventListener('click', function () {
    manageGallery.style.display = "none"
    managePic.style.display = "flex"
});

arrowLeft.addEventListener('click', function () {
    managePic.style.display = "none"
    manageGallery.style.display = "flex"
});


//FUNCTIONS

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
    console.log('filterApplied')
}
async function fetchData() {
    const response = await fetch(`http://localhost:5678/api/works`);
    works = await response.json();
    console.log('Data Fetched')
}
async function refreshGallery() {
    mainGallery.innerHTML = "";
    await fetchData();
    generateWorks(works);
    console.log('Gallery Refreshed')
}
//Fonction qui nettoie la galerie et affiche la liste de travaux spécifié
function cleanseAndShow(workList) {
    console.log('CleanseandShowStart')
    mainGallery.innerHTML = "";
    generateWorks(workList);
    smlGallery.innerHTML = "";
    generateModalWorks(workList);
    console.log('CleanseandShowEnd')
}

async function getWorksDataOnLoad() {
    //Recupération des données via l'API & Conversion des données au format json
    fetchData();

    //Recupération des catégories via l'API & Conversion des données au format json
    const categoriesResponse = await fetch('http://localhost:5678/api/categories');
    const categories = await categoriesResponse.json();
    //Fonction permettant le basculer et appliquer les filtres
    function toggleFilters(categoryId, button) {
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
                toggleFilters(categoryId, button);
                //toggleSingleFilter filter --> could had another function for single here
            }
        });
    });
    /* generateWorks(works);
    generateModalWorks(works); */
    generateCategoriesInModal(categories);
    applyFilters();

    console.log('GetWorkDataOnLoad')
}
//Fonction qui genere les travaux dans la galerie
function generateWorks(works) {
    for (let i = 0; i < works.length; i++) {
        const work = works[i];
        const workElement = document.createElement("figure");
        const workImage = document.createElement("img");
        const workTitle = document.createElement("figcaption");
        workImage.src = work.imageUrl;
        workTitle.innerText = work.title;
        mainGallery.appendChild(workElement);
        workElement.appendChild(workImage);
        workElement.appendChild(workTitle);
    }
    console.log('GeneratedWorks')
}

//Fonction qui génère les travaux dans le modal au chargement de la page
function generateModalWorks(works) {
    for (let i = 0; i < works.length; i++) {
        const work = works[i];
        const workElement = document.createElement("figure");
        const workImage = document.createElement("img");
        const workTitle = document.createElement("figcaption");
        const workDelIcon = document.createElement('i');
        workImage.src = work.imageUrl;
        workTitle.innerText = "editer";
        workDelIcon.className = "fa-solid fa-trash-can";
        smlGallery.appendChild(workElement);
        workElement.appendChild(workImage);
        workElement.appendChild(workTitle);
        workElement.appendChild(workDelIcon);

        //Add an event listener to each work and stores it if clicked  
        workDelIcon.addEventListener("click", async function () {
            /**/
            if (confirm("Are you sure you want to delete this work?")) {
                try {
                    // Send the DELETE request
                    const response = await fetch(`http://localhost:5678/api/works/${work.id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                        method: 'DELETE',
                    });
                    console.log('Response status:', response.status);

                    if (response.status === 200 || response.status === 204) {
                        // Work deleted successfully, remove the work element from the gallery
                        workElement.remove();
                        refreshGallery();
                        /**/
                        console.log("Work deleted:", work);
                    } else {
                        throw new Error('Failed to delete work');
                    }
                } catch (error) {
                    console.error(error);
                }
            }
            /*   console.log("Work selected:", work, "Ready to be deleted"); */
        });
    }
    console.log('GeneratedModalWorks')
}
function imgSelectionToggle(workImage) {
    if (workImage.classList.contains('--imgSelected')) {
        workImage.classList.remove('--imgSelected');
    } else {
        workImage.classList.add('--imgSelected');
    }
}
function addTopBlackLine() {
    topBlackLine.style.display = "flex"
    header.classList.add("--adjustedMainHeader")
}
function addModifyButton() {
    modifyButton.style.display = "inline-block";
    modifyProfilBtn.style.display = "inline-block";
    const projTitle = document.querySelector("#portfolio_header h2")
    projTitle.classList.add("--adjustedPortfolioHeader")
}
function swapLoginLogout() {
    logInOutBtn.innerText = "logout"
    logInOutBtn.href = "#"
}

form.addEventListener('submit', async function (event) {
    event.preventDefault(); // prevent default form submission
  
    const formData = new FormData(form);
  
    const photo = formData.get('photo');
    console.log('photo', photo);
    const title = formData.get('nomProjet');
    console.log('title:', title);
    const category = formData.get('category');
    console.log('category:', category);
  
   /*  for (const pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    } */
  
    
   
    try {
      const response = await fetch('http://localhost:5678/api/works', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        method: 'POST',
        body: formData
      });
  
      if (response.status === 201) {
        const data = await response.json();
        console.log('Work Created', data);
      } else {
        throw new Error('Failed to create work');
      }
    } catch (error) {
      console.error(error);
    }
  });

/* 
form.addEventListener('submit', function (event) {
    event.preventDefault();//prevent default form sub
    //We get the form data
    const formData = new FormData(form);

    for (const pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
    }
    const title = formData.get('nomProjet'); // retrieve the value of the "nomProjet" field
    console.log('title:', title);
    const photo = formData.get('photo');
    console.log('photo', photo);

    //We Send the POST request
    fetch('http://localhost:5678/api/works', {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        method: 'POST',
        body: formData
    })
        .then(response => {
            console.log(response)
            if (response.status === 201) {
                return response.json();
            } else {
                throw new Error('Failed to create work')
            }
        })
        .then(data => {
            console.log('Work Created', data)
        })
        .catch(error => {
            console.error(error);
        })
}); */

function generateCategoriesInModal(categories) {
    categories.forEach(function (category) {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelection.appendChild(option)
    });
    console.log('GeneratedCategoriesInModal')
}

if (token) {
    // Token exists, user is logged in
    // Show the desired content or enable specific functionality
    addTopBlackLine();
    addModifyButton();
    swapLoginLogout();
    /* console.log('User is logged in'); */
} else {
    // Token doesn't exist, user is not logged in
    // Show a login form or redirect the user to the login page
    console.log('User is not logged in');
}



//Call initial pour charger les données et afficher les travaux
getWorksDataOnLoad();













/* // Send the DELETE request
           fetch(`http://localhost:5678/api/works/${selectedWork.id}`, {
               headers: {
                   'Authorization': `Bearer ${token}`,
               },
               method: 'DELETE',
           })
           .then(response => {
               if (response.status === 200) {
                   // Work deleted successfully, remove the work element from the gallery
                   workElement.remove();
                   console.log("Work deleted:", selectedWork);
               } else {
                   throw new Error('Failed to delete work');
               }
           })
           .catch(error => {
               console.error(error);
           });
       }
       console.log("Work selected:", selectedWork, "Ready to be deleted"); */







/* */

/* const gallery = document.querySelector(".gallery");
                workElementSiblingInMainGallery = Array.from(gallery.children).find(element =>
                    element.querySelector('img').src === workImage.src);
                if (workElementSiblingInMainGallery) {
                    workElementSiblingInMainGallery.remove();
                } */


                        // Set the selected work
/*  workImage.classList.add('--imgSelected'); */
/*  selectedWork = work; */
            //handle delete here
/* imgSelectionToggle(workImage); */