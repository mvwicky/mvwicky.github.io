import os
import sys

# 0 title
# 1 link
# 2 date
# 3 category
# 4 content
# 5 preview

def removeNewLines(string):
	for i in range(len(string)):
		string[i] = string[i].replace('\n', "")

def main():
	article = str(sys.argv[1])

	allLines = []

	with open(article) as f:
		allLines.append(f.readlines())


	removeNewLines(allLines[0])

	allLines = allLines[0]

	r = len(allLines)

	content = []

	while allLines[5][0:8] != "preview:":
		allLines[4] += str("<br>" + allLines.pop(5))
	

	newArticle = open("articles.js", 'a') # CHANGE BACK TO ARTICLES AND A

	newArticle.write('\n \n')

	newArticle.write('var ')
	newArticle.write(article[0:len(article)-4])
	newArticle.write(' = ')

	newArticle.write('{')

	for i in allLines:
		newArticle.write('\n')
		newArticle.write('\t')
		newArticle.write(i)
		if i[0:7] == 'preview':
			continue
		else:
			newArticle.write(',')
	

	newArticle.write('\n}; \n \n')

	newArticle.write('articleArray.unshift(' + article[0:len(article)-4] + ');')

	newArticle.close()

if __name__ == '__main__':
	main();