import '@testing-library/jest-dom/vitest';

const createStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
};

const storageMock = createStorageMock();
Object.defineProperty(window, 'localStorage', {
  value: storageMock,
  configurable: true,
});
Object.defineProperty(globalThis, 'localStorage', {
  value: storageMock,
  configurable: true,
});

globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

window.HTMLElement.prototype.hasPointerCapture = () => false;
window.HTMLElement.prototype.setPointerCapture = () => {};
window.HTMLElement.prototype.releasePointerCapture = () => {};
window.HTMLElement.prototype.scrollIntoView = () => {};

window.Element.prototype.hasPointerCapture = () => false;
window.Element.prototype.setPointerCapture = () => {};
window.Element.prototype.releasePointerCapture = () => {};
window.Element.prototype.scrollIntoView = () => {};
