/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as SearchImport } from './routes/search'
import { Route as ProfileImport } from './routes/profile'
import { Route as CalendarImport } from './routes/calendar'
import { Route as IndexImport } from './routes/index'
import { Route as EventsEventIdImport } from './routes/events/$eventId'
import { Route as AuthLoginImport } from './routes/auth/login'

// Create/Update Routes

const SearchRoute = SearchImport.update({
  id: '/search',
  path: '/search',
  getParentRoute: () => rootRoute,
} as any)

const ProfileRoute = ProfileImport.update({
  id: '/profile',
  path: '/profile',
  getParentRoute: () => rootRoute,
} as any)

const CalendarRoute = CalendarImport.update({
  id: '/calendar',
  path: '/calendar',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const EventsEventIdRoute = EventsEventIdImport.update({
  id: '/events/$eventId',
  path: '/events/$eventId',
  getParentRoute: () => rootRoute,
} as any)

const AuthLoginRoute = AuthLoginImport.update({
  id: '/auth/login',
  path: '/auth/login',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/calendar': {
      id: '/calendar'
      path: '/calendar'
      fullPath: '/calendar'
      preLoaderRoute: typeof CalendarImport
      parentRoute: typeof rootRoute
    }
    '/profile': {
      id: '/profile'
      path: '/profile'
      fullPath: '/profile'
      preLoaderRoute: typeof ProfileImport
      parentRoute: typeof rootRoute
    }
    '/search': {
      id: '/search'
      path: '/search'
      fullPath: '/search'
      preLoaderRoute: typeof SearchImport
      parentRoute: typeof rootRoute
    }
    '/auth/login': {
      id: '/auth/login'
      path: '/auth/login'
      fullPath: '/auth/login'
      preLoaderRoute: typeof AuthLoginImport
      parentRoute: typeof rootRoute
    }
    '/events/$eventId': {
      id: '/events/$eventId'
      path: '/events/$eventId'
      fullPath: '/events/$eventId'
      preLoaderRoute: typeof EventsEventIdImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/calendar': typeof CalendarRoute
  '/profile': typeof ProfileRoute
  '/search': typeof SearchRoute
  '/auth/login': typeof AuthLoginRoute
  '/events/$eventId': typeof EventsEventIdRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/calendar': typeof CalendarRoute
  '/profile': typeof ProfileRoute
  '/search': typeof SearchRoute
  '/auth/login': typeof AuthLoginRoute
  '/events/$eventId': typeof EventsEventIdRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/calendar': typeof CalendarRoute
  '/profile': typeof ProfileRoute
  '/search': typeof SearchRoute
  '/auth/login': typeof AuthLoginRoute
  '/events/$eventId': typeof EventsEventIdRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/calendar'
    | '/profile'
    | '/search'
    | '/auth/login'
    | '/events/$eventId'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/calendar'
    | '/profile'
    | '/search'
    | '/auth/login'
    | '/events/$eventId'
  id:
    | '__root__'
    | '/'
    | '/calendar'
    | '/profile'
    | '/search'
    | '/auth/login'
    | '/events/$eventId'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  CalendarRoute: typeof CalendarRoute
  ProfileRoute: typeof ProfileRoute
  SearchRoute: typeof SearchRoute
  AuthLoginRoute: typeof AuthLoginRoute
  EventsEventIdRoute: typeof EventsEventIdRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  CalendarRoute: CalendarRoute,
  ProfileRoute: ProfileRoute,
  SearchRoute: SearchRoute,
  AuthLoginRoute: AuthLoginRoute,
  EventsEventIdRoute: EventsEventIdRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/calendar",
        "/profile",
        "/search",
        "/auth/login",
        "/events/$eventId"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/calendar": {
      "filePath": "calendar.tsx"
    },
    "/profile": {
      "filePath": "profile.tsx"
    },
    "/search": {
      "filePath": "search.tsx"
    },
    "/auth/login": {
      "filePath": "auth/login.tsx"
    },
    "/events/$eventId": {
      "filePath": "events/$eventId.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
