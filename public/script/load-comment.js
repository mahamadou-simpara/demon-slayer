const loadButton = document.getElementById('load-comment');

async function loadingComments() {
   const id = loadButton.dataset.id
   const result = await fetch(`/view/${id}/comments`);

   const responseData = await result.json();
   console.log(responseData);
}

loadButton.addEventListener('click', loadingComments)