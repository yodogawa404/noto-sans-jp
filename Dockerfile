FROM debian:trixie

RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get install -y nodejs npm libharfbuzz-bin woff2

CMD ["sh", "-c","cd /work/projects/generator && npm i && node index.js"]