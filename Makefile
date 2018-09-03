BUNDLE=bundle
EXEC=$(BUNDLE) exec
JEKYLL=$(EXEC) jekyll
JEKYLLSERVE=$(JEKYLL) serve
SERVEOPTS=--verbose --livereload

all: SERVEOPTS := $(SERVEOPTS) --drafts --future --unpublished
all: serve

clean:
	$(JEKYLL) clean

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
