var trinity = [];
var score = 0;

var answers = getElementByID('playerName')

function scorecheck(){
	if(answers="[1,5,9],[2,6,10],[3,7,11],[4,8,12],[9,6,3],[1,6,11],[2,7,12],[10,7,4]"){
		if(answers = trinity){
			print ("Duplicate Trinity in numerical order");
			score = score + 9;
		}
		else {
			print ("Trinity in numerical order");
			score = score + 3;
		}
		trinity = answers;
	};
	else if(answers="[1,2,3,4][5,6,7,8],[9,10,11,12]"){
			print ("quad"); 
			score = score + 16;
	};
	else {
		print ("No Trinity");
	}
};

function total(){
	print ("Total: " + score);
}