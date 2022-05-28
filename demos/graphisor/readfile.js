export default function jstest(){
 		document.querySelector("#file-content").textContent = "test32";
 		console.log(`test function`);
}

function loadfile(){
      const data2=document.querySelector("#file-input").addEventListener('change', function() {
		let file = document.querySelector("#file-input").files[0];
		console.log(file);
		let reader = new FileReader();
		const data3=reader.addEventListener('load', function(e) {
	    		let text = e.target.result;
	    		document.querySelector("#file-content").textContent = text;
	    		console.log(text);
	    		return text;
		});
		reader.readAsText(file);
	   });   
}

function readFile2(input) {
        let file = input.files[0]; 
        let fileReader = new FileReader(); 
        fileReader.readAsText(file); 
        fileReader.onload = function() {
          alert(fileReader.result);
        }; 
        fileReader.onerror = function() {
          alert(fileReader.error);
        }; 
      }
      
function showFile(input) {
        let file = input.files[0];
        alert(`File name: ${file.name}`); 
        alert(`Last modified: ${file.lastModified}`);
      }      