FROM node:24-bookworm-slim

RUN corepack enable && corepack prepare pnpm@11.0.0 --activate

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

CMD ["bash"]