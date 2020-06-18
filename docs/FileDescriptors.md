# File Descriptors and communicating between processes

As the `tosbur` API makes requests to the Docker Engine API to create and start a container, how can we parse the output of the container?

## Definitions

When executing `docker run --rm -it image` we can see the output in the console because the we create an interactive shell with the `-it` options (explain).

Since `docker run` is really two API calls (create/start). This is how we would start a container:

```bash session
$ curl --unix-socket /var/run/docker.sock -H "Content-Type: application/json" \
  -d '{"Image": "python:3.8.3-slim-buster", "Cmd": ["echo", "hello world"]}' \
  -X POST http:/v1.40/containers/create
```

Can we attach `stdin` and `tty`? The `create` API allows these options:

```bash session
$ curl --unix-socket /var/run/docker.sock -H "Content-Type: application/json" \
  -d '{"Image": "python:3.8.3-slim-buster", "OpenStdin": "true", "Tty": "true", "Cmd": ["bash"]}' \
  -X POST http:/v1.40/containers/create
```
It appears this does keep the program from exiting, but the container is not created and thus no bash shell is started.

There are examples on SO of this working I believe.