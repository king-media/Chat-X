export interface IFormSubmitEvent extends SubmitEvent {
    target: SubmitEvent['target'] & { elements: HTMLFormControlsCollection }
}