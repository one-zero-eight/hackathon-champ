/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
    "/users/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Me
         * @description Get current user info if authenticated
         */
        get: operations["users_get_me"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Register By Credentials
         * @description Register using credentials
         */
        post: operations["users_register_by_credentials"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Login By Credentials
         * @description Login using credentials
         */
        post: operations["users_login_by_credentials"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Logout
         * @description Logout (clear session)
         */
        post: operations["users_logout"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/events/random-event": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Random Event */
        get: operations["events_get_random_event"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/events/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get All Events
         * @description Get info about all events.
         */
        get: operations["events_get_all_events"];
        put?: never;
        /**
         * Create Many Events
         * @description Create multiple events.
         */
        post: operations["events_create_many_events"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/events/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Event
         * @description Get info about one event.
         */
        get: operations["events_get_event"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/events/search": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Search Events
         * @description Search events.
         */
        post: operations["events_search_events"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/events/search/count": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Count Events
         * @description Count filtered events.
         */
        post: operations["events_count_events"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/events/search/count-by-month": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Count Events By Month
         * @description Count filtered events by months.
         */
        post: operations["events_count_events_by_month"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/events/search/filters/locations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get All Filters Locations
         * @description Get all locations.
         */
        get: operations["events_get_all_filters_locations"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/events/search/filters/disciplines": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get All Filters Disciplines
         * @description Get all disciplines.
         */
        get: operations["events_get_all_filters_disciplines"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/events/search/share": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Share Selection
         * @description Share selection. Use this for .ics too.
         */
        post: operations["events_share_selection"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/events/search/share/{selection_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Selection
         * @description Get selection.
         */
        get: operations["events_get_selection"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/events/search/share/{selection_id}/.ics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Selection Ics */
        get: operations["events_get_selection_ics"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** Body_events_search_events */
        Body_events_search_events: {
            filters: components["schemas"]["Filters"];
            sort: components["schemas"]["Sort"];
            pagination: components["schemas"]["Pagination"];
        };
        /** Body_events_share_selection */
        Body_events_share_selection: {
            filters: components["schemas"]["Filters"];
            sort: components["schemas"]["Sort"];
        };
        /** DateFilter */
        DateFilter: {
            /** Start Date */
            start_date?: string | null;
            /** End Date */
            end_date?: string | null;
        };
        /** DisciplinesFilterVariants */
        DisciplinesFilterVariants: {
            /** Sport */
            sport: string;
            /** Disciplines */
            disciplines: string[];
        };
        /** Event */
        "Event-Input": {
            /**
             * Id
             * @description MongoDB document ObjectID
             * @example 5eb7cf5a86d9755df3a6c593
             */
            _id?: string;
            /**
             * Host Federation
             * @description Федерация, организующая мероприятие (None - для парсинга со стороны разработчиков)
             */
            host_federation?: string | null;
            /**
             * Title
             * @description Наименование спортивного мероприятия
             */
            title: string;
            /**
             * Description
             * @description Описание
             */
            description?: string | null;
            /** @description Пол участников (None - любой) */
            gender?: components["schemas"]["Gender"] | null;
            /**
             * Age Min
             * @description Минимальный возраст участников
             */
            age_min?: number | null;
            /**
             * Age Max
             * @description Максимальный возраст участников
             */
            age_max?: number | null;
            /**
             * Sport
             * @description Название вида спорта
             */
            sport: string;
            /**
             * Discipline
             * @description Названия дисциплин
             */
            discipline: string[];
            /**
             * Start Date
             * Format: date-time
             * @description Дата начала
             */
            start_date: string;
            /**
             * End Date
             * Format: date-time
             * @description Дата конца
             */
            end_date: string;
            /**
             * Location
             * @description Места проведения
             */
            location: components["schemas"]["EventLocation"][];
            /**
             * Participant Count
             * @description Количество участников
             */
            participant_count?: number | null;
            /**
             * Ekp Id
             * @description № СМ в ЕКП
             */
            ekp_id?: number | null;
            /**
             * Page
             * @description Страница в ЕКП
             */
            page?: number | null;
        };
        /** Event */
        "Event-Output": {
            /**
             * Id
             * Format: objectid
             * @description MongoDB document ObjectID
             * @default None
             * @example 5eb7cf5a86d9755df3a6c593
             */
            id: string;
            /**
             * Host Federation
             * @description Федерация, организующая мероприятие (None - для парсинга со стороны разработчиков)
             */
            host_federation: string | null;
            /**
             * Title
             * @description Наименование спортивного мероприятия
             */
            title: string;
            /**
             * Description
             * @description Описание
             */
            description: string | null;
            /** @description Пол участников (None - любой) */
            gender: components["schemas"]["Gender"] | null;
            /**
             * Age Min
             * @description Минимальный возраст участников
             */
            age_min: number | null;
            /**
             * Age Max
             * @description Максимальный возраст участников
             */
            age_max: number | null;
            /**
             * Sport
             * @description Название вида спорта
             */
            sport: string;
            /**
             * Discipline
             * @description Названия дисциплин
             */
            discipline: string[];
            /**
             * Start Date
             * Format: date-time
             * @description Дата начала
             */
            start_date: string;
            /**
             * End Date
             * Format: date-time
             * @description Дата конца
             */
            end_date: string;
            /**
             * Location
             * @description Места проведения
             */
            location: components["schemas"]["EventLocation"][];
            /**
             * Participant Count
             * @description Количество участников
             */
            participant_count: number | null;
            /**
             * Ekp Id
             * @description № СМ в ЕКП
             */
            ekp_id: number | null;
            /**
             * Page
             * @description Страница в ЕКП
             */
            page: number | null;
        };
        /** EventLocation */
        EventLocation: {
            /**
             * Country
             * @description Название страны
             */
            country: string;
            /**
             * Region
             * @description Название региона
             */
            region?: string | null;
            /**
             * City
             * @description Название города
             */
            city?: string | null;
        };
        /**
         * Filters
         * @description Список фильтров, которые применяются через И
         */
        Filters: {
            /** Query */
            query?: string | null;
            date?: components["schemas"]["DateFilter"] | null;
            /** Discipline */
            discipline?: string[] | null;
            /** Location */
            location?: components["schemas"]["LocationFilter"][] | null;
            gender?: components["schemas"]["Gender"] | null;
            age?: components["schemas"]["MinMaxFilter"] | null;
            participant_count?: components["schemas"]["MinMaxFilter"] | null;
            /** By Ids */
            by_ids?: string[] | null;
        };
        /**
         * Gender
         * @enum {string}
         */
        Gender: "male" | "female";
        /** HTTPValidationError */
        HTTPValidationError: {
            /** Detail */
            detail?: components["schemas"]["ValidationError"][];
        };
        /** LocationFilter */
        LocationFilter: {
            /** Country */
            country: string;
            /** Region */
            region?: string | null;
            /** City */
            city?: string | null;
        };
        /** LocationsFilterVariants */
        LocationsFilterVariants: {
            /** Country */
            country: string;
            /** Regions */
            regions: components["schemas"]["RegionsFilterVariants"][];
        };
        /** MinMaxFilter */
        MinMaxFilter: {
            /** Min */
            min?: number | null;
            /** Max */
            max?: number | null;
        };
        /**
         * Order
         * @enum {string}
         */
        Order: "asc" | "desc";
        /** Pagination */
        Pagination: {
            /** Page Size */
            page_size: number;
            /** Page No */
            page_no: number;
        };
        /** RegionsFilterVariants */
        RegionsFilterVariants: {
            /** Region */
            region: string | null;
            /** Cities */
            cities: string[];
        };
        /** SearchEventsResponse */
        SearchEventsResponse: {
            filters: components["schemas"]["Filters"];
            sort: components["schemas"]["Sort"];
            pagination: components["schemas"]["Pagination"];
            /** Page */
            page: number;
            /** Pages Total */
            pages_total: number;
            /** Events */
            events: components["schemas"]["Event-Output"][];
        };
        /** Selection */
        Selection: {
            /**
             * Id
             * Format: objectid
             * @description MongoDB document ObjectID
             * @default None
             * @example 5eb7cf5a86d9755df3a6c593
             */
            id: string;
            /** @description Filter for the selection. */
            filters: components["schemas"]["Filters"];
            /**
             * @description Sort for the selection.
             * @default {}
             */
            sort: components["schemas"]["Sort"];
        };
        /** Sort */
        Sort: {
            date?: components["schemas"]["Order"] | null;
            age?: components["schemas"]["Order"] | null;
            participant_count?: components["schemas"]["Order"] | null;
        };
        /** ValidationError */
        ValidationError: {
            /** Location */
            loc: (string | number)[];
            /** Message */
            msg: string;
            /** Error Type */
            type: string;
        };
        /** ViewUser */
        ViewUser: {
            /**
             * Id
             * @example 5eb7cf5a86d9755df3a6c593
             */
            id: string;
            /** Login */
            login: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type SchemaBodyEventsSearchEvents = components['schemas']['Body_events_search_events'];
export type SchemaBodyEventsShareSelection = components['schemas']['Body_events_share_selection'];
export type SchemaDateFilter = components['schemas']['DateFilter'];
export type SchemaDisciplinesFilterVariants = components['schemas']['DisciplinesFilterVariants'];
export type SchemaEventInput = components['schemas']['Event-Input'];
export type SchemaEventOutput = components['schemas']['Event-Output'];
export type SchemaEventLocation = components['schemas']['EventLocation'];
export type SchemaFilters = components['schemas']['Filters'];
export type SchemaGender = components['schemas']['Gender'];
export type SchemaHttpValidationError = components['schemas']['HTTPValidationError'];
export type SchemaLocationFilter = components['schemas']['LocationFilter'];
export type SchemaLocationsFilterVariants = components['schemas']['LocationsFilterVariants'];
export type SchemaMinMaxFilter = components['schemas']['MinMaxFilter'];
export type SchemaOrder = components['schemas']['Order'];
export type SchemaPagination = components['schemas']['Pagination'];
export type SchemaRegionsFilterVariants = components['schemas']['RegionsFilterVariants'];
export type SchemaSearchEventsResponse = components['schemas']['SearchEventsResponse'];
export type SchemaSelection = components['schemas']['Selection'];
export type SchemaSort = components['schemas']['Sort'];
export type SchemaValidationError = components['schemas']['ValidationError'];
export type SchemaViewUser = components['schemas']['ViewUser'];
export type $defs = Record<string, never>;
export interface operations {
    users_get_me: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Current user info */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ViewUser"];
                };
            };
            /** @description Unable to verify credentials OR Credentials not provided */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    users_register_by_credentials: {
        parameters: {
            query: {
                login: string;
                password: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successfully registered */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Unable to verify credentials OR Credentials not provided */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    users_login_by_credentials: {
        parameters: {
            query: {
                login: string;
                password: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successfully logged in (session updated) */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Unable to verify credentials OR Credentials not provided */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    users_logout: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successfully logged out (session cleared) */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Unable to verify credentials OR Credentials not provided */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    events_get_random_event: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Event-Output"];
                };
            };
            /** @description Unable to verify credentials OR Credentials not provided */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    events_get_all_events: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Info about all events */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Event-Output"][];
                };
            };
            /** @description Unable to verify credentials OR Credentials not provided */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    events_create_many_events: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Event-Input"][];
            };
        };
        responses: {
            /** @description Create many events */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": boolean;
                };
            };
            /** @description Unable to verify credentials OR Credentials not provided */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    events_get_event: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Info about event */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Event-Output"];
                };
            };
            /** @description Unable to verify credentials OR Credentials not provided */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Event not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    events_search_events: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Body_events_search_events"];
            };
        };
        responses: {
            /** @description Search events */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SearchEventsResponse"];
                };
            };
            /** @description Unable to verify credentials OR Credentials not provided */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    events_count_events: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Filters"];
            };
        };
        responses: {
            /** @description Count events */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": number;
                };
            };
            /** @description Unable to verify credentials OR Credentials not provided */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    events_count_events_by_month: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Filters"];
            };
        };
        responses: {
            /** @description Count events by months */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: number;
                    };
                };
            };
            /** @description Unable to verify credentials OR Credentials not provided */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    events_get_all_filters_locations: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description All locations */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LocationsFilterVariants"][];
                };
            };
            /** @description Unable to verify credentials OR Credentials not provided */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    events_get_all_filters_disciplines: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description All disciplines */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DisciplinesFilterVariants"][];
                };
            };
            /** @description Unable to verify credentials OR Credentials not provided */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    events_share_selection: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Body_events_share_selection"];
            };
        };
        responses: {
            /** @description Share selection */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Selection"];
                };
            };
            /** @description Unable to verify credentials OR Credentials not provided */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    events_get_selection: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                selection_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Get selection */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Selection"];
                };
            };
            /** @description Unable to verify credentials OR Credentials not provided */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Selection not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    events_get_selection_ics: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                selection_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Get selection in .ics format */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unable to verify credentials OR Credentials not provided */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Selection not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
}
