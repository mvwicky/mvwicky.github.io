BUNDLE=bundle
EXEC=$(BUNDLE) exec
JEKYLL=$(EXEC) jekyll
JEKYLLSERVE=$(JEKYLL) serve
SERVEOPTS=--verbose --livereload

all: SERVEOPTS := $(SERVEOPTS) --drafts --future --unpublished
all: serve

fresh: clean
fresh: all

clean:
	$(JEKYLL) clean

build:
	$(JEKYLL) build

update:
	$(BUNDLE) update

serve:
	$(JEKYLLSERVE) $(SERVEOPTS)

drafts: SERVEOPTS := $(SERVEOPTS) --drafts
drafts: serve

future: SERVEOPTS := $(SERVEOPTS) --future
future: serve

unpub: SERVEOPTS := $(SERVEOPTS) --unpublished
unpub: serve
