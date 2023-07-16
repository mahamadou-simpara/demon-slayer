const loadButton = document.getElementById('load-comment');
const divElement = document.getElementById('commentsUlElement')
const text = document.querySelector('#Comments h3');
const form = document.getElementById('form');
const name = document.getElementById('nameComment');
const comment = document.getElementById('comment');
const postid = document.getElementById('idComment');

console.dir(comment);

function displayComment(comments){

 const ul = document.createElement('ul')
 for(const comment of comments){
    const li = document.createElement('li');
    li.innerHTML = `
    <h3>${comment.comment}</h3><hr>
    <p class="commentparagraph">${comment.comment}</p>`;
    ul.appendChild(li)
}
 return ul;
}


async function loadingComments() {
   const id = loadButton.dataset.id;

   const comments = await fetch(`/view/${id}/comments`);
   
   const responseData = await comments.json();
//    console.log(comments);
   const commentContainer = displayComment(responseData);
 

   if(responseData.length > 0){
    text.textContent = '';
    divElement.innerHTML = '';
    divElement.appendChild(commentContainer)
   }else{
    text.textContent = 'Sorry no comments found, Please add some Comments';
    divElement.innerHTML = "";

   }

}



async function handleSubmission(event){
    event.preventDefault();
    const value = {
        name: name.value,
        comment: comment.value,
    }

    const id = postid.value;
    const result = await fetch(`/view/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify(value),
        headers: {
            'Content-type': 'application/json'
        }

       
    });
    
    name.value = "";
    comment.value = "";

    loadingComments();

}


form.addEventListener('submit', handleSubmission)


loadButton.addEventListener('click', loadingComments)


