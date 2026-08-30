intl_imports = ./node_modules/.bin/intl-imports.js
transifex_utils = ./node_modules/.bin/transifex-utils.js
i18n = ./src/i18n
transifex_input = $(i18n)/transifex_input.json

# This directory must match .babelrc .
transifex_temp = ./temp/babel-plugin-formatjs

precommit:
	npm run lint
	npm audit

requirements:
	npm ci

i18n.extract:
	# Pulling display strings from .jsx files into .json files...
	rm -rf $(transifex_temp)
	npm run-script i18n_extract

i18n.concat:
	# Gathering JSON messages into one file...
	$(transifex_utils) $(transifex_temp) $(transifex_input)

extract_translations: | requirements i18n.extract i18n.concat

# Despite the name, we actually need this target to detect changes in the incoming translated message files as well.
detect_changed_source_translations:
	# Checking for changed translations...
	git diff --exit-code $(i18n)

pull_translations:
	rm -rf src/i18n/messages
	mkdir src/i18n/messages
	cd src/i18n/messages \
	   && atlas pull $(ATLAS_OPTIONS) \
	            translations/frontend-component-ai-translations/src/i18n/messages:frontend-component-ai-translations \
	            translations/frontend-platform/src/i18n/messages:frontend-platform \
	            translations/paragon/src/i18n/messages:paragon \
	            translations/frontend-component-footer/src/i18n/messages:frontend-component-footer \
	            translations/frontend-app-course-authoring/src/i18n/messages:frontend-app-course-authoring

	# OST2: the pulled translations still carry upstream's decade-old "2014_T1"
	# course-run example, so a non-English Studio would contradict the English
	# source string. Rewrite the token in place, which keeps each locale's own
	# lead-in wording ("z.B. 2026_v1", "例如：2026_v1").
	#
	# Substitution is textual rather than JSON-aware on purpose. Audited against
	# openedx-translations @ release/teak.3: "2014_T1" occurs exactly once per
	# locale file and only ever as the value of
	# course-authoring.create-or-rerun-course.run.placeholder, so nothing else can
	# be caught. It also covers az.json, which upstream ships as invalid JSON (an
	# unescaped quote) that a JSON parser would refuse to load. -i.ost2bak takes an
	# explicit suffix so this works under both GNU and BSD sed.
	find src/i18n/messages -name '*.json' -print0 | xargs -0 sed -i.ost2bak 's/2014_T1/2026_v1/g'
	find src/i18n/messages -name '*.json.ost2bak' -delete

	$(intl_imports) frontend-component-ai-translations frontend-platform paragon frontend-component-footer frontend-app-course-authoring

# This target is used by Travis.
validate-no-uncommitted-package-lock-changes:
	# Checking for package-lock.json changes...
	git diff --exit-code package-lock.json

.PHONY: validate
validate:
	make validate-no-uncommitted-package-lock-changes
	npm run i18n_extract
	npm run lint -- --max-warnings 0
	npm run types
	npm run test:ci
	npm run build

.PHONY: validate.ci
validate.ci:
	npm ci
	make validate
