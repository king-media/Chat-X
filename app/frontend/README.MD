# Chat-X Frontend

This is the front end code for my What's App clone app (Chat-X)

# Table of Contents

1. [Architecture](#architecture)
2. [Why This Design](#why-this-design)
3. [Thoughts & Concerns](#thoughts--concerns)
4. [Install & Usage](#install--usage)

## Architecture

> **There will be two environments:**
>
> 1. Prod which will obviously run the production build and services in the correct production environment.
> 2. Staging which will run a Dev/stable build and services that will run in a test or staging environment. I will be the only one with access to all staging resources/services. This will serve for all testing and QA screening before deploying the production version.

**Below is a brief outline of the FE stack including a list of services/resources that will be used.**

- [Typescript](https://www.typescriptlang.org/):
  TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.

> Ok so I know the project is supposed to at least start out as vanilla as possible but its currently 2023 who uses plain JS without Typescript?
> Also, Typescript is "technically" not a framework and I did say NO FRAMEWORKS will be used.
> Typescript allows you to safely code and trust your JS (for the most part). I also really enjoy the benefits and features.

- [Vite](https://vitejs.dev/): Frontend Dev tool
  > Ok technically this is a dev/build tool and not a framework. I need this in order to do a few extra things with JS modules that you can't typically do without some additional work. I don't necessarily need Vite to build my TS files but for optimized bundling of said TS files I need Vite. Besides, just bundling Vite allows me to create my own filesystem routing (more on later). Vite also gives me the ability to import CSS and other assets into my JS directly where I need to use them. Because I can import CSS into JS I can utilize [Postcss](https://postcss.org/)
  > Checkout Vite and do a deep dive into the tool! It's really amazing!

Outside of HTML, CSS, and JS that's pretty much it. Again, I didn't want to bring in frameworks and to many dependencies. I wanted to be as bare bones as possible. A lot of magic that we see frameworks perform I had to think about and formulate a strategy to achieve the same thing. I really am learning a lot from taking this challenge on. In the design section below I will discuss a lot of key things that just work in most frameworks. Usually, you are locked into a paradigm and preset rules and patterns when utilizing a framework. One of things I took for granted was not really worrying about state management, routing and how state/route changes updates the DOM.

DOM management and rendering has to be done correctly or you will run into PLENTY of problems (trust me). React taught me to just write some JSX and make sure my functional components actually return a React.Component or React.Element and boom things just work via virtual DOM & DOM diffing. Welp, with just JS (and Typescript) you have to come with your own safeguards, logic and patterns around DOM manipulation. So I am sure that I have made a plethora of mistakes in this department but it can only get better from here right? With all this being said, let's discuss the design.

### Why This Design

The purpose of this App was to improve my Fullstack & DevOps prowess. The core focus was not necessarily on the FE portion but the BE and infrastructure. This entire setup will involve the AWS ecosystem because I am going for a few AWS certs. In the future, projects I wish to build at scale wil involve further planning of what resources I wish to use instead of being locked into one platform. With the previous being stated, that has effected the rest of the architecture tremendously. This includes how the CI/CD pipeline and automation are handled. To achieve the desired outcome of having a long-term project that I can constantly learn from, I need the setup to be as simple and hassle-free as possible but within the realm of AWS.

This is why a simple JS app for now is all I need. Yes I would've gotten up and running faster if I used React but where is the fun and learning in that. Plus, I recently that after 5 years of programming I have barely scratched the services. I never stopped and asked, how does this work and why? Instead of allowing frameworks and my job to hold my hand I finally decided to challenge myself. So NO FRAMEWORKS for now. Another thing to consider is that the browser, web standards and just plain JS are all well oiled machines that work great together. JS and the browser are extremely fast what made everything slow was us over saturating our dependency lists. I also, wanted to break out of the mentality that "everything looks like a nail." I only know Javascript and the web through React lens. I honestly think that's not good and like Kyle Simpson said I don't know JS and I would like to change that.

- #### Routing

If you ever used Next.js or Nuxt.js you know that routing isn't done in the traditional way. Before using these fullstack frameworks for example let's refer to Next.js, you had to use React-router typically for routing. You would need to create a config file to setup your router and explicitly add your routes manually. It would look similar to:

```jsx
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <div>Hello world!</div>,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
```

[source for above code](https://reactrouter.com/en/main/start/tutorial)

As you can see we manually specify the "/" (home) path and what element or component to render. Imagine having multiple pages for your app. You would have to manually add those routes. In a real full fledge app you would also have nested routes, dynamic routes and wildcard routes. A process like this could be very tedious so a fix would be to configure a dynamic way to add routes. Without going to deep, Next.js just gives you the ability to add static files and the routes are magically created. This is considered a "file-system based router". I wanted a similar feature for my application. So how did I do that with "vanilla" js?

**File System Routing**

My entry file that vite looks for in order to bundle everything is `frontend/src/main.ts`. I decided to do my route configuration inside of the entry file. So the goal is to dynamically add routes based on the "routes" folder (`frontend/src/routes/*`). There are a few key things that need to be done in order for this to work.

1. Import all routes from the root Route folder and create route matches based on the relative file path and `location.pathname`

- So for example `routes/index.ts` matches to `location.pathname = "/"` and will render "x" component.

```ts
export type Route = {
  path: string
  component: RouteModule['default']
}

const index: Route = {
    path: "/",
    component: () => { return html Node }
}

```

2. The above logic must also account for dynamic, nested and segment or wildcard routes

- Based on the folder structure and names of the folders we can define how to handle these route cases.
  We essentially need a regex in order to build the match path. For example: folder `routes/chat/[chat-id]` must match with the path -> /chat/1234.

3. So with the route modules imported and their match paths defined the next step would be the logic necessary to match `location.pathname` to the correct "route path".

- I essentially map over each dynamically created route and create segments to filter through. If all parts of the route path and location path match then we have the correct module to render.

```ts
const urlPathSegments = location.pathname.split("/").slice(1);
const routePathSegments = route.path.split("/").slice(1);

//... logic to check each segment
```

4. Finally, I render the component (module) into `div#app` which is my root element.

So that's great but what about error handling, authentication before entering a route, and how do I handle navigation links? Answers to these questions lie within [frontend/src/main.ts](src/main.ts). I just wanted to quickly go over a high-level look at my file based routing system. Please, check the entry file out! I think it is pretty cool what I did.

- #### State & DOM Management

So initially rendering the correct component is cool and all but what good is a static SPA? I'm sure you know that when a user interacts with the site they are changing **state** which then effects what the site renders. SPA's and websites in general, are typically dynamic these days. So how do I achieve something React does with the "Virtual DOM"? How do I manage global application state and local page & component state? How can this state change trigger rerendering?

Welp, I haven't fully figured all of that out yet. So I do have to "manually" call a function to update the DOM whenever state changes but I did come up with a decent strategy and pattern as of December 18th, 2023. So let's go over a few key things.

1. Just because state changes doesn't mean we need to reevaluate the page and recall APIs.

- Yes, you typically make API calls in order to set initial data for the page but those API calls may not need to be called on every update.
  In React you have the option to encapsulate logic in a `useEffect()`. The useEffect takes a second argument that allows you to define dependencies. This, along with other reasons, is why API calls are typically made within useEffects. You can tell React to run the API call logic once on initial mount or render. I need to achieve something similar.

2. Sometimes you do need the page to reevaluate and update state based on what comes back from an API call. React-router or the fullstack framework magically takes care of this for you.

3. All props & state tied to the page should trigger a rerender when updated.

- Simply put page state changes the components rerender and update accordingly.

Ok so here is the pattern for now.

- If the page needs to reevaluate we use events. Add an event to the root element of the page and update logic based on that event. If a child component triggers this event, then event propagation will help ensure our root page catches this event. This is called event delegation.
  Ex:

```ts
const chatSelectedEvent = (e: Event) => {
  const eventName = "chatselected";
  // Using dataset or data attributes in order to achieve what I want.
  if (e.target.hasAttribute(`data-${eventName}`)) {
    // the event name holds necessary data but I'm careful not to expose too much because this will show inside of the HTML document.
    const chatId = e.target.dataset[eventName];
    const selectedChat = pageState.chatList?.find(
      (item) => item.chat.id === chatId
    );

    // call whatever API needed for page data here... and finally rerender
  }
};

pageRoot.addEventListener("click", chatSelectedEvent); // No matter where in the page node tree this event is fired it will be caught and handled within the page.
```

The other part of this is only updating components that receive page state when page state changes at any point. `ComponentA` or `ComponentB` can update page state but because both resulting Nodes are dependent on page state the update triggers a rerender for both components. For this I created my own `useState` hook that utilizes Proxy objects. For details you can view the hook [here](src/utils/helper.ts). I basically intercept all set calls and run a callback function on each change. This callback function is essentially a rerender function that expresses how the page should handle rerendering its dependent components.

Ex:

```ts
// useState returns the pageState object as a proxy object. The callback here will run on each state change.
const pageState = useState<ChatPageState>(initialState, async (state) => {
  const chatList = await ChatList({ pageState: state }); // Re call or rerender components that depend on this state change.
  const chatRoom = await ChatRoom({ pageState: state });

  root.querySelector("#home")?.replaceChildren(chatList, chatRoom);
});
```

I am pretty sure there are holes in both my routing and state patterns/logic and bugs filled within these holes. For now, this does the trick and gets me heading in the right direction (I think). In order to grasp what I discussed, walkthrough how the homepage is rendered and updated.

- #### Fetch API

How do I handle fetching data? I created a helper function that wraps the standard **Fetch API** and ensures credentials are passed and headers are properly set for every API call. If for whatever reason the call fails with a status code outside of 200, I will grab the server response and throw an error. At this point I have some options.

1. try/catch the error and do whatever I want within the module/component that made the API call.
2. Let the error get caught inside of `frontend/src/main.ts` and render the default 500 page.
3. Or if I am using `promise.allSettled` I can unwrap the response and inspect that data while ignoring any failures or handle those errors.

The choice is mine. You can view my `fetchAPI` function along with additional helpers [here](src/api/utilities/index.ts)

- #### Bundling & Tooling
  WILL UPDATE ONCE DEPLOYED
- #### Deploying
  NOT YET DEPLOYED
- #### Front End Service In Depth

### Thoughts & Concerns

## Install & Usage

- Follow install instructions [here](/README.md). If you already have the project installed and setup navigate to the frontend root
  $ cd app/frontend

- Run the start script. You can view other scripts inside of the [package.json](/app/frontend/package.json) file
  $ pnpm start

There ya go the app should be running on `localhost:5173`
