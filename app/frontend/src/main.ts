import DOMPurify from 'dompurify'

type RouteModule = {
  default: (params?: Record<string, string>) => Promise<string> | string
}
type Route = {
  path: string
  component: (params?: Record<string, string>) => Promise<string> | string
}

const ERROR_PAGES: Record<string, RouteModule> = import.meta.glob(
  './routes/(_404|_500).ts',
  { eager: true }
)

const ROUTES: Record<string, RouteModule> = import.meta.glob(
  './routes/**/[a-z[]*.ts',
  { eager: true }
)

const errorRoutes: Route[] = Object.keys(ERROR_PAGES).map((route) => {
  const path = route.replace('./', '').replace(/routes\/|\.ts$/g, '')

  return { path, component: ERROR_PAGES[route]?.default }
}, {})

const router = async () => {
  const routeParams: Record<string, string> = {}

  const routes: Route[] = Object.keys(ROUTES).map((route) => {
    const path = route
      .replace('./', '')
      .replace(/routes|index|\.ts$/g, '')
      .replace(/\[\.{3}.+\]/, '*')
      .replace(/\[(.+)\]/, ':$1')

    return { path, component: ROUTES[route]?.default }
  })

  const potentialMatches = routes.map((route) => {
    const urlPathSegments = location.pathname.split('/').slice(1)
    const routePathSegments = route.path.split('/').slice(1)

    let isMatch: boolean

    if (urlPathSegments.length !== routePathSegments.length) {
      isMatch = false
    }

    isMatch = routePathSegments.every((routePathSegment, i) => {
      return (
        routePathSegment === urlPathSegments[i] ||
        routePathSegment[0] === ':' ||
        routePathSegment[0] === '*'
      )
    })

    if (isMatch) {
      routePathSegments.forEach((segment, i) => {
        if (segment[0] === ':' || segment[0] === '*') {
          const propName = segment.slice(1)
          routeParams[propName] = decodeURIComponent(urlPathSegments[i])
        }
      })
    }

    return { route, isMatch }
  })

  let match = potentialMatches.find((potentialMatch) => potentialMatch.isMatch)

  const grabErrorRoute = (errorPage: '_404' | '_500' = '_404') =>
    errorRoutes.find((route) => route.path === errorPage) as Route

  // Return 404 if no match
  if (!match) {
    match = {
      route: grabErrorRoute(),
      isMatch: true,
    }
  }

  const app = document.querySelector('#app') as HTMLDivElement

  try {
    app.innerHTML =
      DOMPurify.sanitize(await match?.route.component(routeParams)) ||
      DOMPurify.sanitize(await grabErrorRoute()?.component(routeParams))
  } catch (e) {
    console.log(e)
    const errorComponent = await grabErrorRoute('_500')?.component(routeParams)

    app.innerHTML = DOMPurify.sanitize(errorComponent)
  }
}

const navigateTo = (url: string) => {
  history.pushState(null, '', url)
  router()
}

window.addEventListener('popstate', router)

document.addEventListener('DOMContentLoaded', () => {
  // Handle App navigation
  document.body.addEventListener('click', (e) => {
    //@ts-expect-error this is on the object
    if (e.target?.matches('[data-link]')) {
      e.preventDefault()
      //@ts-expect-error this is on the object
      navigateTo(e.target.href)
    }
  })

  router()
})
