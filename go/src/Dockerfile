FROM golang:1.16

WORKDIR /go/src/app
COPY ./twoRing .

RUN go get -d -v
RUN go build -v -o twoRing .

EXPOSE 80

ENTRYPOINT ./twoRing