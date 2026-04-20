FROM golang:1.23-alpine AS builder

WORKDIR /app

RUN go install willnorris.com/go/imageproxy/cmd/imageproxy@latest

FROM alpine:latest

WORKDIR /app

COPY --from=builder /go/bin/imageproxy /app/imageproxy

ENTRYPOINT ["/app/imageproxy"]
CMD ["-addr", "0.0.0.0:8080"]
