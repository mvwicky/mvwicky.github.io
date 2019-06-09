BUNDLE=bundle
EXEC=$(BUNDLE) exec
JEKYLL=$(EXEC) jekyll
JEKYLLSERVE=$(JEKYLL) serve
SERVEOPTS=--verbose --livereload# --incremental
ALLOPTS=--drafts --unpublished --future
YARN=yarn



all: SERVEOPTS := $(SERVEOPTS) $(ALLOPTS)
all: serve

fresh: clean
fresh: update
fresh: all

clean:
	$(BUNDLE) clean
	$(JEKYLL) clean

build:
	$(YARN) run build
	$(JEKYLL) build

update:
	$(BUNDLE) update

prod:
	export JEKYLL_ENV=production
	$(JEKYLLSERVE) $(SERVEOPTS)

serve:
	export JEKYLL_ENV=development
	$(YARN) run watch & $(JEKYLLSERVE) $(SERVEOPTS) && fg

drafts: SERVEOPTS := $(SERVEOPTS) --drafts
drafts: serve

future: SERVEOPTS := $(SERVEOPTS) --future
future: serve

unpub: SERVEOPTS := $(SERVEOPTS) --unpublished
unpub: serve

profile:
	$(JEKYLL) clean
	$(JEKYLL) build --profile --verbose

doctor:
	$(JEKYLL) doctor