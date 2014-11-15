function addPreview(json){
	$("#content").last().after().append("<div class='article'></div>");
	$("#content .article").last().after().append("<div id='articleTitle'><a href='#'></a></div>");
	$("#content .article").last().after().append("<div id='articleDate'><div id='articleCategory'></div></div>");		
	$("#content .article").last().after().append("<div id='articlePreview'></div>");
	$("#content .article").last().after().append("<div id='articleContent'></div>");
	$("#content .article #articleTitle a").last().append(json.title);
	$("#content .article #articleTitle a").last().attr("href", json.link + ".html");
	$("#content .article #articleDate").last().append(json.date);
	$("#content .article #articleCategory").last().append(json.category);
	$("#content .article #articlePreview").last().append(json.preview)
	$("#content .article #articleContent").last().append(json.content);

	$("#content .article #articleContent").last().hide();
}

function clickSlide(){
	$("#content .article").click(function(){
		$("#header").replaceWith("<div id='header'>Recent Articles (Click to Show All)</div>");
		$(this).find("#articlePreview").hide("slow");
		$(this).find("#articleContent").show("slow");

		$("#content .article").not(this).each(function(){
			$(this).hide("slow");
		});

		if ($("#content .article").not(this).is(":hidden")){
			$("#header").replaceWith("<div id='header'>Recent Articles (Click Article to Expand)</div>");
			$("#content .article").show("slow");
			$(this).find("#articleContent").hide("slow");
			$(this).find("#articlePreview").show("slow");
		}
	});

}

$(document).ready(function(){
	var headerSpeed = 400;
	var contentSpeed = 1000;
	var i;
	var sections = ["Home",
					"Baseball",
					"Stories",
					"About"];

	var sectionURLs = ["index.html",
					   "baseball.html",
					   "stories.html",
					   "about.html"];

	var title = "Dog on Hiatus"

	$("head").prepend("<meta charset='UTF-8'/>")

	$("#title").append(title);


	$("head").append("<link rel='icon' type='image/png' href='../DogOnHiatusIcon.png'>");


	for (i = 0; i < sections.length; i++){
		$("#nav_cont .rectangle #navigation li a").eq(i).append(sections[i]);
		$("#nav_cont .rectangle #navigation li a").eq(i).attr("href", sectionURLs[i]);
	}



	$("#nav_cont").hide();
	$("#title").hide();
	$("#content").hide();

	$("#nav_cont").fadeIn(headerSpeed);
	$("#title").fadeIn(headerSpeed);

	$("#content").fadeIn(contentSpeed);
});