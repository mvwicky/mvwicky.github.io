$(document).ready(function(){
	var sections = ["Home",
					"Baseball",
					"Stories",
					"About"];

	var sectionURLs = ["../index.html",
					   "../baseball.html",
					   "../stories.html",
					   "../about.html"];


	for (i = 0; i < sections.length; i++){
		$("#nav_cont .rectangle #navigation li a").eq(i).attr("href", sectionURLs[i]);
	}

});