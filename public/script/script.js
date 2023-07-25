// const svgElement = document.querySelector('#img svg');
const imgIconElement = document.querySelector('#img img');
const previewImage = document.querySelector('#hidden');
const filePicker = document.querySelector('#input-file');

 

// function showPreview (){
//     filePicker.click();
//     const files = filePicker.files;

//     console.log(files);
//     if(!files || files.length === 0){
//         console.log('files');
//         return;
//     };


//     console.log('Okay !');
// };

// svgElement.addEventListener('click', showPreview);

filePicker.addEventListener('change', () =>{
 
 const files = filePicker.files;

 if(!files || files.length === 0){
 return;
 }
 const pickedFile = files[0];

 imgIconElement.src = URL.createObjectURL(pickedFile);
})