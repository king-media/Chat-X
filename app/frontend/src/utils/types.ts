import { RouteProps } from "~src/main";
import AppState from "~src/state"

declare global {
    interface ProxyConstructor {
        new <TSource extends object, TTarget extends object>(target: TSource, handler: ProxyHandler<TSource>): TTarget;
    }
}

export interface IFormSubmitEvent extends SubmitEvent {
    target: SubmitEvent['target'] & { elements: HTMLFormControlsCollection }
}

export type ComponentProps = {
    appState?: AppState;
    routeState?: RouteProps['routeParams'];
    pageState?: Record<string, unknown>;
}