FROM python:3.7.8-slim-buster

ARG REQ=requirements.txt

ARG NB_USER="alice"
ARG NB_UID="1000"
ARG NB_GID="100"

# WORKDIR /usr/src/app

COPY ./${REQ} ./


RUN useradd -m -s /bin/bash -g ${NB_GID} -u $NB_UID $NB_USER \
    && chown -R ${NB_USER}:${NB_GID} /usr/src/app

ENV PATH="/home/alice/.local/bin:$PATH"

USER ${NB_USER}

RUN pip install --no-cache-dir -r ${REQ}

USER root

# In order to install JupyterLab extensions, we need to have Node.js installed.
RUN apt-get update; \
    apt-get install -y --no-install-recommends wget; \
    wget -qO- https://deb.nodesource.com/setup_12.x | bash -; \
    apt-get install -y nodejs

USER ${NB_USER}

# TODO: Add nltk
# RUN python -m pip install --upgrade-strategy only-if-needed nltk==3.5 && \
#    python -m nltk.downloader punkt && \
#    python -m nltk.downloader wordnet

EXPOSE 8888

CMD [ "jupyter", "lab", "--ip=0.0.0.0", "--port=8888" ]
