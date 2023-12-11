# Chat-X (Whatsapp Clone)

The purpose of this project is to improve not only my fullstack skills but mainly my understanding of cloud infrastructure and services. The goal is to pass a few AWS certs while also increasing my working understanding of CI/CD pipelines and tooling.

# Table of Contents

1. [The Frontend App](#the-frontend-app)
2. [The Backend App](#the-backend-app)
3. [CI/CD](#cicd)
4. [Install & Usage](#install--usage)

## The Frontend App

The frontend consists of HTML, CSS, and JS with the use of Vite for the dev server and bundling. Eventually the stack may include a Framework/library such as React. For now, the aim was to challenge myself to rely on vanilla JS (ignore the typescript who uses JS without it anyway) and web standards that work great. I was also curious about how Frameworks do what they do and if I could understand the underlying magic that makes Frameworks great. So how will I manage routing of a SPA in JS? What about managing state? What about other dynamic characteristics and functionality that comes with today's SPAs? How will my simple JS solution scale?

Find out more about the Frontend here in this [README.md](./app/frontend/README.MD).

## The Backend App

The backend is simple, at least for v1. It's a Node Express app. Yep, that's pretty much all there is to it. I go further in depth about the backend architecture and setup as well as the AWS services I use. I even go into how the services are setup and why. Checkout the backend [README.md](./app/backend/README.md)

## CI/CD

WILL UPDATE ONCE CI/CD Pipeline is established.

## Install & Usage

### Prerequisites

Make sure you have Node v20+ installed. You will also need [PNPM](https://pnpm.io/installation) installed globally as well.

### Initial Setup

Clone the repo and CD into the project

    git clone https://github.com/king-media/Chat-X.git && cd whatsapp-clone

Go ahead and install all the necessary packages.

    pnpm install

That's pretty much now to quickly view the app run:

    pnpm dev

Visit the localhost printed out on your terminal by default it should be localhost:5173
**If for whatever reason you have to run the Vite dev server on a different port you will have to manually pass the PORT as an env variable to the backend service. See the package.json inside of "/app/backend" for scripts.**

### Workspaces

The [pnpm-workspace.yaml](./pnpm-workspace.yaml) file holds all workspace information.

1. **app/**: This workspace holds the two main applications which are the _@whatsapp/backend_ (backend app) and _@whatsapp/frontend_ (frontend app).
2. **packages/**: These are shared packages between the two apps.
3. **.github/actions**: I will be using GitHub Actions for all CI/CD purposes. So some of the individual actions will be placed here.
4. **templates/**: App and packages templates.
5. **tooling/**: Tooling packages that help out with CI, configs and more.
