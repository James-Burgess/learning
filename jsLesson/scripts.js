var headline = document.getElementById("headline");
var button = document.getElementById("btn");
var list = document.getElementById("list").getElementsByTagName("li");
var theList = document.getElementById("list");
var count = 0;


theList.addEventListener("click", activateItem);

function activateItem(event) {
	if (event.target.nodeName == "LI"){
	headline.innerHTML = event.target.innerHTML;
	for (i = 0; i < event.target.parentNode.children.length; i++){
		 event.target.parentNode.children[i].classList.remove("active");
	}
	event.target.classList.add("active");
	}
}


button.addEventListener("click", addItem);

function addItem(){
	count++;
	theList.innerHTML += "<li>New Item " + count + "</li>";
}