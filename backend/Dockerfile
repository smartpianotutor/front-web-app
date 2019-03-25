FROM ubuntu:xenial

RUN apt update && \
    apt install -y software-properties-common && \
    add-apt-repository ppa:mscore-ubuntu/mscore-stable -y && \
    add-apt-repository ppa:jonathonf/python-3.6 -y && \
    apt update && \
    apt install musescore python3.6 python3-pip -y

RUN mkdir /backend
COPY requirements.txt /backend
WORKDIR /backend

RUN pip3 install -r requirements.txt

RUN apt install locales -y
RUN sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && \
    dpkg-reconfigure --frontend=noninteractive locales && \
    update-locale LANG=en_US.UTF-8

ENV LANG en_US.UTF-8
ENV FLASK_APP=pianotutor
ENV FLASK_ENV=development
ENV FLASK_DEBUG 1

CMD ["python3", "-m", "flask", "run", "-h", "0.0.0.0"]
