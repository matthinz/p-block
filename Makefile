DOCKER_IMAGE = p-block
DOCKER_CONTAINER = $(DOCKER_IMAGE)

.PHONY: build clean test test-examples

build: dist

clean:
	-rm -rf coverage dist node_modules
	-find examples -type d -name "node_modules" | xargs rm -rf
	-find examples -type d -name "dist" | xargs rm -rf
	-find examples -name "*.js" | xargs rm
	-find examples -name "yarn.lock" | xargs rm

test: node_modules
	yarn test

test-examples: build
	cd examples/argv && yarn && yarn test
	cd examples/checkout && yarn && yarn test

dist: src/*.ts node_modules
	yarn lint
	yarn build
	touch $@

docs: src/*.ts node_modules
	docker build -t $(DOCKER_IMAGE) .
	-docker rm $(DOCKER_CONTAINER)
	docker run --name $(DOCKER_CONTAINER) -v "$(shell pwd)/src:/usr/src/app/src" $(DOCKER_IMAGE) yarn docs
	-rm -rf docs
	docker cp $(DOCKER_CONTAINER):/usr/src/app/docs ./docs
	docker rm $(DOCKER_CONTAINER)

node_modules: package.json yarn.lock
	yarn
	touch $@
