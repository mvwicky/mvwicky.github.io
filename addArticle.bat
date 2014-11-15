@echo "Making Article"

cd "articles"

python "createJSON.py" %1
python "createHTML.py" %1

cd ".."