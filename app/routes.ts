import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("donne/new", "routes/create-donne.tsx")
] satisfies RouteConfig;
