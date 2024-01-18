//this all works except the DOM deletion in line 127
document.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:3000/ramens')
    .then(resp => resp.json())
    .then(ramens => ramens.forEach((ramen, index) => {
        renderRamen(ramen);
        if (index === 0) {handleRamenClick(ramen);}
    }));
    document.getElementById('edit-ramen').addEventListener('submit', e => {//i am trying to handle if one of the fields is empty and have ended up with probably redundant functions
        e.preventDefault();
        const changedRamenLink = document.querySelector('div > img.detail-image').src; //i randomly wanted to be more specific with this selector
        let id;
        for (ramenInMenu of document.querySelector('#ramen-menu').children) { //there are probably better ways to do this, like storing the id in the featured ramen
            if (changedRamenLink === ramenInMenu.src) {id = ramenInMenu.id}
        } 
        const comment = document.querySelector('form#edit-ramen > textarea#new-comment').value;
        const rating = document.querySelector('form#edit-ramen > input#new-rating').value;
        if (comment !== '') {handleNewComment(comment)} //this might be its first occurence, but there some repeating ids in the html. also noting that value was needed instead of textContent
        if (rating !== '') {handleNewRating(rating)} //unfortunately this way i need to fetch twice. it would probably be better to have a double function and check if both a rating and comment were submitted. 
        
        

        function handleNewComment(comment) { //i defined this function in here so it has access to the id variable
            fetch(`http://localhost:3000/ramens/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': "application/json"
                },
                body: JSON.stringify({
                    'comment': comment,
                })
            })
            .then(resp => resp.json())
            .then(ramenToChange => {
                handleRamenClick(ramenToChange); //this unnecessarily reupdates the picture and some other info. maybe it would be better to just update the needed fields, but it would look a bit uglier here
                document.querySelector('form#edit-ramen > textarea#new-comment').value = ''; //resetting form. i orignally had these after the if statements that called the handleNewComment or rating and it caused timing issues that made the form work only sometimes
            });
        }

        function handleNewRating(rating) { 
            fetch(`http://localhost:3000/ramens/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': "application/json"
                },
                body: JSON.stringify({
                    'rating': rating,
                })
            })
            .then(resp => resp.json())
            .then(ramenToChange => {
                handleRamenClick(ramenToChange);
                document.querySelector('form#edit-ramen > input#new-rating').value = ''; 
            });
        }
    });
    document.getElementById('new-ramen').addEventListener('submit', e => {
        e.preventDefault(); 
        postRamen(e);
    })
    document.getElementById('delete-button').addEventListener('click', (e) => {
        ramenToDeleteLink = document.querySelector('div > img.detail-image').src; //i randomly wanted to be more specific with this selector
        let id;
        for (ramenInMenu of document.querySelector('#ramen-menu').children) { //there are probably better ways to do this, like storing the id in the featured ramen
            if (ramenToDeleteLink === ramenInMenu.src) {id = ramenInMenu.id}
        } 
        deleteRamenById(id);
    })
});

function renderRamen(ramen) {
    const ramenImg = document.createElement('img');
    ramenImg.src = ramen.image;
    ramenImg.id = ramen.id
    ramenImg.addEventListener('click', (e) => {
        const id = e.target.id;
        fetch(`http://localhost:3000/ramens/${id}`)
        .then(resp => resp.json())
        .then(clickedRamen => handleRamenClick(clickedRamen));
    });
    document.querySelector('div#ramen-menu').append(ramenImg);
}

function handleRamenClick(clickedRamen) {
    const details = document.querySelector('div#ramen-detail')
    document.querySelector('.detail-image').src = clickedRamen.image;
    document.querySelector('.detail-image').alt = clickedRamen.name;
    document.querySelector('.name').textContent = clickedRamen.name;
    document.querySelector('.restaurant').textContent = clickedRamen.restaurant;
    document.querySelector('#rating-display').textContent = clickedRamen.rating;
    document.querySelector('#comment-display').textContent = clickedRamen.comment;
}

function postRamen(e) {
    fetch('http://localhost:3000/ramens', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': "application/json"
        },
        body: JSON.stringify({
            'name': e.target.name.value,
            'restaurant': e.target.restaurant.value,
            'image': e.target.image.value,
            'rating': e.target.rating.value,
            'comment': e.target['new-comment'].value
        })
    })
    .then(resp => resp.json())
    .then(postedRamen => {
        renderRamen(postedRamen);
        handleRamenClick(postedRamen); //this will show us the new ramen! 
    });
}

function deleteRamenById(id) {
    fetch(`http://localhost:3000/ramens/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Accept': "application/json"
        },
    })
    .then(() => { //this just runs after the successful delete
        debugger
        document.querySelector(`div#ramen-menu > img#${id}`).remove(); //sometimes it says this is an invalid selector and the dom removal doesnt work and i have no idea why
        document.querySelector(`div#ramen-menu > img`).click() //should simulate a click on the first image element in the menu
    })
}