FROM ubuntu:xenial

RUN apt update && \
    apt install -y software-properties-common && \
    add-apt-repository ppa:mscore-ubuntu/mscore-stable -y && \
    add-apt-repository ppa:jonathonf/python-3.6 -y && \
    apt update && \
    apt install musescore python3.6 -y

RUN apt install python3-pip -y && \
    sudo pip3 install -r requirements.txt

CMD "FLASK_APP=/app/main.py FLASK_DEBUG=1 python3 -m flask run"
