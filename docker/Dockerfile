FROM python:3.7.8-slim-buster

ARG REQ=requirements.txt
ARG NB_USER="alice"
ARG NB_UID="1000"
ARG NB_GID="100"

WORKDIR /usr/src/app
COPY ./${REQ} ./

RUN useradd -m -s /bin/bash -g ${NB_GID} -u $NB_UID $NB_USER \
    && chown -R ${NB_USER}:${NB_GID} /usr/src/app

ENV PATH="/home/alice/.local/bin:$PATH"

USER ${NB_USER}

RUN pip install --no-cache-dir -r ${REQ}

EXPOSE 8888

CMD [ "jupyter", "notebook", "--ip=0.0.0.0", "--port=8888" ]