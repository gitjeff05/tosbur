# TODO

- Use `docker exec -it 2659d1e35242 jupyter notebook list --jsonlist` to get any running notebooks. This could be used instead of or in place of getting container logs.
- Warn on docker engine not running.
- Get Docker Engine API version from `getDockerVersion` endpoint.
- Test unix socket on windows, may need to do something else.
- Divide app state into two parts (showing notebook/no notebook)