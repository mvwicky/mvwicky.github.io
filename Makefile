JEKYLL=jekyll
SERVEOPTS=--incremental --verbose

clean:
	$(JEKYLL) clean

serve:
	$(JEKYLL) serve $(SERVEOPTS)

drafts:
	$(JEKYLL) serve $(SERVEOPTS) --drafts
