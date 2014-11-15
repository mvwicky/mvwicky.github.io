import sys
import os

def removeNewLines(string):
	for i in range(len(string)):
		string[i] = string[i].replace('\n', "")


def main():
	article = sys.argv[1]

	fileName = '../html/' + article.replace(".txt", ".html")
	#jsName = '../js/' + article.replace(".txt", ".js")

	articleName = article.replace(".txt", "")

	html = open(fileName, 'w')
	#js = open(jsName, 'w')

	aText = []

	with open(article) as f:
		aText.append(f.readlines())

	aText = aText[0]
	removeNewLines(aText)

	title = aText[0].replace('title:','')
	date = aText[2].replace('date:','')

	title = title[1:len(title)-1]
	date = date[1:len(date)-1]

	while aText[5][0:8] != "preview:":
		aText[4] += str("<br>" + aText.pop(5))

	content = aText[4]
	content = content.replace('content:', '')
	content = content[1:len(content)-2]

	html.write('<html>\n')
	html.write('<head>')

	html.write('<meta charset="UTF-8"/>\n')

	html.write('<title>' + articleName + '</title>\n')

	html.write('<link rel="stylesheet" type="text/css" href="../css/style.css">\n')
	html.write('<script type="text/javascript" src="../js/jquery.js"></script>\n')
	html.write('<script type="text/javascript" src="../js/dogOnHiatus.js"></script>\n')
	#html.write('<script type="text/javascript" src="' + jsName + '"></script>\n')

	html.write('</head>\n')

	html.write('<body>\n\n')

	html.write('\t<div id="title"></div>\n')
	html.write('\t<div id="nav_cont">\n')
        
	html.write('\t\t<div class="rectangle">\n')
	html.write('\t\t\t<ul id="navigation">\n')
	html.write('\t\t\t\t<li><a></a></li>\n')
	html.write('\t\t\t\t<li><a></a></li>\n')
	html.write('\t\t\t\t<li><a></a></li>\n')
	html.write('\t\t\t\t<li><a></a></li>\n')
	html.write('\t\t\t</ul>\n');
	html.write('\t\t</div>\n')
	html.write('\t</div>\n\n')

	html.write('\t<div id="content">\n')
	html.write('\t<div id="header">Butts</div>\n')
	html.write('\t<div class="article">\n')
	html.write('\t\t<div id="articleTitle"><a>' + title + '</a></div>\n')
	html.write('\t\t<div id="articleDate">' + date + '</div>\n')
	html.write('\t\t<div id="articleContent">' + content + '</div>\n')
	html.write('\t</div>\n')

	html.write('\t</div>')

	html.write('</body>\n')

	html.write('</html>')

	html.close()

	#js.write('$(document).ready(function(){\n')
	#js.write('\t\n')
	#js.write('});\n')

	#js.close()



if __name__=='__main__':
	main()