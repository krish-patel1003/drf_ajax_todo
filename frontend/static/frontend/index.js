function getCookie(name) {
    // for reference: https://docs.djangoproject.com/en/4.1/howto/csrf/
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

let activeItem = null;

let list_snapshot = []

buildList()
function buildList(){
    // this function is responsible for calling data and outputting it to our wrapper 
    const wrapper = document.getElementById('list-wrapper');
    // wrapper.innerHTML = '';

    const url = "http://localhost:8000/api/task-list/";

    fetch(url)
    .then((resp) => resp.json())
    .then((data) => {
        console.log("Data:", data);

        let list = data;

        list.forEach((element, i) => {  

            try{
                console.log('removing');
                document.getElementById(`data-row-${i}`).remove()
            }
            catch(e){
            }

            let title = `<span class="title">${element.title}</span>`;   

            if(element.completed == true){
                title = `<strike class="title">${element.title}</strike>`;
            }
            let item = `
                <div id="data-row-${i}" class="task-wrapper flex-wrapper">
                    <div style="flex:7">${title}</div>
                    <div style="flex:1">
                        <button class="btn btn-sm btn-outline-info edit">Edit </button>
                    </div>
                    <div style="flex:1">
                        <button class="btn btn-sm btn-outline-dark delete">X</button>
                    </div>
                </div>
            ` ;

            wrapper.innerHTML += item;
        });

        if(list_snapshot.length > list.length){
            for(let i = list.length; i < list_snapshot.length; i++){
                document.getElementById(`data-row-${i}`).remove()
            }
        }
        
        list_snapshot = list;
        
        list.forEach((element, i) => {
            let editBtn = document.getElementsByClassName('edit')[i];
            let deletBtn = document.getElementsByClassName('delete')[i];
            let strikeBtn = document.getElementsByClassName('title')[i];
    
            editBtn.addEventListener('click', () => {
                editItem(element);
            })

            deletBtn.addEventListener('click', () => {
                deleteItem(element);
            })

            strikeBtn.addEventListener('click', () => {
                strikUnstrike(element);
            })
        });
    })

}

const form = document.getElementById('form-wrapper');
form.addEventListener('submit', function(e){
    e.preventDefault(); 
    console.log(' Form submitted '); 
    let url = "http://localhost:8000/api/task-create/";

    if(activeItem != null){
        url = `http://localhost:8000/api/task-update/${activeItem.id}`;
        activeItem = null; 
    }

    let title = document.getElementById('title').value 
    fetch(url, {
        method:'POST',
        headers: {
            'Content-type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify({'title':title})
    })
    .then((resp) => {
        buildList();
        document.getElementById('form').reset()
    })
})

function editItem(item){
    console.log("Item clicked: ", item);
    activeItem = item;
 
    document.getElementById('title').value = activeItem.title;
}

function deleteItem(item){
    console.log("Delete: ", item);
    let url = `http://localhost:8000/api/task-delete/${item.id}`;

    fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-type': 'application/json',
            'X-CSRFToken': csrftoken,
        }
    })
    .then((resp) => {
        buildList();
    })
}

function strikUnstrike(item){
    console.log("Strike item: ", item);
    item.completed = !item.completed

    let url = `http://localhost:8000/api/task-update/${item.id}`;

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify({
            'title': item.title,
            'completed': item.completed,
        }),
    })
    .then((resp) => {
        buildList();
    })
}