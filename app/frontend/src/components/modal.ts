import '~src/assets/modal.css'

export type DialogProps = {
    children: Node;
    title: string;
    dismissText?: string;
    confirmText?: string;
    onDismiss?: () => void;
    onConfirm?: () => void;
}


const Modal = ({ children, title, ...props }: DialogProps) => {
    const cancelBtnId = "modal-cancel"
    const confirmBtnId = "modal-confirm"
    const app = document.querySelector('#app')
    const dialogElement = document.createElement('dialog')

    dialogElement.setAttribute('data-modal', '')
    dialogElement.setAttribute('class', 'modal')
    dialogElement.innerHTML =
        `   <div id="dialog-title-container">
                <h2 class="text-center">${title}</h2>
            </div>
            <div id="dialog-content">
            </div>
            <div id="modal-btn-container">
                <button id="modal-cancel" class="modal-btn">
                    ${props.dismissText || "Cancel"}
                </button>
                <button id="modal-confirm" class="modal-btn">
                    ${props.confirmText || "Confirm"}
                </button>
            </div>
        `;

    const modalHandler = (e: Event) => {
        if (e.target?.id === cancelBtnId) {
            app?.removeChild(dialogElement)
            props.onDismiss && props.onDismiss()
        }

        if (e.target?.id === confirmBtnId) {
            app?.removeChild(dialogElement)
            props.onConfirm && props.onConfirm()
        }
    }

    const cancelBtn = dialogElement.querySelector(`#${cancelBtnId}`)
    const confirmBtn = dialogElement.querySelector(`#${confirmBtnId}`)
    const dialogContent = dialogElement.querySelector('#dialog-content')

    dialogContent?.appendChild(children)
    cancelBtn?.addEventListener('click', modalHandler)
    confirmBtn?.addEventListener('click', modalHandler)

    app?.insertAdjacentElement('afterbegin', dialogElement)
    dialogElement.showModal()
}

export default Modal