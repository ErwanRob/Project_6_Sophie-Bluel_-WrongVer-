//---------- CONSTS ----------
const token = localStorage.getItem('token');
const logInOutBtn = document.getElementById('logB')
const main = document.querySelector('main')
const header = document.querySelector('header')
const body = document.querySelector('body')
const mainGallery = document.querySelector(".gallery");
const smlGallery = document.querySelector(".smlGallery");
/*Modal consts*/
const modifyProfilBtn = document.getElementById('modifyProfil')
const modifyButton = document.getElementById('modifyProject')
const modal = document.getElementById('sbModal')
const modalCloseBtn = document.querySelectorAll('.modal .close')
const manageGallery = document.querySelector('.manageGallery')
const managePic = document.querySelector('.managePic')
const addAPictureBtn = document.querySelector('.addPic_btn')
const arrowLeft = document.querySelector('.previous')
const form = document.getElementById('submitForm')
let isModalOpen = false;
/*TopBlackLine consts*/
const topBlackLine = document.querySelector('.top-blackLine')
const editionModeBtn = document.querySelector('.editionModeBtn')
const publicateChangesBtn = document.querySelector('.publicateChangesBtn')
//Gathering the "ALL" filter button which has a different behavior
const btnAll = document.querySelector('button[data-filter="0"]');
//Gathering the references of all filter button data-filter
const buttons = document.querySelectorAll('.filter-option[data-filter]');
//Set() permettant de stocker les filtres actifs
const activeFilters = new Set();
let works = [];
let categorySelection = document.getElementById('categories');


// ---------- EVT LISTENERS ----------
logInOutBtn.addEventListener('click', function () {
    // Remove the token from local storage
    localStorage.removeItem('token');
    // Redirect the user to the logout page or any desired page
    window.location.href = "login.html";
});
window.addEventListener('click', function (event) {
    if (isModalOpen && event.target !== modal && !modal.contains(event.target)) {
        setTimeout(function () {
            modal.style.display = 'none';
            main.classList.remove('--blurEffect');
            header.classList.remove('--blurEffect');
            body.classList.remove('--grayEffect');
            toggleModalStatus();
        }, 250);
    }
});
modifyButton.addEventListener('click', function () {
    modal.style.display = 'block'
    manageGallery.style.display = "flex"
    managePic.style.display = "none"
    main.classList.add('--blurEffect')
    header.classList.add('--blurEffect')
    body.classList.add('--grayEffect')
    toggleModalStatus();
});
modalCloseBtn.forEach(function (closeBtn) {
    closeBtn.addEventListener('click', function () {
        modal.style.display = 'none'
        main.classList.remove('--blurEffect')
        header.classList.remove('--blurEffect')
        body.classList.remove('--grayEffect')
        toggleModalStatus();
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
editionModeBtn.addEventListener('click', function () {
    modal.style.display = 'block'
    manageGallery.style.display = "flex"
    managePic.style.display = "none"
    main.classList.add('--blurEffect')
    header.classList.add('--blurEffect')
    body.classList.add('--grayEffect')
    toggleModalStatus();
});
publicateChangesBtn.addEventListener('click', function () {
    modal.style.display = 'block'
    manageGallery.style.display = "none"
    managePic.style.display = "flex"
    main.classList.add('--blurEffect')
    header.classList.add('--blurEffect')
    body.classList.add('--grayEffect')
    toggleModalStatus();
});
form.addEventListener('submit', async function (event) {
    event.preventDefault(); // prevent default form submission
    const formData = new FormData(form);
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
            fetchAndRefresh();
            console.log('Work Created', data);
        } else {
            throw new Error('Failed to create work');
        }
    } catch (error) {
        console.error(error);
    }
});


//---------- FUNCTIONS ----------
//Apply filters and show the filetered works
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
//Fetch the data from database
async function fetchData() {
    const response = await fetch(`http://localhost:5678/api/works`);
    works = await response.json();
    console.log('Data Fetched')
}
//Cleanse and regenerate data by fetching the work list from the database
async function fetchAndRefresh() {
    mainGallery.innerHTML = "";
    smlGallery.innerHTML = "";
    await fetchData();
    generateWorks(works);
    generateModalWorks(works);
    console.log('Galleries Refreshed')
}
//Cleanse without fetching the gallery and show a specific list of work
function cleanseAndShow(workList) {
    /* console.log('CleanseandShowStart') */
    mainGallery.innerHTML = "";
    generateWorks(workList);
    smlGallery.innerHTML = "";
    generateModalWorks(workList);
    /* console.log('CleanseandShowEnd') */
}
//Main function, initial call to fecth data on page load
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
                        fetchAndRefresh();
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
//Generate dynamicaly the categories in the modal
function generateCategoriesInModal(categories) {
    categories.forEach(function (category) {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelection.appendChild(option)
    });
    console.log('GeneratedCategoriesInModal')
}
//Add the top blackline modification tool when user is logged in
function addTopBlackLine() {
    topBlackLine.style.display = "flex"
    header.classList.add("--adjustedMainHeader")
}
//Show the modification buttons when user is logged in
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
//Change the status of the modal, visible true or false
function toggleModalStatus() {
    setTimeout(function () {
        if (isModalOpen) {
            isModalOpen = false;
        } else {
            isModalOpen = true;
        }
        console.log("ModalOpen:", isModalOpen)
    }, 100);
}
//Bonus function which is not applied atm but aim to let the user select multiple images before deleting them
function imgSelectionToggle(workImage) {
    if (workImage.classList.contains('--imgSelected')) {
        workImage.classList.remove('--imgSelected');
    } else {
        workImage.classList.add('--imgSelected');
    }
}


//---------- PROCESS ----------
if (token) {
    // Token exists, user is logged in
    addTopBlackLine();
    addModifyButton();
    swapLoginLogout();
    console.log('User is logged in');
} else {
    // Token doesn't exist, user is not logged in
    console.log('User is not logged in');
}

//Initial call
getWorksDataOnLoad();