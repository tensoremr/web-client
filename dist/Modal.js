import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ExclamationIcon } from "@heroicons/react/outline";
export default function Modal(props) {
    const cancelButtonRef = useRef(null);
    return (_jsx(Transition.Root, Object.assign({ show: props.open, as: Fragment }, { children: _jsx(Dialog, Object.assign({ as: "div", static: true, className: "fixed z-10 inset-0 overflow-y-auto", initialFocus: cancelButtonRef, open: props.open, onClose: props.onClose }, { children: _jsxs("div", Object.assign({ className: "flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0" }, { children: [_jsx(Transition.Child, Object.assign({ as: Fragment, enter: "ease-out duration-300", enterFrom: "opacity-0", enterTo: "opacity-100", leave: "ease-in duration-200", leaveFrom: "opacity-100", leaveTo: "opacity-0" }, { children: _jsx(Dialog.Overlay, { className: "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" }, void 0) }), void 0),
                    _jsx("span", Object.assign({ className: "hidden sm:inline-block sm:align-middle sm:h-screen", "aria-hidden": "true" }, { children: "\u200B" }), void 0),
                    _jsx(Transition.Child, Object.assign({ as: Fragment, enter: "ease-out duration-300", enterFrom: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95", enterTo: "opacity-100 translate-y-0 sm:scale-100", leave: "ease-in duration-200", leaveFrom: "opacity-100 translate-y-0 sm:scale-100", leaveTo: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" }, { children: _jsxs("div", Object.assign({ className: "inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" }, { children: [_jsx("div", Object.assign({ className: "bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4" }, { children: _jsxs("div", Object.assign({ className: "sm:flex sm:items-start" }, { children: [_jsx("div", Object.assign({ className: "mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-teal-100 sm:mx-0 sm:h-10 sm:w-10" }, { children: _jsx(ExclamationIcon, { className: "h-6 w-6 text-teal-600", "aria-hidden": "true" }, void 0) }), void 0),
                                            _jsxs("div", Object.assign({ className: "mt-3 text-center flex-1 sm:mt-0 sm:ml-4 sm:text-left" }, { children: [_jsx(Dialog.Title, Object.assign({ as: "h3", className: "text-lg leading-6 font-medium text-gray-900" }, { children: props.title }), void 0),
                                                    _jsx("div", Object.assign({ className: "mt-2 w-f" }, { children: props.description }), void 0)] }), void 0)] }), void 0) }), void 0),
                                _jsxs("div", Object.assign({ className: "bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse" }, { children: [_jsx("button", Object.assign({ type: "button", className: "w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm", onClick: () => props.onPositiveClick(), ref: cancelButtonRef }, { children: props.positive }), void 0),
                                        _jsx("button", Object.assign({ type: "button", className: "mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm", onClick: () => props.onNegativeClick() }, { children: props.negative }), void 0)] }), void 0)] }), void 0) }), void 0)] }), void 0) }), void 0) }), void 0));
}