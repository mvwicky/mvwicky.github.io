BUNDLE=bundle
EXEC=$(BUNDLE) exec
JEKYLL=$(EXEC) jekyll
JEKYLLSERVE=$(JEKYLL) serve
SERVEOPTS=--verbose --livereload
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

build: build-yarn build-jekyll

build-yarn:
	$(YARN) run build

build-jekyll:
	export JEKYLL_ENV=production
	$(JEKYLL) build

update:
	$(BUNDLE) update

prod:
	export JEKYLL_ENV=production
	$(JEKYLLSERVE) $(SERVEOPTS)

serve:
	export JEKYLL_ENV=development
	$(JEKYLLSERVE) $(SERVEOPTS)

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