# TODO

- Use `docker exec -it 2659d1e35242 jupyter notebook list --jsonlist` to get any running notebooks. This could be used instead of or in place of getting container logs.
- Warn on docker engine not running.
- Get Docker Engine API version from `getDockerVersion` endpoint.
- Test unix socket on windows, may need to do something else.
- Divide app state into two parts (showing notebook/no notebook)

# Automate

- Use API or automate process to get pip and conda package info off of images:

```bash session
❯ docker run --rm -it jupyter/scipy-notebook pip list --not-required --format=json > ./src/data/images/scipy-notebook.json
❯ docker run --rm -it jupyter/minimal-notebook pip list --not-required --format=json > ./src/data/images/minimal-notebook.json
```